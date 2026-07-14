import { OrderTrackingPage } from "@/components/order-tracking-page";
import { getSession } from "@/lib/session";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const session = await getSession();

  return <OrderTrackingPage orderId={id} session={session} />;
}