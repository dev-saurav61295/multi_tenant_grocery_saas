import { DeliveryCompletePage } from "@/components/delivery-complete-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

type CompletePageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function CompletePage({ params }: CompletePageProps) {
  const { orderId } = await params;
  const session = await verifySession();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  return <DeliveryCompletePage order={order} currentRole={session.role} userName={session.name} />;
}
