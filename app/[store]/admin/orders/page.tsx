import { AdminOrdersPage } from "@/components/admin-orders-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";
import { notFound } from "next/navigation";

type OrdersPageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();
  const [store, orders] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findMany({
      where: { storeId: session.storeId, status: { not: "delivered" } },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  if (!store) {
    notFound();
  }

  return <AdminOrdersPage store={store} currentRole={session.role} userName={session.name} orders={orders} />;
}