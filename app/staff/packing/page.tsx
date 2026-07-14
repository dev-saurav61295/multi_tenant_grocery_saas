import { StaffPackingPage } from "@/components/staff-packing-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export default async function PackingPage() {
  const session = await verifySession();

  const orders = await prisma.order.findMany({
    where: { status: "packing" },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });

  return <StaffPackingPage currentRole={session.role} userName={session.name} orders={orders} />;
}
