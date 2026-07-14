import { notFound } from "next/navigation";
import { AdminSettingsPage } from "@/components/admin-settings-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";

type SettingsPageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    notFound();
  }

  const startOfHour = new Date();
  startOfHour.setMinutes(0, 0, 0);

  const ordersThisHour = await prisma.order.count({
    where: { storeId: session.storeId, createdAt: { gte: startOfHour } },
  });

  return (
    <AdminSettingsPage store={store} currentRole={session.role} userName={session.name} ordersThisHour={ordersThisHour} />
  );
}
