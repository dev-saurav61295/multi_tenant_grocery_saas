import { AdminOrdersPage } from "@/components/admin-orders-page";
import { verifySession } from "@/lib/session";

export default async function OrdersPage() {
  const session = await verifySession();

  return <AdminOrdersPage currentRole={session.role} userName={session.name} />;
}