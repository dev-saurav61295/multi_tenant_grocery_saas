"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { roleHome } from "@/lib/roles";
import { findUserByCredentials, findUserByUsername, registerCustomer } from "@/lib/users";

export type AuthState = { error: string } | undefined;

export async function login(storeId: string, _state: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await findUserByCredentials(storeId, username, password);

  if (!user) {
    return { error: "Invalid username or password." };
  }

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });

  if (!store) {
    return { error: "Store not found." };
  }

  await createSession(user, store.slug);
  redirect(roleHome(store.slug, user.role));
}

export async function register(storeId: string, _state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !username || !password) {
    return { error: "Please fill in every field." };
  }

  if (await findUserByUsername(storeId, username)) {
    return { error: "That username is already taken." };
  }

  let user;

  try {
    user = await registerCustomer({ storeId, username, password, name });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That username is already taken." };
    }

    throw error;
  }

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });

  if (!store) {
    return { error: "Store not found." };
  }

  await createSession(user, store.slug);
  redirect(roleHome(store.slug, user.role));
}

export async function logout(storeSlug: string) {
  await deleteSession();
  redirect(`/${storeSlug}/login`);
}
