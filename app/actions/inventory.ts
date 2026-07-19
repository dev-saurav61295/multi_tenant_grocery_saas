"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { savePublicUpload } from "@/lib/storage";

export type InventoryActionState = { error: string } | undefined;

function revalidateInventory(storeSlug: string) {
  revalidatePath(`/${storeSlug}/admin/inventory`);
  revalidatePath(`/${storeSlug}`);
}

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

  const knownCategory = await prisma.category.findUnique({
    where: { storeId_name: { storeId: session.storeId, name: category } },
  });

  if (!knownCategory) {
    return { error: "Pick a category from the list (or add it under Manage Categories first)." };
  }

  const imageUrl = image instanceof File && image.size > 0 ? await savePublicUpload(session.storeId, "products", image) : null;

  await prisma.product.create({
    data: { storeId: session.storeId, name, brand, size, category, description, comboEligible, price, stock, imageUrl },
  });

  revalidateInventory(session.storeSlug);
}

export async function updateProduct(_state: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const session = await requireRole("admin");

  const productId = String(formData.get("productId") ?? "");
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const image = formData.get("image");

  if (!productId || !Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < 0) {
    return { error: "Enter a valid price and stock level." };
  }

  const imageUrl = image instanceof File && image.size > 0 ? await savePublicUpload(session.storeId, "products", image) : undefined;

  await prisma.product.update({
    where: { id: productId, storeId: session.storeId },
    data: { price: Math.round(price), stock: Math.round(stock), ...(imageUrl ? { imageUrl } : {}) },
  });

  revalidateInventory(session.storeSlug);
}

/**
 * Hard-deletes a product that has never been ordered; archives (active=false)
 * one that has, so past orders keep their line items intact.
 */
export async function deleteProduct(productId: string): Promise<{ archived: boolean }> {
  const session = await requireRole("admin");

  const orderedCount = await prisma.orderItem.count({
    where: { productId, order: { storeId: session.storeId } },
  });

  if (orderedCount > 0) {
    await prisma.product.update({
      where: { id: productId, storeId: session.storeId },
      data: { active: false },
    });
    revalidateInventory(session.storeSlug);
    return { archived: true };
  }

  await prisma.product.delete({ where: { id: productId, storeId: session.storeId } });
  revalidateInventory(session.storeSlug);
  return { archived: false };
}

export async function restoreProduct(productId: string) {
  const session = await requireRole("admin");

  await prisma.product.update({
    where: { id: productId, storeId: session.storeId },
    data: { active: true },
  });

  revalidateInventory(session.storeSlug);
}

export async function createCategory(_state: InventoryActionState, formData: FormData): Promise<InventoryActionState> {
  const session = await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2) {
    return { error: "Category name must be at least 2 characters." };
  }

  try {
    await prisma.category.create({ data: { storeId: session.storeId, name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That category already exists." };
    }

    throw error;
  }

  revalidateInventory(session.storeSlug);
}

export async function deleteCategory(categoryId: string): Promise<InventoryActionState> {
  const session = await requireRole("admin");

  const category = await prisma.category.findFirst({
    where: { id: categoryId, storeId: session.storeId },
  });

  if (!category) {
    return { error: "Category not found." };
  }

  const productCount = await prisma.product.count({
    where: { storeId: session.storeId, category: category.name },
  });

  if (productCount > 0) {
    return { error: `"${category.name}" is used by ${productCount} product${productCount === 1 ? "" : "s"} — reassign them first.` };
  }

  await prisma.category.delete({ where: { id: categoryId } });

  revalidateInventory(session.storeSlug);
}
