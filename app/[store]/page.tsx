import { CatalogPage } from "@/components/catalog-page";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getStoreBySlug } from "@/lib/store";
import { notFound } from "next/navigation";

type StorePageProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function StorePage({ params }: StorePageProps) {
  const { store: storeSlug } = await params;
  const [store, rawSession] = await Promise.all([getStoreBySlug(storeSlug), getSession()]);

  if (!store) {
    notFound();
  }

  const session = rawSession?.storeSlug === store.slug ? rawSession : null;
  const products = await prisma.product.findMany({ where: { storeId: store.id }, orderBy: { name: "asc" } });

  return <CatalogPage store={store} session={session} products={products} />;
}