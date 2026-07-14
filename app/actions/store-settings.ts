"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type StoreSettingsState = { error: string } | undefined;

export async function saveStoreSettings(_state: StoreSettingsState, formData: FormData): Promise<StoreSettingsState> {
  const session = await requireRole("admin");

  const openingTime = String(formData.get("openingTime") ?? "");
  const closingTime = String(formData.get("closingTime") ?? "");
  const hourlyCapacity = Number(formData.get("hourlyCapacity"));

  if (
    !/^\d{2}:\d{2}$/.test(openingTime) ||
    !/^\d{2}:\d{2}$/.test(closingTime) ||
    !Number.isFinite(hourlyCapacity) ||
    hourlyCapacity <= 0
  ) {
    return { error: "Please provide valid store hours and capacity." };
  }

  await prisma.store.update({
    where: { id: session.storeId },
    data: { openingTime, closingTime, hourlyCapacity },
  });

  revalidatePath(`/${session.storeSlug}/admin/settings`);
}
