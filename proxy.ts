import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleHome } from "@/lib/roles";
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
  const session = readSession(request);

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL(roleHome[session.role], request.nextUrl));
  }

  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (pathname.startsWith("/staff") && session?.role !== "staff") {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (pathname.startsWith("/delivery") && session?.role !== "delivery") {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if ((pathname === "/checkout" || pathname.startsWith("/order/")) && !session) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
