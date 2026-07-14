import { AdminUsersPage } from "@/components/admin-users-page";
import { verifySession } from "@/lib/session";

export default async function UsersPage() {
  const session = await verifySession();

  return <AdminUsersPage currentRole={session.role} userName={session.name} />;
}
