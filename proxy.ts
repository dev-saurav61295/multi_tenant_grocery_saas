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
  const { pathname, search } = request.nextUrl;

  // 1. Extract hostname from request headers (or nextUrl.hostname)
  // Strip port if present (e.g., localhost:3000 -> localhost)
  const hostHeader = request.headers.get("host") || request.nextUrl.hostname;
  const hostname = hostHeader.split(":")[0].toLowerCase();

  // 2. Custom Tenant Domain Routing
  // If request comes from custom domain bhagwandas.shop or www.bhagwandas.shop,
  // silently rewrite to /bhagwandas-traders/[...path] without changing browser bar URL
  const isCustomDomain = hostname === "bhagwandas.shop" || hostname === "www.bhagwandas.shop";

  if (isCustomDomain) {
    // Avoid double-rewriting if pathname already starts with /bhagwandas-traders or system paths
    if (
      !pathname.startsWith("/bhagwandas-traders") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/uploads") &&
      !pathname.startsWith("/signup")
    ) {
      const rewriteUrl = new URL(
        `/bhagwandas-traders${pathname === "/" ? "" : pathname}${search}`,
        request.url
      );

      // Perform silent rewrite while preserving headers and underlying routing
      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set("x-tenant-slug", "bhagwandas-traders");
      return response;
    }
  }

  // 3. Standard Path-Based Tenant & Role Access Control
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
  // Matcher configuration:
  // Exclude API routes (/api/*), Next.js internal static assets (/_next/static/*, /_next/image/*),
  // PWA/metadata files (favicon.ico, manifest.webmanifest, sw.js, offline), and common static asset extensions
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|offline|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
