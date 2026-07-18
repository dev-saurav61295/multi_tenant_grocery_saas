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

export type AuthState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
} | undefined;

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
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: NonNullable<AuthState>["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "Full Name is required.";
  } else if (name.length < 2) {
    fieldErrors.name = "Full Name must be at least 2 characters.";
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    fieldErrors.name = "Full Name can only contain letters, spaces, hyphens, and apostrophes.";
  }

  if (!username) {
    fieldErrors.username = "Username is required.";
  } else if (username.length < 3) {
    fieldErrors.username = "Username must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    fieldErrors.username = "Username can only contain alphanumeric characters, underscores, and periods.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    fieldErrors.email = "Email address is required.";
  } else if (!emailRegex.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  // Password Policy: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  if (!password) {
    fieldErrors.password = "Password is required.";
  } else {
    const passwordChecks = [];
    if (password.length < 8) {
      passwordChecks.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      passwordChecks.push("one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      passwordChecks.push("one lowercase letter");
    }
    if (!/\d/.test(password)) {
      passwordChecks.push("one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordChecks.push("one special character");
    }

    if (passwordChecks.length > 0) {
      fieldErrors.password = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm Password is required.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (await findUserByUsername(storeId, username)) {
    return { fieldErrors: { username: "That username is already taken." } };
  }

  if (await findUserByEmail(storeId, email)) {
    return { fieldErrors: { email: "That email is already in use." } };
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
