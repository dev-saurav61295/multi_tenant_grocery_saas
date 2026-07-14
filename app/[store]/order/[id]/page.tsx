import { notFound } from "next/navigation";
import { OrderTrackingPage } from "@/components/order-tracking-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";

type OrderPageProps = Readonly<{
  params: Promise<{ store: string; id: string }>;
}>;

export default async function StoreOrderPage({ params }: OrderPageProps) {
  const { store: storeSlug, id } = await params;
  const session = await verifySession();
  const [store, order] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findUnique({
      where: { displayId: id, storeId: session.storeId },
      include: { items: { include: { product: true } } },
    }),
  ]);

  if (!store || !order || order.userId !== session.id) {
    notFound();
  }

  return <OrderTrackingPage store={store} order={order} session={session} />;
}