import { AdminInventoryPage } from "@/components/admin-inventory-page";
import { verifySession } from "@/lib/session";

export default async function InventoryPage() {
  const session = await verifySession();

  return <AdminInventoryPage currentRole={session.role} userName={session.name} />;
}