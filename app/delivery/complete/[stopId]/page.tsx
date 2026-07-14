import { DeliveryCompletePage } from "@/components/delivery-complete-page";
import { verifySession } from "@/lib/session";

type CompletePageProps = {
  params: Promise<{
    stopId: string;
  }>;
};

export default async function CompletePage({ params }: CompletePageProps) {
  const { stopId } = await params;
  const session = await verifySession();

  return <DeliveryCompletePage stopId={stopId} currentRole={session.role} userName={session.name} />;
}
