"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { RESERVED_STORE_SLUGS } from "@/lib/reserved-slugs";
import { buildAppUrl, sendMail } from "@/lib/mail";
import { registrationWelcomeEmail } from "@/lib/emails/registration-welcome-email";

export type StoreActionState = {
  error?: string;
  fieldErrors?: {
    storeName?: string;
    storeSlug?: string;
    adminName?: string;
    adminUsername?: string;
    adminEmail?: string;
    adminPassword?: string;
    confirmPassword?: string;
  };
} | undefined;

function deriveCodePrefix(storeName: string, storeSlug: string) {
  const initials = storeName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const base = (initials || storeSlug.replace(/-/g, "").toUpperCase()).slice(0, 3).padEnd(3, "X");
  return base;
}

async function uniqueCodePrefix(storeName: string, storeSlug: string) {
  const base = deriveCodePrefix(storeName, storeSlug);
  let candidate = base;
  let suffix = 1;

  while (await prisma.store.findUnique({ where: { codePrefix: candidate } })) {
    candidate = `${base.slice(0, 2)}${suffix}`.slice(0, 3).toUpperCase().padEnd(3, "X");
    suffix += 1;
  }

  return candidate;
}

export async function createStore(_state: StoreActionState, formData: FormData): Promise<StoreActionState> {
  const storeName = String(formData.get("storeName") ?? "").trim();
  const storeSlug = String(formData.get("storeSlug") ?? "").trim().toLowerCase();
  const adminName = String(formData.get("adminName") ?? "").trim();
  const adminUsername = String(formData.get("adminUsername") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim().toLowerCase();
  const adminPassword = String(formData.get("adminPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: NonNullable<StoreActionState>["fieldErrors"] = {};

  if (!storeName) {
    fieldErrors.storeName = "Store Name is required.";
  } else if (storeName.length < 3) {
    fieldErrors.storeName = "Store Name must be at least 3 characters.";
  }

  if (!storeSlug) {
    fieldErrors.storeSlug = "Store Slug is required.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(storeSlug)) {
    fieldErrors.storeSlug = "Use a URL-safe store slug like fresh-mart-express.";
  } else if (RESERVED_STORE_SLUGS.includes(storeSlug as (typeof RESERVED_STORE_SLUGS)[number])) {
    fieldErrors.storeSlug = "That store slug is reserved. Please choose another.";
  } else if (await prisma.store.findUnique({ where: { slug: storeSlug } })) {
    fieldErrors.storeSlug = "That store slug is already taken.";
  }

  if (!adminName) {
    fieldErrors.adminName = "Admin Name is required.";
  } else if (adminName.length < 2) {
    fieldErrors.adminName = "Admin Name must be at least 2 characters.";
  } else if (!/^[a-zA-Z\s'-]+$/.test(adminName)) {
    fieldErrors.adminName = "Admin Name can only contain letters, spaces, hyphens, and apostrophes.";
  }

  if (!adminUsername) {
    fieldErrors.adminUsername = "Admin Username is required.";
  } else if (adminUsername.length < 3) {
    fieldErrors.adminUsername = "Admin Username must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9_.]+$/.test(adminUsername)) {
    fieldErrors.adminUsername = "Admin Username can only contain alphanumeric characters, underscores, and periods.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!adminEmail) {
    fieldErrors.adminEmail = "Admin Email is required.";
  } else if (!emailRegex.test(adminEmail)) {
    fieldErrors.adminEmail = "Please enter a valid email address.";
  }

  // Password Policy Check
  if (!adminPassword) {
    fieldErrors.adminPassword = "Password is required.";
  } else {
    const passwordChecks = [];
    if (adminPassword.length < 8) {
      passwordChecks.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(adminPassword)) {
      passwordChecks.push("one uppercase letter");
    }
    if (!/[a-z]/.test(adminPassword)) {
      passwordChecks.push("one lowercase letter");
    }
    if (!/\d/.test(adminPassword)) {
      passwordChecks.push("one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(adminPassword)) {
      passwordChecks.push("one special character");
    }

    if (passwordChecks.length > 0) {
      fieldErrors.adminPassword = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm Password is required.";
  } else if (adminPassword !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const codePrefix = await uniqueCodePrefix(storeName, storeSlug);
  const emailVerifyToken = randomBytes(32).toString("hex");
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: storeName,
          slug: storeSlug,
          codePrefix,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          storeId: store.id,
          username: adminUsername,
          email: adminEmail,
          passwordHash,
          name: adminName,
          role: "admin",
          emailVerifyToken,
          emailVerifyExpires,
        },
      });

      return { store, adminUser };
    });

    const verifyPath = buildAppUrl(`/${result.store.slug}/verify-email?token=${emailVerifyToken}`);
    const welcome = registrationWelcomeEmail({
      storeName: result.store.name,
      userName: result.adminUser.name,
      username: result.adminUser.username,
      roleLabel: "admin",
      verifyPath,
    });

    await sendMail({
      storeId: result.store.id,
      userId: result.adminUser.id,
      to: result.adminUser.email,
      subject: welcome.subject,
      html: welcome.html,
      fromName: result.store.name,
      type: "registration_welcome",
    });

    await createSession(result.adminUser, result.store.slug);
    redirect(`/${result.store.slug}/admin/orders`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That store slug or username is already taken." };
    }

    throw error;
  }
}