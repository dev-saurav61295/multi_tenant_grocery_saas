"use client";

import { Search, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import { AccountMenu } from "@/components/account-menu";
import type { SessionPayload } from "@/lib/session";

type StorefrontShellProps = {
  storeSlug: string;
  cartCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  children: ReactNode;
  sidePanel?: ReactNode;
  session: SessionPayload | null;
};

export function StorefrontShell({
  storeSlug,
  cartCount,
  searchValue,
  onSearchChange,
  children,
  sidePanel,
  session,
}: StorefrontShellProps) {
  return (
    <div className="app-shell">
      <div className="bg-brand-orange px-4 py-1 text-center text-[11px] font-bold text-brand-ink">
        Delivering within 5KM | Operating Hours: 9:00 AM - 8:00 PM
      </div>

      <header className="border-b border-brand-border/60 bg-brand-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-[2rem] font-bold tracking-tight text-brand-green">
                Bhagwandas Traders
              </h1>
            </div>
          </div>

          <label className="flex w-full items-center gap-3 rounded-full bg-brand-panel-soft px-4 py-2.5 shadow-sm lg:max-w-xl">
            <Search className="h-5 w-5 text-brand-outline" />
            <span className="sr-only">Search grocery items</span>
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search products, brands, or categories"
              className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-outline"
            />
          </label>

          <div className="flex items-center gap-8 self-start lg:self-auto">
            <nav className="hidden items-center gap-6 lg:flex">
              <a className="text-sm font-medium text-brand-ink hover:text-brand-orange-deep" href="#">Shop</a>
              <a className="text-sm font-medium text-brand-muted hover:text-brand-orange-deep" href="#">Best Sellers</a>
              <a className="text-sm font-medium text-brand-muted hover:text-brand-orange-deep" href="#">Offers</a>
            </nav>
            <button
              type="button"
              className="relative flex items-center justify-center rounded-full p-2 text-brand-green"
              aria-label={`Cart with ${cartCount} items`}
            >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange-deep px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            </div>
            </button>

            <AccountMenu storeSlug={storeSlug} session={session} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <section className="min-w-0 flex-1">{children}</section>
        {sidePanel ? <aside className="w-full lg:max-w-sm">{sidePanel}</aside> : null}
      </main>
    </div>
  );
}