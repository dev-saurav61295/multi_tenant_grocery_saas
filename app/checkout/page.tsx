import { CheckoutPage } from "@/components/checkout-page";
import { getSession } from "@/lib/session";

export default async function Checkout() {
  const session = await getSession();

  return <CheckoutPage session={session} />;
}