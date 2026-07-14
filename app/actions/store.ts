"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { RESERVED_STORE_SLUGS } from "@/lib/reserved-slugs";

export type StoreActionState = { error: string } | undefined;

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
  const adminPassword = String(formData.get("adminPassword") ?? "");

  if (!storeName || !storeSlug || !adminName || !adminUsername || !adminPassword) {
    return { error: "Please fill in every field." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(storeSlug)) {
    return { error: "Use a URL-safe store slug like fresh-mart-express." };
  }

  if (RESERVED_STORE_SLUGS.includes(storeSlug as (typeof RESERVED_STORE_SLUGS)[number])) {
    return { error: "That store slug is reserved. Please choose another." };
  }

  if (await prisma.store.findUnique({ where: { slug: storeSlug } })) {
    return { error: "That store slug is already taken." };
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const codePrefix = await uniqueCodePrefix(storeName, storeSlug);

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
          passwordHash,
          name: adminName,
          role: "admin",
        },
      });

      return { store, adminUser };
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