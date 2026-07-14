"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { roleHome } from "@/lib/roles";
import { findUserByCredentials, findUserByEmail, findUserByUsername, registerCustomer } from "@/lib/users";
import { buildAppUrl, sendMail } from "@/lib/mail";
import { registrationWelcomeEmail } from "@/lib/emails/registration-welcome-email";

export type AuthState = { error: string } | undefined;

export async function login(storeId: string, _state: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("remember") === "on";

  const user = await findUserByCredentials(storeId, username, password);

  if (!user) {
    return { error: "Invalid username or password." };
  }

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true } });

  if (!store) {
    return { error: "Store not found." };
  }

  await createSession(user, store.slug, rememberMe);
  redirect(roleHome(store.slug, user.role));
}

export async function register(storeId: string, _state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !username || !email || !password) {
    return { error: "Please fill in every field." };
  }

  if (!email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (await findUserByUsername(storeId, username)) {
    return { error: "That username is already taken." };
  }

  if (await findUserByEmail(storeId, email)) {
    return { error: "That email is already in use." };
  }

  const emailVerifyToken = randomBytes(32).toString("hex");
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let user;

  try {
    user = await registerCustomer({
      storeId,
      username,
      email,
      password,
      name,
      emailVerifyToken,
      emailVerifyExpires,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That username or email is already taken." };
    }

    throw error;
  }

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true, name: true } });

  if (!store) {
    return { error: "Store not found." };
  }

  const verifyPath = buildAppUrl(`/${store.slug}/verify-email?token=${emailVerifyToken}`);
  const welcome = registrationWelcomeEmail({
    storeName: store.name,
    userName: user.name,
    username: user.username,
    roleLabel: "customer",
    verifyPath,
  });

  await sendMail({
    storeId,
    userId: user.id,
    to: user.email,
    subject: welcome.subject,
    html: welcome.html,
    fromName: store.name,
    type: "registration_welcome",
  });

  await createSession(user, store.slug);
  redirect(roleHome(store.slug, user.role));
}

export async function logout(storeSlug: string) {
  await deleteSession();
  redirect(`/${storeSlug}/login`);
}
