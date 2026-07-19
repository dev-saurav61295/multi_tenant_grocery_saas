"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertTriangle, Boxes, Check, Download, ImageUp, Pencil, Plus, RotateCcw, Search, Tags, Trash2, X } from "lucide-react";
import { useActionState, useMemo, useState, useTransition } from "react";
import type { Category, Product, Store } from "@prisma/client";
import { createCategory, createProduct, deleteCategory, deleteProduct, restoreProduct, updateProduct } from "@/app/actions/inventory";
import { DashboardShell } from "@/components/dashboard-shell";
import { downloadCsv } from "@/lib/csv-export";
import { formatCurrency } from "@/lib/format";
import type { Role } from "@/lib/users";

type AdminInventoryPageProps = {
  store: Store;
  currentRole: Role;
  userName: string;
  products: Product[];
  categories: Category[];
};

const LOW_STOCK_THRESHOLD = 30;

export function AdminInventoryPage({ store, currentRole, userName, products, categories }: AdminInventoryPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [state, formAction, pending] = useActionState(createProduct, undefined);
  const [categoryState, categoryFormAction, categoryPending] = useActionState(createCategory, undefined);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<{ id: string; text: string; isError: boolean } | null>(null);
  const [isRowPending, startRowTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return products;
    }
    return products.filter((item) =>
      [item.name, item.brand, item.size, item.category].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [products, query]);

  const productCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const lowStockCount = products.filter((item) => item.active && item.stock < LOW_STOCK_THRESHOLD).length;

  function exportInventory() {
    downloadCsv(
      `${store.slug}-inventory.csv`,
      ["Product Name", "Brand", "Size", "Category", "Price", "Stock", "Status"],
      filteredItems.map((item) => [item.name, item.brand, item.size, item.category, String(item.price), String(item.stock), item.active ? "Active" : "Archived"])
    );
  }

  function beginEdit(item: Product) {
    setEditingId(item.id);
    setEditPrice(String(item.price));
    setEditStock(String(item.stock));
    setEditImage(null);
    setEditImagePreview(null);
    setRowMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditImage(null);
    setEditImagePreview(null);
    setRowMessage(null);
  }

  function chooseEditImage(file: File | null) {
    setEditImage(file);
    setEditImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function saveEdit(productId: string) {
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("price", editPrice);
    formData.set("stock", editStock);
    if (editImage) {
      formData.set("image", editImage);
    }

    startRowTransition(async () => {
      const result = await updateProduct(undefined, formData);
      if (result?.error) {
        setRowMessage({ id: productId, text: result.error, isError: true });
        return;
      }
      setEditingId(null);
      setEditImage(null);
      setEditImagePreview(null);
      setRowMessage(null);
      router.refresh();
    });
  }

  function removeProduct(item: Product) {
    if (!window.confirm(`Delete "${item.name}"? If it has past orders it will be archived instead.`)) {
      return;
    }

    startRowTransition(async () => {
      const { archived } = await deleteProduct(item.id);
      setRowMessage(
        archived
          ? { id: item.id, text: "This product appears in past orders, so it was archived instead of deleted.", isError: false }
          : null
      );
      router.refresh();
    });
  }

  function bringBack(item: Product) {
    startRowTransition(async () => {
      await restoreProduct(item.id);
      setRowMessage(null);
      router.refresh();
    });
  }

  function removeCategory(category: Category) {
    startRowTransition(async () => {
      const result = await deleteCategory(category.id);
      setCategoryError(result?.error ?? null);
      router.refresh();
    });
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
            onClick={() => setShowCategories((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-panel-soft px-5 py-3 text-sm font-bold text-brand-ink"
          >
            <Tags className="h-4 w-4" />
            Manage Categories
          </button>
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange-deep px-5 py-3 text-sm font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Add New Product
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
              placeholder="Search inventory, brands, categories..."
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

        {showCategories ? (
          <section className="panel rounded-xl p-5">
            <h2 className="text-lg font-bold text-brand-ink">Categories</h2>
            <p className="mt-1 text-sm text-brand-muted">Products pick their category from this list. A category in use can&apos;t be removed.</p>

            <form action={categoryFormAction} className="mt-4 flex max-w-md items-center gap-3">
              <input
                name="name"
                required
                placeholder="New category name"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
              <button type="submit" disabled={categoryPending} className="shrink-0 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {categoryPending ? "Adding..." : "Add"}
              </button>
            </form>

            {categoryState?.error ? <p className="mt-2 text-sm font-semibold text-red-600">{categoryState.error}</p> : null}
            {categoryError ? <p className="mt-2 text-sm font-semibold text-red-600">{categoryError}</p> : null}

            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => {
                const count = productCountByCategory.get(category.name) ?? 0;
                return (
                  <li key={category.id} className="flex items-center gap-2 rounded-full border border-brand-border/60 bg-brand-panel-soft px-4 py-2 text-sm font-semibold text-brand-ink">
                    {category.name}
                    <span className="text-xs font-bold text-brand-muted">{count}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      disabled={count > 0 || isRowPending}
                      title={count > 0 ? "In use by products — reassign them first" : "Remove category"}
                      aria-label={`Remove category ${category.name}`}
                      className="rounded-full p-0.5 text-brand-muted enabled:hover:text-red-600 disabled:opacity-30"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
              {categories.length === 0 ? <li className="text-sm text-brand-muted">No categories yet — add your first one above.</li> : null}
            </ul>
          </section>
        ) : null}

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
                  <select name="category" required defaultValue="" className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none">
                    <option value="" disabled>
                      {categories.length === 0 ? "No categories — add one first" : "Select a category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
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
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Variant Size</th>
                  <th className="px-5 py-4">Base Price</th>
                  <th className="px-5 py-4">Stock Level</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr key={item.id} className={`border-b border-brand-border/50 text-sm hover:bg-brand-panel-soft/60 ${item.active ? "" : "opacity-60"}`}>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <label
                            title="Change product photo"
                            className="group relative block h-10 w-10 cursor-pointer overflow-hidden rounded-md border border-dashed border-brand-border bg-brand-panel-soft"
                          >
                            {editImagePreview || item.imageUrl ? (
                              <Image src={editImagePreview ?? item.imageUrl ?? ""} alt={item.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-brand-outline">
                                <Boxes className="h-4 w-4" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                              <ImageUp className="h-4 w-4" />
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              aria-label={`Change photo for ${item.name}`}
                              onChange={(event) => chooseEditImage(event.target.files?.[0] ?? null)}
                            />
                          </label>
                        ) : (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border border-brand-border/60 bg-brand-panel-soft">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-brand-outline">
                                <Boxes className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[1.15rem] font-semibold text-brand-ink">
                          {item.name}
                          {!item.active ? <span className="ml-2 rounded-full bg-brand-panel-high px-2.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-brand-muted">Archived</span> : null}
                        </p>
                        <p className="text-brand-muted">{item.brand}</p>
                        {rowMessage?.id === item.id ? (
                          <p className={`mt-1 text-xs font-semibold ${rowMessage.isError ? "text-red-600" : "text-brand-orange-deep"}`}>{rowMessage.text}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4"><span className="rounded-md bg-brand-green/10 px-3 py-1 text-xs font-bold text-brand-green">{item.category}</span></td>
                      <td className="px-5 py-4"><span className="rounded-md bg-brand-panel-soft px-3 py-1 text-xs font-bold text-brand-ink">{item.size}</span></td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={editPrice}
                            onChange={(event) => setEditPrice(event.target.value)}
                            className="w-24 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none"
                            aria-label={`Price for ${item.name}`}
                          />
                        ) : (
                          <span className="text-[1.3rem] font-bold text-brand-orange-deep">{formatCurrency(item.price)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={editStock}
                            onChange={(event) => setEditStock(event.target.value)}
                            className="w-24 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm outline-none"
                            aria-label={`Stock for ${item.name}`}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-24 overflow-hidden rounded-full bg-brand-panel-high">
                              <div className={`h-2 rounded-full ${item.stock < LOW_STOCK_THRESHOLD ? "bg-brand-orange-deep" : "bg-brand-green"}`} style={{ width: `${Math.min(item.stock, 100)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-brand-ink">{item.stock} Units</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(item.id)}
                                disabled={isRowPending}
                                title="Save changes"
                                aria-label={`Save ${item.name}`}
                                className="rounded-lg bg-brand-green p-2 text-white disabled:opacity-60"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={isRowPending}
                                title="Cancel"
                                aria-label={`Cancel editing ${item.name}`}
                                className="rounded-lg border border-brand-border p-2 text-brand-muted"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => beginEdit(item)}
                                disabled={isRowPending}
                                title="Edit price & stock"
                                aria-label={`Edit ${item.name}`}
                                className="rounded-lg border border-brand-border p-2 text-brand-ink hover:bg-brand-panel-soft"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              {item.active ? (
                                <button
                                  type="button"
                                  onClick={() => removeProduct(item)}
                                  disabled={isRowPending}
                                  title="Delete (archives if the product has past orders)"
                                  aria-label={`Delete ${item.name}`}
                                  className="rounded-lg border border-brand-border p-2 text-brand-muted hover:border-red-300 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => bringBack(item)}
                                  disabled={isRowPending}
                                  title="Restore to catalog"
                                  aria-label={`Restore ${item.name}`}
                                  className="rounded-lg border border-brand-border p-2 text-brand-green hover:bg-brand-green/10"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
