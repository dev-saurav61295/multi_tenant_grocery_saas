import { AdminInventoryPage } from "@/components/admin-inventory-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";
import { notFound } from "next/navigation";

type InventoryPageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();
  const [store, products] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.product.findMany({ where: { storeId: session.storeId }, orderBy: { name: "asc" } }),
  ]);

  if (!store) {
    notFound();
  }

  return <AdminInventoryPage store={store} currentRole={session.role} userName={session.name} products={products} />;
}