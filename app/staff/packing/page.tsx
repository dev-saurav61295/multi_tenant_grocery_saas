import { StaffPackingPage } from "@/components/staff-packing-page";
import { verifySession } from "@/lib/session";

export default async function PackingPage() {
  const session = await verifySession();

  return <StaffPackingPage currentRole={session.role} userName={session.name} />;
}