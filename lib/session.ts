import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AppUser, Role } from "@/lib/users";

const COOKIE_NAME = "session";

export type SessionPayload = Pick<AppUser, "id" | "username" | "name" | "role">;

// Plain JSON in the cookie value, unencrypted — there is no server-side session
// store to check against; this is a lightweight optimistic session, not a
// production-grade auth solution (no rotation, no revocation).
export async function createSession(user: AppUser) {
  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
});

export async function requireRole(...roles: Role[]) {
  const session = await verifySession();

  if (!roles.includes(session.role)) {
    redirect("/login");
  }

  return session;
}
