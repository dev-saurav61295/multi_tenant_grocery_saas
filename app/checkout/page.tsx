import { redirect } from "next/navigation";
import { CheckoutPage } from "@/components/checkout-page";
import { parseCartParam } from "@/lib/cart";
import { priceCart } from "@/lib/pricing";
import { verifySession } from "@/lib/session";

type CheckoutProps = {
  searchParams: Promise<{ items?: string }>;
};

export default async function Checkout({ searchParams }: CheckoutProps) {
  const session = await verifySession();
  const { items } = await searchParams;
  const lines = parseCartParam(items);

  if (lines.length === 0) {
    redirect("/");
  }

  const cart = await priceCart(lines);

  if (cart.lines.length === 0) {
    redirect("/");
  }

  return <CheckoutPage session={session} cart={cart} itemsParam={items ?? ""} />;
}
