import { DeliveryDashboardPage } from "@/components/delivery-dashboard-page";
import { verifySession } from "@/lib/session";

export default async function DeliveryPage() {
  const session = await verifySession();

  return <DeliveryDashboardPage currentRole={session.role} userName={session.name} />;
}