"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { createStaffUser, findUserByUsername } from "@/lib/users";

export type StaffActionState = { error: string } | undefined;

export async function createStaffAccount(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!name || !username || !password) {
    return { error: "Please fill in every field." };
  }

  if (role !== "admin" && role !== "staff" && role !== "delivery") {
    return { error: "Select a valid role." };
  }

  if (await findUserByUsername(username)) {
    return { error: "That username is already taken." };
  }

  try {
    await createStaffUser({ username, password, name, role });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That username is already taken." };
    }

    throw error;
  }

  revalidatePath("/admin/users");
}
