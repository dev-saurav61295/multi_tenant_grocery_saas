import type { OrderStatus } from "@prisma/client";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_verification: "Pending Payment Verification (Manual)",
  verified: "Verified",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};
