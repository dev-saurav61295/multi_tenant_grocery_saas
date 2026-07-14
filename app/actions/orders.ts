"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, verifySession } from "@/lib/session";
import { parseCartParam } from "@/lib/cart";
import { priceCart } from "@/lib/pricing";

export type PlaceOrderState = { error: string } | undefined;

const MINIMUM_ORDER_VALUE = 300;

class InsufficientStockError extends Error {
  constructor(public productName: string) {
    super(`Insufficient stock: ${productName}`);
  }
}

function formatDateForDisplayId(date: Date) {
  const yy = String(date.getFullYear() % 100).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export async function placeOrder(_state: PlaceOrderState, formData: FormData): Promise<PlaceOrderState> {
  const session = await verifySession();

  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const screenshotName = String(formData.get("screenshotName") ?? "").trim() || null;
  const lines = parseCartParam(String(formData.get("items") ?? ""));

  if (!/^[+]?[\d\s-]{10,15}$/.test(phone)) {
    return { error: "Enter a valid phone number." };
  }

  if (address.length < 10) {
    return { error: "Enter a complete delivery address." };
  }

  if (lines.length === 0) {
    return { error: "Your cart is empty." };
  }

  const priced = await priceCart(lines);

  if (priced.lines.length === 0) {
    return { error: "Sorry, those items are no longer available." };
  }

  if (priced.total < MINIMUM_ORDER_VALUE) {
    return { error: `Minimum order value is ₹${MINIMUM_ORDER_VALUE}.` };
  }

  let displayId: string;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: session.id,
          status: "pending_verification",
          phone,
          address,
          subtotal: priced.subtotal,
          comboDiscount: priced.comboDiscount,
          total: priced.total,
          screenshotName,
          displayId: "",
          items: {
            create: priced.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.price,
            })),
          },
        },
      });

      for (const line of priced.lines) {
        const result = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });

        if (result.count === 0) {
          throw new InsufficientStockError(line.name);
        }
      }

      const finalDisplayId = `BGD-${formatDateForDisplayId(created.createdAt)}-${100 + created.orderNumber}`;

      return tx.order.update({ where: { id: created.id }, data: { displayId: finalDisplayId } });
    });

    displayId = order.displayId;
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { error: `Sorry, "${error.productName}" just went out of stock. Please update your cart.` };
    }

    throw error;
  }

  redirect(`/order/${displayId}`);
}

export async function verifyOrder(orderId: string) {
  await requireRole("admin");

  await prisma.order.update({ where: { id: orderId }, data: { status: "packing" } });

  revalidatePath("/admin/orders");
  revalidatePath("/staff/packing");
}

export async function dispatchOrder(orderId: string) {
  await requireRole("staff");

  await prisma.order.update({ where: { id: orderId }, data: { status: "out_for_delivery" } });

  revalidatePath("/staff/packing");
  revalidatePath("/delivery/dashboard");
}

export async function completeDelivery(orderId: string) {
  await requireRole("delivery");

  await prisma.order.update({ where: { id: orderId }, data: { status: "delivered" } });

  revalidatePath("/delivery/dashboard");
}
