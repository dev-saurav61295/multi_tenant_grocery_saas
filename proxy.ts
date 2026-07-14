import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleHome } from "@/lib/roles";
import { RESERVED_STORE_SLUGS } from "@/lib/reserved-slugs";
import type { SessionPayload } from "@/lib/session";

function readSession(request: NextRequest): SessionPayload | null {
  const raw = request.cookies.get("session")?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const urlStoreSlug = segments[0];
  const session = readSession(request);

  const isStoreRoute = Boolean(urlStoreSlug) && !RESERVED_STORE_SLUGS.includes(urlStoreSlug as (typeof RESERVED_STORE_SLUGS)[number]);

  if (!isStoreRoute) {
    return NextResponse.next();
  }

  if ((segments.length === 2 && (segments[1] === "login" || segments[1] === "register")) && session) {
    return NextResponse.redirect(new URL(roleHome(session.storeSlug, session.role), request.nextUrl));
  }

  const requiresAuth = segments[1] === "admin" || segments[1] === "staff" || segments[1] === "delivery" || segments[1] === "checkout" || (segments[1] === "order" && Boolean(segments[2]));

  if (requiresAuth && (!session || session.storeSlug !== urlStoreSlug)) {
    return NextResponse.redirect(new URL(`/${urlStoreSlug}/login`, request.nextUrl));
  }

  if (segments[1] === "admin" && session?.role !== "admin") {
    return NextResponse.redirect(new URL(`/${urlStoreSlug}/login`, request.nextUrl));
  }

  if (segments[1] === "staff" && session?.role !== "staff") {
    return NextResponse.redirect(new URL(`/${urlStoreSlug}/login`, request.nextUrl));
  }

  if (segments[1] === "delivery" && session?.role !== "delivery") {
    return NextResponse.redirect(new URL(`/${urlStoreSlug}/login`, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
