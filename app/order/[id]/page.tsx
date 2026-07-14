import { notFound } from "next/navigation";
import { OrderTrackingPage } from "@/components/order-tracking-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const session = await verifySession();

  const order = await prisma.order.findUnique({
    where: { displayId: id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== session.id) {
    notFound();
  }

  return <OrderTrackingPage order={order} session={session} />;
}
