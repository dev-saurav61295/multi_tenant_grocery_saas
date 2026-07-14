import { AdminOrdersPage } from "@/components/admin-orders-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export default async function OrdersPage() {
  const session = await verifySession();

  const orders = await prisma.order.findMany({
    where: { status: { not: "delivered" } },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return <AdminOrdersPage currentRole={session.role} userName={session.name} orders={orders} />;
}
