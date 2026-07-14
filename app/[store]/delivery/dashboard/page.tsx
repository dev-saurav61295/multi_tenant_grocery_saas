import { DeliveryDashboardPage } from "@/components/delivery-dashboard-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";
import { notFound } from "next/navigation";

type DeliveryPageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [store, orders, completedToday] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findMany({
      where: { storeId: session.storeId, status: "out_for_delivery", riderId: session.id },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.count({
      where: { storeId: session.storeId, riderId: session.id, status: "delivered", updatedAt: { gte: startOfToday } },
    }),
  ]);

  if (!store) {
    notFound();
  }

  return (
    <DeliveryDashboardPage
      store={store}
      currentRole={session.role}
      userName={session.name}
      orders={orders}
      completedToday={completedToday}
    />
  );
}