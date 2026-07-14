import { DeliveryDashboardPage } from "@/components/delivery-dashboard-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export default async function DeliveryPage() {
  const session = await verifySession();

  const orders = await prisma.order.findMany({
    where: { status: "out_for_delivery" },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });

  return <DeliveryDashboardPage currentRole={session.role} userName={session.name} orders={orders} />;
}
