"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, verifySession } from "@/lib/session";
import { savePrivateUpload } from "@/lib/storage";
import { parseCartParam } from "@/lib/cart";
import { priceCart } from "@/lib/pricing";
import { sendMail } from "@/lib/mail";
import { orderConfirmationEmail } from "@/lib/emails/order-confirmation-email";
import { orderOutForDeliveryEmail } from "@/lib/emails/order-out-for-delivery-email";
import { orderDeliveredEmail } from "@/lib/emails/order-delivered-email";

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
  const paymentProofFile = formData.get("paymentProof");
  const hasPaymentProof = paymentProofFile instanceof File && paymentProofFile.size > 0;
  const screenshotName = hasPaymentProof ? paymentProofFile.name : null;
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

  const priced = await priceCart(session.storeId, lines);

  if (priced.lines.length === 0) {
    return { error: "Sorry, those items are no longer available." };
  }

  if (priced.total < MINIMUM_ORDER_VALUE) {
    return { error: `Minimum order value is ₹${MINIMUM_ORDER_VALUE}.` };
  }

  const paymentProofUrl = hasPaymentProof
    ? await savePrivateUpload(session.storeId, "payment-proofs", paymentProofFile)
    : null;

  let displayId = "";
  let createdOrderId = "";

  try {
    const order = await prisma.$transaction(async (tx) => {
      const store = await tx.store.findUnique({ where: { id: session.storeId }, select: { codePrefix: true } });

      if (!store) {
        throw new Error("Store not found");
      }

      const created = await tx.order.create({
        data: {
          storeId: session.storeId,
          userId: session.id,
          status: "pending_verification",
          phone,
          address,
          subtotal: priced.subtotal,
          comboDiscount: priced.comboDiscount,
          total: priced.total,
          screenshotName,
          paymentProofUrl,
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
          where: { storeId: session.storeId, id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });

        if (result.count === 0) {
          throw new InsufficientStockError(line.name);
        }
      }

      const finalDisplayId = `${store.codePrefix}-${formatDateForDisplayId(created.createdAt)}-${100 + created.orderNumber}`;

      return tx.order.update({ where: { id: created.id }, data: { displayId: finalDisplayId } });
    });

    displayId = order.displayId;
    createdOrderId = order.id;
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { error: `Sorry, "${error.productName}" just went out of stock. Please update your cart.` };
    }

    throw error;
  }

  try {
    const [store, user] = await Promise.all([
      prisma.store.findUnique({ where: { id: session.storeId }, select: { name: true } }),
      prisma.user.findUnique({ where: { id: session.id }, select: { id: true, email: true } }),
    ]);

    if (store && user && createdOrderId) {
      const confirmation = orderConfirmationEmail({
        storeName: store.name,
        displayId,
        address,
        total: priced.total,
        items: priced.lines.map((line) => ({ name: line.name, quantity: line.quantity, unitPrice: line.price })),
      });

      await sendMail({
        storeId: session.storeId,
        userId: user.id,
        orderId: createdOrderId,
        to: user.email,
        subject: confirmation.subject,
        html: confirmation.html,
        fromName: store.name,
        type: "order_confirmation",
      });
    }
  } catch (error) {
    console.error("Failed to send order confirmation email", error);
  }

  redirect(`/${session.storeSlug}/order/${displayId}`);
}

export async function verifyOrder(orderId: string) {
  const session = await requireRole("admin");

  await prisma.order.update({
    where: { id: orderId, storeId: session.storeId },
    data: { status: "packing", verifiedAt: new Date() },
  });

  revalidatePath(`/${session.storeSlug}/admin/orders`);
  revalidatePath(`/${session.storeSlug}/staff/packing`);
}

export async function assignRider(orderId: string, riderId: string) {
  const session = await requireRole("admin");

  await prisma.order.update({
    where: { id: orderId, storeId: session.storeId },
    data: { riderId },
  });

  revalidatePath(`/${session.storeSlug}/admin/orders`);
  revalidatePath(`/${session.storeSlug}/delivery/dashboard`);
}

export async function acceptPickup(orderId: string) {
  const session = await requireRole("delivery");

  await prisma.order.update({
    where: { id: orderId, storeId: session.storeId, riderId: session.id },
    data: { acceptedAt: new Date() },
  });

  revalidatePath(`/${session.storeSlug}/delivery/dashboard`);
}

export async function dispatchOrder(orderId: string) {
  const session = await requireRole("staff");

  const updated = await prisma.order.update({
    where: { id: orderId, storeId: session.storeId },
    data: { status: "out_for_delivery" },
    include: {
      user: { select: { id: true, email: true } },
      store: { select: { name: true } },
    },
  });

  const outForDelivery = orderOutForDeliveryEmail({
    storeName: updated.store.name,
    displayId: updated.displayId,
    address: updated.address,
    eta: updated.eta,
  });

  await sendMail({
    storeId: session.storeId,
    userId: updated.user.id,
    orderId: updated.id,
    to: updated.user.email,
    subject: outForDelivery.subject,
    html: outForDelivery.html,
    fromName: updated.store.name,
    type: "order_out_for_delivery",
  });

  revalidatePath(`/${session.storeSlug}/staff/packing`);
  revalidatePath(`/${session.storeSlug}/delivery/dashboard`);
}

export async function completeDelivery(orderId: string) {
  const session = await requireRole("delivery");

  const updated = await prisma.order.update({
    where: { id: orderId, storeId: session.storeId },
    data: { status: "delivered" },
    include: {
      user: { select: { id: true, email: true } },
      store: { select: { name: true } },
    },
  });

  const delivered = orderDeliveredEmail({
    storeName: updated.store.name,
    displayId: updated.displayId,
  });

  await sendMail({
    storeId: session.storeId,
    userId: updated.user.id,
    orderId: updated.id,
    to: updated.user.email,
    subject: delivered.subject,
    html: delivered.html,
    fromName: updated.store.name,
    type: "order_delivered",
  });

  revalidatePath(`/${session.storeSlug}/delivery/dashboard`);
}
