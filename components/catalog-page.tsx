"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MdAdd,
  MdArrowForward,
  MdCheckCircle,
  MdEco,
  MdError,
  MdFavoriteBorder,
  MdLocalOffer,
  MdRemove,
  MdSearch,
  MdShoppingBag,
  MdShoppingCart,
} from "react-icons/md";
import type { Product, Store } from "@prisma/client";
import { AccountMenu } from "@/components/account-menu";
import { cartParamFromLines } from "@/lib/cart";
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

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

function Icon({ name, className, filled = false }: IconProps) {
  const iconClass = className ?? "";

  switch (name) {
    case "search":
      return <MdSearch aria-hidden="true" className={iconClass} />;
    case "shopping_cart":
      return <MdShoppingCart aria-hidden="true" className={iconClass} />;
    case "favorite":
      return <MdFavoriteBorder aria-hidden="true" className={iconClass} />;
    case "local_offer":
      return <MdLocalOffer aria-hidden="true" className={iconClass} />;
    case "remove":
      return <MdRemove aria-hidden="true" className={iconClass} />;
    case "add":
      return <MdAdd aria-hidden="true" className={iconClass} />;
    case "eco":
      return <MdEco aria-hidden="true" className={iconClass} />;
    case "shopping_bag":
      return <MdShoppingBag aria-hidden="true" className={iconClass} />;
    case "check_circle":
      return <MdCheckCircle aria-hidden="true" className={iconClass} />;
    case "error":
      return <MdError aria-hidden="true" className={iconClass} />;
    case "arrow_forward":
      return <MdArrowForward aria-hidden="true" className={iconClass} />;
    default:
      return (
        <span aria-hidden="true" className={iconClass}>
          {filled ? "●" : "○"}
        </span>
      );
  }
}

export function CatalogPage({ store, session, products }: CatalogPageProps) {
  const [searchValue, setSearchValue] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};

    for (const product of products) {
      if (product.name === "Farm Fresh Milk") {
        defaults[product.id] = 3;
      } else if (product.name === "Organic Brown Eggs") {
        defaults[product.id] = 1;
      } else {
        defaults[product.id] = 0;
      }
    }

    return defaults;
  });

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
  const total = subtotal;
  const minimumOrderMet = cartCount > 0;
  const checkoutHref = `/${store.slug}/checkout?items=${encodeURIComponent(
    cartParamFromLines(cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })))
  )}`;

  function adjustQuantity(productId: string, delta: number) {
    setQuantities((current) => {
      const nextValue = Math.max(0, (current[productId] ?? 0) + delta);
      return { ...current, [productId]: nextValue };
    });
  }

  const featuredOrder = ["Farm Fresh Milk", "Organic Brown Eggs", "Royal Gala Apples", "Multigrain Bread"];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aRank = featuredOrder.indexOf(a.name);
    const bRank = featuredOrder.indexOf(b.name);

    if (aRank !== -1 || bRank !== -1) {
      if (aRank === -1) {
        return 1;
      }
      if (bRank === -1) {
        return -1;
      }
      return aRank - bRank;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="app-shell font-[Inter,sans-serif]">

      <div className="bg-brand-orange px-4 py-1 text-center text-[11px] font-bold text-brand-ink">
        Delivering within 5KM | Operating Hours: 9:00 AM - 8:00 PM
      </div>

      <header className="border-b border-brand-border/60 bg-brand-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <h1 className="whitespace-nowrap text-[32px] leading-[40px] font-bold tracking-[-0.01em] text-brand-green">Bhagwandas Traders</h1>
            <label className="hidden w-[420px] items-center gap-3 rounded-full bg-brand-panel-soft px-4 py-2.5 md:flex">
              <Icon name="search" className="text-brand-outline" />
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
              <Icon name="shopping_cart" className="text-[22px]" />
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange-deep px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </button>
            <AccountMenu storeSlug={store.slug} session={session} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-6 md:px-16">
        <section className="min-w-0 flex-1">
          <div className="relative mb-10 overflow-hidden rounded-xl bg-brand-green/10 p-6">
            <h2 className="text-[32px] leading-[40px] font-bold tracking-[-0.01em] text-brand-green">Freshness Delivered</h2>
            <p className="mt-2 max-w-xl text-base text-brand-muted">
              Sourced directly from local farmers every morning. Quality you can trust, prices you&apos;ll love.
            </p>
            <Icon name="eco" filled className="absolute -bottom-10 -right-10 hidden text-[200px] text-brand-green/20 md:block" />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {sortedProducts.map((product) => {
              const quantity = quantities[product.id] ?? 0;
              const comboActive = product.comboEligible && quantity >= 3;
              const isMilk = product.name === "Farm Fresh Milk";
              const isApples = product.name === "Royal Gala Apples";
              const statusLabel = product.name === "Multigrain Bread" ? "Freshly Baked" : "In Stock";

              return (
                <article key={product.id} className="panel flex flex-col overflow-hidden rounded-xl border border-brand-border/30 bg-white">
                  <div className={`relative aspect-square overflow-hidden ${product.imageUrl ? "bg-brand-panel-soft" : `bg-gradient-to-br ${productVisuals[product.id] ?? "from-white to-brand-panel-soft"}`}`}>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <button
                      type="button"
                      className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-brand-outline shadow-sm"
                      aria-label={`Save ${product.name}`}
                    >
                      <Icon name="favorite" className="text-[20px]" />
                    </button>
                    {comboActive ? (
                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-brand-orange-deep px-3 py-1.5 text-[10px] font-bold text-white">
                        <Icon name="local_offer" className="text-[13px]" />
                        Buy 3+ Combo Discount Applied!
                      </div>
                    ) : null}
                    {isApples ? (
                      <div className="absolute left-3 top-3 rounded-full bg-brand-green-fixed px-3 py-1 text-[10px] font-bold text-brand-green">
                        Organic
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-brand-muted">
                      <span className="h-2 w-2 rounded-full bg-brand-green-bright" />
                      {statusLabel}
                    </div>
                    <h3 className="text-[20px] leading-[28px] font-semibold text-brand-ink">{product.name}</h3>
                    <p className="mt-1 text-sm text-brand-muted">{product.size}</p>

                    <div className="mt-2 pt-0">
                      <div className="flex items-end justify-between gap-3">
                        <div className="flex flex-col">
                          <p className="text-[20px] leading-6 font-bold text-brand-orange-deep">{formatCurrency(product.price)}</p>
                          {isMilk ? <p className="text-[10px] text-brand-outline line-through">₹68</p> : null}
                        </div>
                        {quantity > 0 ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-brand-green-bright px-1 py-0.5 text-brand-ink">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(product.id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                              aria-label={`Decrease ${product.name} quantity`}
                            >
                              <Icon name="remove" className="text-[18px]" />
                            </button>
                            <span className="min-w-[18px] text-center text-[16px] font-bold leading-none">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => adjustQuantity(product.id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                              aria-label={`Increase ${product.name} quantity`}
                            >
                              <Icon name="add" className="text-[18px]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => adjustQuantity(product.id, 1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white transition hover:bg-brand-green/90"
                            aria-label={`Add ${product.name}`}
                          >
                            <Icon name="add" className="text-[20px]" />
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

        <aside className="sticky top-32 h-[calc(100vh-160px)] w-full md:w-80">
          <div className="panel flex h-full flex-col overflow-hidden rounded-xl border border-brand-border/20 bg-[#e2ebe0] p-4">
            <div className="flex items-center justify-between border-b border-brand-border/50 bg-[#e8f0e5] px-4 py-4">
              <h2 className="flex items-center gap-2 text-[20px] leading-7 font-semibold text-brand-green">
                <Icon name="shopping_bag" filled className="text-[20px]" />
                Your Basket
              </h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-ink">{cartCount} Items</span>
            </div>

            <div className="px-4 py-3">
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${minimumOrderMet ? "border-brand-green/20 bg-brand-green/10 text-brand-green" : "border-brand-orange/20 bg-brand-orange/10 text-brand-orange-deep"}`}>
                <Icon name={minimumOrderMet ? "check_circle" : "error"} className="text-[18px]" />
                Minimum Order Value: ₹300 {minimumOrderMet ? "Met" : "Not Met"}
              </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 pb-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-brand-panel-soft">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-ink">{item.name}</p>
                    <p className="text-brand-muted">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-bold text-brand-orange-deep">{formatCurrency(item.quantity * item.price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-2 border-t border-brand-border/40 px-4 py-4 text-sm">
              <div className="flex items-center justify-between text-brand-muted">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-brand-green">
                <span>Delivery Fee</span>
                <span className="font-bold">FREE</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[20px] leading-6 font-bold text-brand-orange-deep">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {cartItems.length > 0 ? (
                <Link
                  href={checkoutHref}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange-deep px-5 py-4 text-base font-semibold text-white transition hover:brightness-110"
                >
                  Checkout
                  <Icon name="arrow_forward" className="text-[18px]" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-brand-orange-deep/40 px-5 py-4 text-base font-semibold text-white"
                >
                  Add items to checkout
                </button>
              )}

              <div className="rounded-xl bg-white px-4 py-3 text-sm text-brand-muted">
                <span className="font-semibold text-brand-ink">Need help?</span> Chat with us on WhatsApp.
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
