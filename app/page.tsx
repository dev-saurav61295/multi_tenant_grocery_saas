import { CatalogPage } from "@/components/catalog-page";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return <CatalogPage session={session} />;
}
