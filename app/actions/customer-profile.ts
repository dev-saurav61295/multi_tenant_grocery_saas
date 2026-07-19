"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { savePublicUpload } from "@/lib/storage";
import { findUserByEmail } from "@/lib/users";

const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UpdateCustomerProfileState =
  | {
      success?: string;
      error?: string;
      fieldErrors?: {
        name?: string;
        email?: string;
      };
    }
  | undefined;

export type ChangeCustomerPasswordState =
  | {
      success?: string;
      error?: string;
      fieldErrors?: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      };
    }
  | undefined;

export type UploadCustomerAvatarState =
  | {
      success?: string;
      error?: string;
      avatarUrl?: string;
    }
  | undefined;

function passwordMeetsPolicy(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}

export async function updateCustomerProfile(
  _state: UpdateCustomerProfileState,
  formData: FormData
): Promise<UpdateCustomerProfileState> {
  const session = await requireRole("customer");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const fieldErrors: NonNullable<UpdateCustomerProfileState>["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "Full Name is required.";
  } else if (name.length < 2) {
    fieldErrors.name = "Full Name must be at least 2 characters.";
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    fieldErrors.name = "Full Name can only contain letters, spaces, hyphens, and apostrophes.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    fieldErrors.email = "Email address is required.";
  } else if (!emailRegex.test(email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const existingUser = await findUserByEmail(session.storeId, email);
  if (existingUser && existingUser.id !== session.id) {
    return { fieldErrors: { email: "That email is already in use." } };
  }

  try {
    await prisma.user.update({
      where: { id: session.id, storeId: session.storeId },
      data: { name, email },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors: { email: "That email is already in use." } };
    }
    throw error;
  }

  revalidatePath(`/${session.storeSlug}/profile`);

  return { success: "Profile updated successfully." };
}

export async function changeCustomerPassword(
  _state: ChangeCustomerPasswordState,
  formData: FormData
): Promise<ChangeCustomerPasswordState> {
  const session = await requireRole("customer");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: NonNullable<ChangeCustomerPasswordState>["fieldErrors"] = {};

  if (!currentPassword) {
    fieldErrors.currentPassword = "Current password is required.";
  }

  if (!newPassword) {
    fieldErrors.newPassword = "New password is required.";
  } else if (!passwordMeetsPolicy(newPassword)) {
    fieldErrors.newPassword = PASSWORD_POLICY_MESSAGE;
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Confirm password is required.";
  } else if (newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id, storeId: session.storeId },
    select: { passwordHash: true },
  });

  if (!user) {
    return { error: "Unable to find your account." };
  }

  const currentPasswordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!currentPasswordMatches) {
    return { fieldErrors: { currentPassword: "Current password is incorrect." } };
  }

  const nextPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.id, storeId: session.storeId },
    data: { passwordHash: nextPasswordHash },
  });

  revalidatePath(`/${session.storeSlug}/profile`);

  return { success: "Password updated successfully." };
}

export async function uploadCustomerAvatar(
  _state: UploadCustomerAvatarState,
  formData: FormData
): Promise<UploadCustomerAvatarState> {
  const session = await requireRole("customer");
  const avatar = formData.get("avatar");

  if (!(avatar instanceof File) || avatar.size === 0) {
    return { error: "Please select an image file." };
  }

  if (!ALLOWED_AVATAR_TYPES.has(avatar.type)) {
    return { error: "Avatar must be a JPG, PNG, or WEBP image." };
  }

  if (avatar.size > AVATAR_MAX_SIZE_BYTES) {
    return { error: "Avatar must be 2MB or smaller." };
  }

  const avatarUrl = await savePublicUpload(session.storeId, "avatars", avatar);

  await prisma.user.update({
    where: { id: session.id, storeId: session.storeId },
    data: { avatarUrl },
  });

  revalidatePath(`/${session.storeSlug}/profile`);

  return { success: "Avatar updated successfully.", avatarUrl };
}
