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
  const [store, orders, deliveryStaff, activeCounts] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findMany({
      where: { storeId: session.storeId, status: { not: "delivered" } },
      include: { user: true, items: { include: { product: true } }, rider: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({
      where: { storeId: session.storeId, role: "delivery" },
      orderBy: { name: "asc" },
    }),
    prisma.order.groupBy({
      by: ["riderId"],
      where: { storeId: session.storeId, riderId: { not: null }, status: { not: "delivered" } },
      _count: { _all: true },
    }),
  ]);

  if (!store) {
    notFound();
  }

  const activeCountByRider = new Map(activeCounts.map((row) => [row.riderId as string, row._count._all]));
  const riders = deliveryStaff.map((rider) => ({
    id: rider.id,
    name: rider.name,
    avatarUrl: rider.avatarUrl,
    activeOrderCount: activeCountByRider.get(rider.id) ?? 0,
  }));

  return (
    <AdminOrdersPage store={store} currentRole={session.role} userName={session.name} orders={orders} riders={riders} />
  );
}