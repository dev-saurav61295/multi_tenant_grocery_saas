import { StaffPackingPage } from "@/components/staff-packing-page";
import { prisma } from "@/lib/prisma";
import { getStoreBySlug } from "@/lib/store";
import { verifySession } from "@/lib/session";
import { notFound } from "next/navigation";

type PackingPageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function PackingPage({ params }: PackingPageProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();
  const [store, orders, currentUser] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findMany({
      where: { storeId: session.storeId, status: "packing" },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({ where: { id: session.id }, select: { onBreak: true } }),
  ]);

  if (!store) {
    notFound();
  }

  return (
    <StaffPackingPage
      store={store}
      currentRole={session.role}
      userName={session.name}
      orders={orders}
      onBreak={currentUser?.onBreak ?? false}
    />
  );
}