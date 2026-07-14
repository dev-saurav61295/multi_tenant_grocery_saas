"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createStaffUser, findUserByEmail, findUserByUsername } from "@/lib/users";
import { sendMail } from "@/lib/mail";
import { registrationWelcomeEmail } from "@/lib/emails/registration-welcome-email";

export type StaffActionState = { error: string } | undefined;

export async function createStaffAccount(_state: StaffActionState, formData: FormData): Promise<StaffActionState> {
  const session = await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!name || !username || !email || !password) {
    return { error: "Please fill in every field." };
  }

  if (!email.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  if (role !== "admin" && role !== "staff" && role !== "delivery") {
    return { error: "Select a valid role." };
  }

  if (await findUserByUsername(session.storeId, username)) {
    return { error: "That username is already taken." };
  }

  if (await findUserByEmail(session.storeId, email)) {
    return { error: "That email is already in use." };
  }

  let createdUser;

  try {
    createdUser = await createStaffUser({ storeId: session.storeId, username, email, password, name, role });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That username or email is already taken." };
    }

    throw error;
  }

  const store = await prisma.store.findUnique({ where: { id: session.storeId }, select: { name: true } });

  if (store && createdUser) {
    const welcome = registrationWelcomeEmail({
      storeName: store.name,
      userName: createdUser.name,
      username: createdUser.username,
      roleLabel: createdUser.role,
    });

    await sendMail({
      storeId: session.storeId,
      userId: createdUser.id,
      to: createdUser.email,
      subject: welcome.subject,
      html: welcome.html,
      fromName: store.name,
      type: "registration_welcome",
    });
  }

  revalidatePath(`/${session.storeSlug}/admin/users`);
}
