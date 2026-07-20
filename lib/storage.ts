import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import { extname, join } from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

function getStorageRoot(): string {
  if (process.env.STORAGE_DIR) {
    return process.env.STORAGE_DIR;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.cwd().startsWith("/var/task")) {
    return "/tmp";
  }
  return process.cwd();
}

function getPublicRoot(): string {
  return join(getStorageRoot(), "public", "uploads");
}

function getPrivateRoot(): string {
  return join(getStorageRoot(), "private-uploads");
}

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

function safeExt(file: File) {
  const ext = extname(file.name).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}

function sanitizeSegments(relativePath: string) {
  return relativePath
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== "." && segment !== "..")
    .join("/");
}

/** Saves a publicly-servable upload (product photos, avatars) to Supabase Storage if configured, or under public/uploads as fallback. */
export async function savePublicUpload(storeId: string, category: string, file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "bhagwan_das";

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const filename = `${storeId}/${category}/${randomUUID()}${safeExt(file)}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const contentType = file.type || contentTypeForPath(filename);

      const { error } = await supabase.storage.from(bucket).upload(filename, buffer, {
        contentType,
        upsert: true,
      });

      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.error("Supabase Storage upload error, falling back to filesystem:", error.message);
      }
    } catch (error) {
      console.error("Supabase Storage exception, falling back to filesystem:", error);
    }
  }

  const dir = join(getPublicRoot(), storeId, category);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${safeExt(file)}`;
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${storeId}/${category}/${filename}`;
}

/** Saves a sensitive upload (payment-proof screenshots) outside public/ and returns a path relative to that store's private directory. */
export async function savePrivateUpload(storeId: string, category: string, file: File): Promise<string> {
  const dir = join(getPrivateRoot(), storeId, category);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${safeExt(file)}`;
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `${category}/${filename}`;
}

export async function readPrivateUpload(storeId: string, relativePath: string): Promise<Buffer> {
  const safeStoreId = sanitizeSegments(storeId);
  const safePath = sanitizeSegments(relativePath);
  return readFile(join(getPrivateRoot(), safeStoreId, safePath));
}

export async function readPublicUpload(relativePath: string): Promise<Buffer> {
  const safePath = sanitizeSegments(relativePath);
  return readFile(join(getPublicRoot(), safePath));
}

export function contentTypeForPath(path: string): string {
  return CONTENT_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
}
