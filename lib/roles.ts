// Zero-dependency module — importable from proxy.ts (Middleware runtime),
// which must never pull in Prisma/bcrypt via a transitive import.
export type Role = "customer" | "admin" | "staff" | "delivery";

const rolePathSuffixes: Record<Role, string> = {
  admin: "admin/orders",
  staff: "staff/packing",
  delivery: "delivery/dashboard",
  customer: "",
};

export function roleHome(storeSlug: string, role: Role): string {
  const suffix = rolePathSuffixes[role];
  return suffix ? `/${storeSlug}/${suffix}` : `/${storeSlug}`;
}
