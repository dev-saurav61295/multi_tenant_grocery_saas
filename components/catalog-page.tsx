"use client";

import Link from "next/link";
import { Heart, Minus, Plus, Search, ShoppingCart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product, Store } from "@prisma/client";
import { AccountMenu } from "@/components/account-menu";
import { cartParamFromLines, computeComboDiscount } from "@/lib/cart";
import { formatCurrency } from "@/lib/format";
import type { SessionPayload } from "@/lib/session";

const productVisuals: Record<string, string> = {
  "amul-milk": "from-white via-emerald-50 to-lime-100",
  "banana-combo": "from-amber-50 via-orange-50 to-yellow-100",
  atta: "from-stone-50 via-amber-100 to-emerald-50",
  salt: "from-slate-50 via-white to-emerald-50",
  oil: "from-orange-50 via-amber-50 to-lime-100",
  rice: "from-emerald-50 via-lime-50 to-yellow-50",
  tomato: "from-rose-50 via-red-50 to-orange-50",
  biscuits: "from-amber-50 via-yellow-50 to-orange-100",
};

type CatalogPageProps = {
  store: Store;
  session: SessionPayload | null;
  products: Product[];
};

export function CatalogPage({ store, session, products }: CatalogPageProps) {
  const [searchValue, setSearchValue] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((product) => [product.id, 0]))
  );

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.brand, product.category].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [products, searchValue]);

  const cartItems = products
    .map((product) => ({ ...product, quantity: quantities[product.id] ?? 0 }))
    .filter((product) => product.quantity > 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const comboDiscount = computeComboDiscount(cartItems);
  const total = subtotal - comboDiscount;
  const minimumOrderMet = total >= 300;
  const checkoutHref = `/${store.slug}/checkout?items=${encodeURIComponent(
    cartParamFromLines(cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })))
  )}`;

  function adjustQuantity(productId: string, delta: number) {
    setQuantities((current) => {
      const nextValue = Math.max(0, (current[productId] ?? 0) + delta);
      return { ...current, [productId]: nextValue };
    });
  }

  return (
    <div className="app-shell">
      <div className="bg-brand-orange px-4 py-1 text-center text-[11px] font-bold text-brand-ink">
        Delivering within 5KM | Operating Hours: 9:00 AM - 8:00 PM
      </div>

      <header className="border-b border-brand-border/60 bg-brand-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-[2rem] font-bold tracking-tight text-brand-green">Bhagwandas Traders</h1>
            <label className="hidden items-center gap-3 rounded-full bg-brand-panel-soft px-4 py-2.5 md:flex md:w-[420px]">
              <Search className="h-5 w-5 text-brand-outline" />
              <span className="sr-only">Search fresh produce</span>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search fresh produce..."
                className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-outline"
              />
            </label>
          </div>

          <div className="flex items-center gap-8 self-start md:self-auto">
            <nav className="hidden items-center gap-6 md:flex">
              <a className="border-b-2 border-brand-green pb-1 text-sm font-bold text-brand-green" href="#">Shop</a>
              <a className="text-sm font-medium text-brand-ink" href="#">Best Sellers</a>
              <a className="text-sm font-medium text-brand-ink" href="#">Offers</a>
            </nav>
            <button type="button" className="relative rounded-full p-2 text-brand-green" aria-label={`Cart with ${cartCount} items`}>
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange-deep px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </button>
            <AccountMenu storeSlug={store.slug} session={session} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <section className="min-w-0 flex-1">
          <div className="rounded-xl bg-brand-green/10 px-6 py-5">
            <h2 className="text-[2rem] font-bold tracking-tight text-brand-green">Freshness Delivered</h2>
            <p className="mt-2 max-w-xl text-base text-brand-muted">
              Sourced directly from local farmers every morning. Quality you can trust, prices you&apos;ll love.
            </p>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const quantity = quantities[product.id] ?? 0;
              const comboActive = product.comboEligible && quantity >= 3;

              return (
                <article key={product.id} className="panel overflow-hidden rounded-xl transition hover:shadow-focus">
                  <div className={`relative aspect-square bg-gradient-to-br ${productVisuals[product.id] ?? "from-white to-brand-panel-soft"}`}>
                    <button type="button" className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-brand-outline shadow-sm" aria-label={`Save ${product.name}`}>
                      <Heart className="h-4 w-4" />
                    </button>
                    {comboActive ? (
                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-brand-orange-deep px-3 py-1.5 text-[10px] font-bold text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        Buy 3+ Combo Discount Applied!
                      </div>
                    ) : null}
                  </div>

                  <div className="flex h-full flex-col p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-brand-muted">
                      <span className="h-2 w-2 rounded-full bg-brand-green-bright" />
                      In Stock
                    </div>
                    <h3 className="text-[1.75rem] leading-8 font-semibold tracking-tight text-brand-ink">{product.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{product.size}</p>
                    <p className="mt-2 text-sm text-brand-muted">{product.brand}</p>

                    <div className="mt-auto pt-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[1.75rem] font-bold tracking-tight text-brand-orange-deep">{formatCurrency(product.price)}</p>
                          <p className="text-[11px] text-brand-outline">{product.description}</p>
                        </div>
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2 rounded-full bg-brand-green-bright px-2 py-1 text-brand-ink">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(product.id, -1)}
                              className="rounded-full p-2 transition hover:bg-black/5"
                              aria-label={`Decrease ${product.name} quantity`}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => adjustQuantity(product.id, 1)}
                              className="rounded-full p-2 transition hover:bg-black/5"
                              aria-label={`Increase ${product.name} quantity`}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => adjustQuantity(product.id, 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white transition hover:bg-brand-green/90"
                            aria-label={`Add ${product.name}`}
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="w-full lg:max-w-sm">
          <div className="panel sticky top-6 rounded-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-brand-border/50 bg-brand-panel-soft px-5 py-4">
              <div>
                <h2 className="text-[1.5rem] font-bold tracking-tight text-brand-green">Your Basket</h2>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-ink shadow-sm">
                {cartCount} items
              </div>
            </div>

            <div className="space-y-3 px-5 py-4">
              <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${minimumOrderMet ? "border-brand-green/20 bg-brand-green/10 text-brand-green" : "border-brand-orange/20 bg-brand-orange/10 text-brand-orange-deep"}`}>
                Minimum Order Value: ₹300 {minimumOrderMet ? "Met" : "Not Met"}
              </div>
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-brand-border/70 bg-white p-3">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-brand-ink">{item.name}</p>
                      <p className="text-brand-muted">{item.quantity} x {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-bold text-brand-orange-deep">{formatCurrency(item.quantity * item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-brand-border/50 bg-brand-panel-soft px-5 py-4 text-sm">
              <div className="flex items-center justify-between text-brand-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-brand-green">
                <span>Tiered combo discount</span>
                <span>-{formatCurrency(comboDiscount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-[1.75rem] font-bold text-brand-orange-deep">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {cartItems.length > 0 ? (
                <Link href={checkoutHref} className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-orange-deep px-5 py-4 text-base font-bold text-white transition hover:brightness-110">
                  Checkout
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-brand-orange-deep/40 px-5 py-4 text-base font-bold text-white"
                >
                  Add items to checkout
                </button>
              )}
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-brand-muted shadow-sm">
                Need help? Chat with us on WhatsApp.
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="surface-footer mt-10 px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-brand-green">{store.name}</h3>
            <p className="mt-2 text-sm text-brand-muted">Quality local groceries with freshness delivered to your doorstep.</p>
          </div>
          <div className="text-sm text-brand-muted">
            <p className="font-bold text-brand-ink">Shop</p>
            <p className="mt-2">Daily Produce</p>
            <p>Bakery</p>
            <p>Dairy & Eggs</p>
          </div>
          <div className="text-sm text-brand-muted">
            <p className="font-bold text-brand-ink">Support</p>
            <p className="mt-2">Contact Us</p>
            <p>Store Locator</p>
            <p>Privacy Policy</p>
          </div>
          <div className="text-sm text-brand-muted">
            <p className="font-bold text-brand-ink">Connect</p>
            <p className="mt-2">WhatsApp</p>
            <p>Instagram</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
