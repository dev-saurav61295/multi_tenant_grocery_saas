import { DeliveryCompletePage } from "@/components/delivery-complete-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";
import { notFound } from "next/navigation";

type CompletePageProps = Readonly<{
  params: Promise<{ store: string; orderId: string }>;
}>;

export default async function CompletePage({ params }: CompletePageProps) {
  const { store: storeSlug, orderId } = await params;
  const session = await verifySession();
  const [store, order] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findUnique({
      where: { id: orderId, storeId: session.storeId },
      include: { user: true },
    }),
  ]);

  if (!store) {
    notFound();
  }

  return <DeliveryCompletePage store={store} order={order} currentRole={session.role} userName={session.name} />;
}