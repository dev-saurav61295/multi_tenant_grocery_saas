import { notFound } from "next/navigation";
import { CustomerProfilePage } from "@/components/customer-profile-page";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { getStoreBySlug } from "@/lib/store";

type CustomerProfileRouteProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function CustomerProfileRoute({ params }: CustomerProfileRouteProps) {
  const { store: storeSlug } = await params;
  const session = await verifySession();

  const [store, customer] = await Promise.all([
    getStoreBySlug(storeSlug),
    prisma.user.findUnique({
      where: { id: session.id, storeId: session.storeId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  if (!store || store.id !== session.storeId || !customer || customer.role !== "customer") {
    notFound();
  }

  return <CustomerProfilePage store={store} customer={customer} session={session} />;
}
