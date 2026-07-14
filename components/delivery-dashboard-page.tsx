"use client";

import Link from "next/link";
import { CheckSquare, MapPinned, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import type { Prisma, Store } from "@prisma/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { formatCurrency } from "@/lib/format";
import type { Role } from "@/lib/users";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { user: true; items: { include: { product: true } } };
}>;

type DeliveryDashboardPageProps = {
  store: Store;
  currentRole: Role;
  userName: string;
  orders: OrderWithItems[];
};

export function DeliveryDashboardPage({ store, currentRole, userName, orders }: DeliveryDashboardPageProps) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0],
    [orders, selectedOrderId]
  );

  if (!selectedOrder) {
    return (
      <DashboardShell
        storeSlug={store.slug}
        storeName={store.name}
        currentPath={`/${store.slug}/delivery/dashboard`}
        currentRole={currentRole}
        userName={userName}
        title="Finalize Delivery"
        subtitle="Review manifest details and confirm doorstep drop-off."
      >
        <div className="panel rounded-xl p-8 text-center text-brand-muted">No deliveries out for drop-off right now.</div>
      </DashboardShell>
    );
  }

  const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(selectedOrder.address)}`;

  return (
    <DashboardShell
      storeSlug={store.slug}
      storeName={store.name}
      currentPath={`/${store.slug}/delivery/dashboard`}
      currentRole={currentRole}
      userName={userName}
      title="Finalize Delivery"
      subtitle="Review manifest details and confirm doorstep drop-off."
    >
      <div className="space-y-6">
        <div className="text-sm font-bold text-brand-muted">
          Delivery Portal <span className="mx-2">›</span> <span className="text-brand-green">Confirmation</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <section className="rounded-xl border border-brand-border/50 bg-brand-panel-soft/60 p-4">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-muted">Assigned Manifest</p>
            <div className="mt-4 space-y-3">
              {orders.map((order) => {
                const active = order.id === selectedOrderId;
                return (
                  <div
                    key={order.id}
                    className={`w-full rounded-xl border p-4 transition ${active ? "border-brand-green bg-white shadow-card" : "border-transparent bg-white hover:shadow-card"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-brand-ink">{order.user.name}</p>
                          <p className="text-sm text-brand-muted">{order.displayId}</p>
                        </div>
                        {order.distanceKm != null ? (
                          <span className="rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold text-brand-ink">{order.distanceKm} KM</span>
                        ) : null}
                      </div>
                      {order.eta ? <p className="mt-3 text-[11px] text-brand-muted">ETA: {order.eta}</p> : null}
                    </button>
                    <Link
                      href={`/${store.slug}/delivery/complete/${order.id}`}
                      className="mt-2 inline-flex text-xs font-bold text-brand-green hover:underline"
                    >
                      Confirm Drop-off →
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-brand-border/40 bg-white shadow-focus">
            <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-brand-border/30">
              <div className="space-y-8 p-6 lg:p-8">
                <div>
                  <span className="inline-flex rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink">Manifest Summary</span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Order ID</p>
                  <p className="mt-2 text-[3rem] font-bold tracking-tight text-brand-green">{selectedOrder.displayId}</p>
                </div>

                <div className="flex items-end justify-between border-b border-brand-border/20 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Total Bill Amount</p>
                    <p className="mt-2 text-[2.2rem] font-bold text-brand-orange-deep">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  <div className="text-right text-sm text-brand-muted">
                    <p>Payment Method</p>
                    <p className="font-bold text-brand-ink">Digital QR Transfer</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Verified Payment Proof</p>
                  <div className="mt-4 overflow-hidden rounded-xl border-2 border-brand-green-bright bg-brand-panel-alt p-3">
                    <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-panel-soft to-brand-green-fixed/20" />
                  </div>
                </div>
              </div>

              <div className="space-y-8 bg-brand-panel-soft/40 p-6 lg:p-8">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-muted"><MapPinned className="h-4 w-4 text-brand-green" /> Drop-off Location</p>
                  <div className="mt-4 rounded-xl border border-brand-border/50 bg-white p-4">
                    <p className="font-semibold text-brand-ink">{selectedOrder.address}</p>
                    <p className="mt-2 text-sm text-brand-muted">Within 5KM service radius</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Delivery Notes</p>
                  <div className="mt-4 border-l-4 border-brand-green bg-brand-green/10 px-4 py-5 text-xl italic text-brand-green">
                    “Leave at front gate, ring bell. Please take a photo of the bag once dropped.”
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Compliance Checklist</p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Items matched with Manifest",
                      "Payment verification screenshot uploaded",
                      "Sanitized hands before handling",
                    ].map((label, index) => (
                      <label key={label} className="flex items-center gap-3 rounded-lg border border-brand-border/50 bg-white px-4 py-3 text-sm text-brand-ink">
                        <input type="checkbox" defaultChecked={index === 0} className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-brand-green" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <a href={`tel:${selectedOrder.phone.replace(/\s+/g, "")}`} className="inline-flex items-center justify-center gap-3 rounded-xl border border-brand-border bg-white px-5 py-4 text-base font-bold text-brand-ink">
                    <Phone className="h-5 w-5 text-brand-green" />
                    Call
                  </a>
                  <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 rounded-xl border border-brand-border bg-white px-5 py-4 text-base font-bold text-brand-ink">
                    <MapPinned className="h-5 w-5 text-brand-orange-deep" />
                    Maps
                  </a>
                </div>

                <Link
                  href={`/${store.slug}/delivery/complete/${selectedOrder.id}`}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-green px-6 py-5 text-[1.55rem] font-bold text-white transition hover:brightness-110"
                >
                  <CheckSquare className="h-6 w-6" />
                  Confirm Drop-off & Finalize Order
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
