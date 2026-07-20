import type { NextRequest } from "next/server";
import { contentTypeForPath, readPublicUpload } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const relativePath = path.join("/");

  try {
    const buffer = await readPublicUpload(relativePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeForPath(relativePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
