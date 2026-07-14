"use client";

import Image from "next/image";
import { AlertTriangle, Boxes, Download, ImageUp, Plus, Search } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { Product, Store } from "@prisma/client";
import { createProduct } from "@/app/actions/inventory";
import { DashboardShell } from "@/components/dashboard-shell";
import { downloadCsv } from "@/lib/csv-export";
import { formatCurrency } from "@/lib/format";
import type { Role } from "@/lib/users";

type AdminInventoryPageProps = {
  store: Store;
  currentRole: Role;
  userName: string;
  products: Product[];
};

const LOW_STOCK_THRESHOLD = 30;

export function AdminInventoryPage({ store, currentRole, userName, products }: AdminInventoryPageProps) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, pending] = useActionState(createProduct, undefined);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return products;
    }
    return products.filter((item) =>
      [item.name, item.brand, item.size].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [products, query]);

  const lowStockCount = products.filter((item) => item.stock < LOW_STOCK_THRESHOLD).length;

  function exportInventory() {
    downloadCsv(
      `${store.slug}-inventory.csv`,
      ["Product Name", "Brand", "Size", "Category", "Price", "Stock"],
      filteredItems.map((item) => [item.name, item.brand, item.size, item.category, String(item.price), String(item.stock)])
    );
  }

  return (
    <DashboardShell
      storeSlug={store.slug}
      storeName={store.name}
      currentPath={`/${store.slug}/admin/inventory`}
      currentRole={currentRole}
      userName={userName}
      title="Inventory Catalog"
      subtitle="Manage your product listings, pricing, and real-time stock levels."
      action={
        <div className="flex items-center gap-3">
          <button type="button" onClick={exportInventory} className="inline-flex items-center gap-2 rounded-lg border border-brand-green bg-white px-5 py-3 text-sm font-bold text-brand-green">
            <Download className="h-4 w-4" />
            Quick Export
          </button>
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange-deep px-5 py-3 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            + Add New Product
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl bg-brand-panel px-5 py-4 shadow-card">
          <label className="flex items-center gap-3 rounded-full bg-brand-panel-soft px-4 py-2.5 shadow-sm md:max-w-md">
            <Search className="h-5 w-5 text-brand-outline" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search inventory, brands, or SKU..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-brand-outline"
            />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="soft-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-bright text-brand-ink">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-muted">Total SKUs</p>
                <p className="text-[2rem] font-bold text-brand-ink">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="soft-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-brand-orange-deep">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-muted">Low Stock Items</p>
                <p className="text-[2rem] font-bold text-brand-ink">{lowStockCount}</p>
              </div>
            </div>
          </div>
        </section>

        {showForm ? (
          <section className="panel rounded-xl p-5">
            <form action={formAction}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Product Name</span>
                  <input name="name" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Brand/Company</span>
                  <input name="brand" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Variant Size</span>
                  <input name="size" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Category</span>
                  <input name="category" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Base Price</span>
                  <input name="price" type="number" min="1" step="1" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Stock</span>
                  <input name="stock" type="number" min="0" step="1" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block md:col-span-2 xl:col-span-3">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Description</span>
                  <textarea name="description" required rows={2} className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-panel-soft/40">
                  <ImageUp className="h-4 w-4 text-brand-green" />
                  Product Photo (optional)
                  <input name="image" type="file" accept="image/*" className="sr-only" />
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="comboEligible" className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-brand-green" />
                  <span className="text-sm font-semibold text-brand-ink">Eligible for combo pricing</span>
                </label>
              </div>

              {state?.error ? <p className="mt-4 text-sm font-semibold text-red-600">{state.error}</p> : null}

              <button type="submit" disabled={pending} className="mt-4 rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                {pending ? "Saving..." : "Save Product"}
              </button>
            </form>
          </section>
        ) : null}

        <section className="panel overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white">
              <thead className="border-b border-brand-border bg-brand-panel-high text-left text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
                <tr>
                  <th className="px-5 py-4"></th>
                  <th className="px-5 py-4">Product Name & Brand</th>
                  <th className="px-5 py-4">Variant Size</th>
                  <th className="px-5 py-4">Base Price</th>
                  <th className="px-5 py-4">Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-brand-border/50 text-sm hover:bg-brand-panel-soft/60">
                    <td className="px-5 py-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-brand-border/60 bg-brand-panel-soft">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-brand-outline">
                            <Boxes className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[1.15rem] font-semibold text-brand-ink">{item.name}</p>
                      <p className="text-brand-muted">{item.brand}</p>
                    </td>
                    <td className="px-5 py-4"><span className="rounded-md bg-brand-panel-soft px-3 py-1 text-xs font-bold text-brand-ink">{item.size}</span></td>
                    <td className="px-5 py-4 text-[1.3rem] font-bold text-brand-orange-deep">{formatCurrency(item.price)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 overflow-hidden rounded-full bg-brand-panel-high">
                          <div className={`h-2 rounded-full ${item.stock < LOW_STOCK_THRESHOLD ? "bg-brand-orange-deep" : "bg-brand-green"}`} style={{ width: `${Math.min(item.stock, 100)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-brand-ink">{item.stock} Units</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-brand-green/20 bg-brand-green/10 p-5">
            <p className="font-bold text-brand-green">Smart Replenishment</p>
            <p className="mt-3 text-sm text-brand-muted">Review low-stock items and generate a draft purchase order.</p>
          </div>
          <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/10 p-5">
            <p className="font-bold text-brand-orange-deep">Bulk Price Update</p>
            <p className="mt-3 text-sm text-brand-muted">Quickly adjust base prices for categories or brands based on seasonal shifts.</p>
          </div>
          <div className="rounded-xl border border-brand-border/40 bg-brand-panel-alt p-5">
            <p className="font-bold text-brand-ink">Stock History</p>
            <p className="mt-3 text-sm text-brand-muted">Review the last 24 hours of inventory movements and adjustments.</p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
