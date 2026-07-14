import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import { roleHome, type Role } from "@/lib/roles";

export type { Role };
export { roleHome };
export type AppUser = User;

const SALT_ROUNDS = 10;

export async function findUserByCredentials(username: string, password: string): Promise<AppUser | null> {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  return passwordMatches ? user : null;
}

export async function findUserByUsername(username: string): Promise<AppUser | null> {
  return prisma.user.findUnique({ where: { username } });
}

export async function registerCustomer(input: { username: string; password: string; name: string }): Promise<AppUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      name: input.name,
      role: "customer",
    },
  });
}

export async function createStaffUser(input: {
  username: string;
  password: string;
  name: string;
  role: Exclude<Role, "customer">;
}): Promise<AppUser> {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      name: input.name,
      role: input.role,
    },
  });
}
