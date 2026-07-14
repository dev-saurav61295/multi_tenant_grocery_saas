import { CatalogPage } from "@/components/catalog-page";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function Home() {
  const [session, products] = await Promise.all([
    getSession(),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <CatalogPage session={session} products={products} />;
}
