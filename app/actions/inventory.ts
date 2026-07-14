"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { savePublicUpload } from "@/lib/storage";

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
  const image = formData.get("image");

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

  const imageUrl = image instanceof File && image.size > 0 ? await savePublicUpload(session.storeId, "products", image) : null;

  await prisma.product.create({
    data: { storeId: session.storeId, name, brand, size, category, description, comboEligible, price, stock, imageUrl },
  });

  revalidatePath(`/${session.storeSlug}/admin/inventory`);
  revalidatePath(`/${session.storeSlug}`);
}
