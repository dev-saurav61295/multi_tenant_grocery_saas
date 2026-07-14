import { LoginPage } from "@/components/login-page";
import { getStoreBySlug } from "@/lib/store";
import { notFound } from "next/navigation";

type LoginProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function StoreLoginPage({ params }: LoginProps) {
  const { store: storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    notFound();
  }

  return <LoginPage store={store} />;
}