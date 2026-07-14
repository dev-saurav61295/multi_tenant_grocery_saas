import { redirect } from "next/navigation";
import { CheckoutPage } from "@/components/checkout-page";
import { parseCartParam } from "@/lib/cart";
import { getStoreBySlug } from "@/lib/store";
import { priceCart } from "@/lib/pricing";
import { verifySession } from "@/lib/session";

type CheckoutProps = Readonly<{
  params: Promise<{ store: string }>;
  searchParams: Promise<{ items?: string }>;
}>;

export default async function StoreCheckout({ params, searchParams }: CheckoutProps) {
  const { store: storeSlug } = await params;
  const { items } = await searchParams;
  const session = await verifySession();
  const store = await getStoreBySlug(storeSlug);
  const lines = parseCartParam(items);

  if (!store) {
    redirect("/");
  }

  if (lines.length === 0) {
    redirect(`/${store.slug}`);
  }

  const cart = await priceCart(session.storeId, lines);

  if (cart.lines.length === 0) {
    redirect(`/${store.slug}`);
  }

  return <CheckoutPage store={store} session={session} cart={cart} itemsParam={items ?? ""} />;
}