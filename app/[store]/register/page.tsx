import { RegisterPage } from "@/components/register-page";
import { getStoreBySlug } from "@/lib/store";
import { notFound } from "next/navigation";

type RegisterProps = Readonly<{
  params: Promise<{ store: string }>;
}>;

export default async function StoreRegisterPage({ params }: RegisterProps) {
  const { store: storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);

  if (!store) {
    notFound();
  }

  return <RegisterPage store={store} />;
}