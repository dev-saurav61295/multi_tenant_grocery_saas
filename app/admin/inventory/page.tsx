import { AdminInventoryPage } from "@/components/admin-inventory-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export default async function InventoryPage() {
  const session = await verifySession();
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return <AdminInventoryPage currentRole={session.role} userName={session.name} products={products} />;
}
