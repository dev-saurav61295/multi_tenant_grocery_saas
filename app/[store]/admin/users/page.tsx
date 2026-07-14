import { AdminUsersPage } from "@/components/admin-users-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";
import { notFound } from "next/navigation";

type UsersPageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function UsersPage({ params }: UsersPageProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();
  const [store, staff] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.user.findMany({ where: { storeId: session.storeId, role: { not: "customer" } }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!store) {
    notFound();
  }

  return <AdminUsersPage store={store} currentRole={session.role} userName={session.name} staff={staff} />;
}