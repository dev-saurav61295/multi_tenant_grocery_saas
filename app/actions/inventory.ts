"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type InventoryActionState = { error: string } | undefined;

export async function createProduct(_state: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const session = await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const comboEligible = formData.get("comboEligible") === "on";
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));

  if (
    !name ||
    !brand ||
    !size ||
    !category ||
    !description ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    return { error: "Please fill in every field with valid values." };
  }

  await prisma.product.create({
    data: { storeId: session.storeId, name, brand, size, category, description, comboEligible, price, stock },
  });

  revalidatePath(`/${session.storeSlug}/admin/inventory`);
  revalidatePath(`/${session.storeSlug}`);
}
