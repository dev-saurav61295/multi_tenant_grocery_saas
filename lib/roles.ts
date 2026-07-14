// Zero-dependency module — importable from proxy.ts (Middleware runtime),
// which must never pull in Prisma/bcrypt via a transitive import.
export type Role = "customer" | "admin" | "staff" | "delivery";

export const roleHome: Record<Role, string> = {
  admin: "/admin/orders",
  staff: "/staff/packing",
  delivery: "/delivery/dashboard",
  customer: "/",
};
