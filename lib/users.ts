import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import type { Role } from "@/lib/roles";

export type { Role };
export type AppUser = User;

const SALT_ROUNDS = 10;

export async function findUserByCredentials(storeId: string, username: string, password: string): Promise<AppUser | null> {
  const user = await prisma.user.findUnique({ where: { storeId_username: { storeId, username } } });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  return passwordMatches ? user : null;
}

export async function findUserByUsername(storeId: string, username: string): Promise<AppUser | null> {
  return prisma.user.findUnique({ where: { storeId_username: { storeId, username } } });
}

export async function registerCustomer(input: { storeId: string; username: string; password: string; name: string }): Promise<AppUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      storeId: input.storeId,
      username: input.username,
      passwordHash,
      name: input.name,
      role: "customer",
    },
  });
}

export async function createStaffUser(input: {
  storeId: string;
  username: string;
  password: string;
  name: string;
  role: Exclude<Role, "customer">;
}): Promise<AppUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      storeId: input.storeId,
      username: input.username,
      passwordHash,
      name: input.name,
      role: input.role,
    },
  });
}
