import { notFound } from "next/navigation";
import { CustomerOrdersPage } from "@/components/customer-orders-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { getStoreBySlug } from "@/lib/store";

type CustomerOrdersRouteProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function CustomerOrdersRoute({ params }: CustomerOrdersRouteProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();

  const [store, orders] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.order.findMany({
      where: { storeId: session.storeId, userId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!store || store.id !== session.storeId) {
    notFound();
  }

  return <CustomerOrdersPage store={store} orders={orders} session={session} />;
}
