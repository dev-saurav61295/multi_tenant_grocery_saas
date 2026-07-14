import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { contentTypeForPath, readPrivateUpload } from "@/lib/storage";

const ALLOWED_ROLES = ["admin", "staff", "delivery"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string; path: string[] }> }
) {
  const { storeId, path } = await params;
  const session = await getSession();

  if (!session || session.storeId !== storeId) {
    return new Response("Not found", { status: 404 });
  }

  if (!ALLOWED_ROLES.includes(session.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const relativePath = path.join("/");

  try {
    const buffer = await readPrivateUpload(storeId, relativePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeForPath(relativePath),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
