import { AdminUsersPage } from "@/components/admin-users-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export default async function UsersPage() {
  const session = await verifySession();

  const [staff, storeSettings] = await Promise.all([
    prisma.user.findMany({ where: { role: { not: "customer" } }, orderBy: { createdAt: "asc" } }),
    prisma.storeSettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);

  return <AdminUsersPage currentRole={session.role} userName={session.name} staff={staff} storeSettings={storeSettings} />;
}
