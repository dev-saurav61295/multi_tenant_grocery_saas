"use client";

import { AlertTriangle, Boxes, Download, Plus, Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { formatCurrency } from "@/lib/format";
import { inventoryItems } from "@/lib/mock-data";
import type { Role } from "@/lib/users";

type AdminInventoryPageProps = {
  currentRole: Role;
  userName: string;
};

export function AdminInventoryPage({ currentRole, userName }: AdminInventoryPageProps) {
  const [items, setItems] = useState(inventoryItems);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", brand: "", size: "", price: "", stock: "" });

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }
    return items.filter((item) =>
      [item.name, item.brand, item.size].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [items, query]);

  function addProduct() {
    if (!draft.name || !draft.brand || !draft.size || !draft.price || !draft.stock) {
      return;
    }

    setItems((current) => [
      {
        id: `inv-${current.length + 1}`,
        name: draft.name,
        brand: draft.brand,
        size: draft.size,
        price: Number(draft.price),
        stock: Number(draft.stock),
      },
      ...current,
    ]);

    setDraft({ name: "", brand: "", size: "", price: "", stock: "" });
    setShowForm(false);
  }

  return (
    <DashboardShell
      currentPath="/admin/inventory"
      currentRole={currentRole}
      userName={userName}
      title="Inventory Catalog"
      subtitle="Manage your product listings, pricing, and real-time stock levels."
      action={
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-brand-green bg-white px-5 py-3 text-sm font-bold text-brand-green">
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

        <section className="grid gap-4 md:grid-cols-3">
          <div className="soft-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-bright text-brand-ink">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-muted">Total SKUs</p>
                <p className="text-[2rem] font-bold text-brand-ink">1,284</p>
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
                <p className="text-[2rem] font-bold text-brand-ink">42</p>
              </div>
            </div>
          </div>
          <div className="soft-card rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange-deep">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-muted">Monthly Turnaround</p>
                <p className="text-[2rem] font-bold text-brand-ink">+12.4%</p>
              </div>
            </div>
          </div>
        </section>

        {showForm ? (
          <section className="panel rounded-xl p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                ["name", "Product Name"],
                ["brand", "Brand/Company"],
                ["size", "Variant Size"],
                ["price", "Base Price"],
                ["stock", "Dummy Stock"],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">{label}</span>
                  <input
                    value={draft[key as keyof typeof draft]}
                    onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                    className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
                  />
                </label>
              ))}
            </div>
            <button type="button" onClick={addProduct} className="mt-4 rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white">
              Save Product
            </button>
          </section>
        ) : null}

        <section className="panel overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white">
              <thead className="border-b border-brand-border bg-brand-panel-high text-left text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
                <tr>
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
                      <p className="text-[1.15rem] font-semibold text-brand-ink">{item.name}</p>
                      <p className="text-brand-muted">{item.brand}</p>
                    </td>
                    <td className="px-5 py-4"><span className="rounded-md bg-brand-panel-soft px-3 py-1 text-xs font-bold text-brand-ink">{item.size}</span></td>
                    <td className="px-5 py-4 text-[1.3rem] font-bold text-brand-orange-deep">{formatCurrency(item.price)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 overflow-hidden rounded-full bg-brand-panel-high">
                          <div className={`h-2 rounded-full ${item.stock < 30 ? "bg-brand-orange-deep" : "bg-brand-green"}`} style={{ width: `${Math.min(item.stock, 100)}%` }} />
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
            <p className="mt-3 text-sm text-brand-muted">6 items have reached critical thresholds. Generate a draft purchase order.</p>
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
