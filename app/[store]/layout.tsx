import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/store";

type StoreLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}>;

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { store: storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    notFound();
  }

  return children;
}