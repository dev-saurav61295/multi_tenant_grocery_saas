import "server-only";
import { mkdir, readFile, writeFile } from "fs/promises";
import { extname, join } from "path";
import { randomUUID } from "crypto";

const PUBLIC_ROOT = join(process.cwd(), "public", "uploads");
const PRIVATE_ROOT = join(process.cwd(), "private-uploads");

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

/** Saves a publicly-servable upload (product photos, avatars) under public/uploads and returns its URL path. */
export async function savePublicUpload(storeId: string, category: string, file: File): Promise<string> {
  const dir = join(PUBLIC_ROOT, storeId, category);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${safeExt(file)}`;
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${storeId}/${category}/${filename}`;
}

/** Saves a sensitive upload (payment-proof screenshots) outside public/ and returns a path relative to that store's private directory. */
export async function savePrivateUpload(storeId: string, category: string, file: File): Promise<string> {
  const dir = join(PRIVATE_ROOT, storeId, category);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}${safeExt(file)}`;
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `${category}/${filename}`;
}

export async function readPrivateUpload(storeId: string, relativePath: string): Promise<Buffer> {
  const safeStoreId = sanitizeSegments(storeId);
  const safePath = sanitizeSegments(relativePath);
  return readFile(join(PRIVATE_ROOT, safeStoreId, safePath));
}

export function contentTypeForPath(path: string): string {
  return CONTENT_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";
}
