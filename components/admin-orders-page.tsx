"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Filter, Search, Truck, X } from "lucide-react";
import { useState, useTransition } from "react";
import type { Prisma, Store } from "@prisma/client";
import { verifyOrder } from "@/app/actions/orders";
import { DashboardShell } from "@/components/dashboard-shell";
import { RiderAssignmentModal, type RiderOption } from "@/components/rider-assignment-modal";
import { downloadCsv } from "@/lib/csv-export";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import type { Role } from "@/lib/users";

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: { user: true; items: { include: { product: true } }; rider: true };
}>;

type AdminOrdersPageProps = {
  store: Store;
  currentRole: Role;
  userName: string;
  orders: OrderWithDetails[];
  riders: RiderOption[];
};

export function AdminOrdersPage({ store, currentRole, userName, orders, riders }: AdminOrdersPageProps) {
  const router = useRouter();
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  function exportOrders() {
    downloadCsv(
      `${store.slug}-orders.csv`,
      ["Order ID", "Customer", "Order Value", "Status", "Date Submitted"],
      orders.map((order) => [
        order.displayId,
        order.user.name,
        String(order.total),
        orderStatusLabels[order.status],
        order.createdAt.toISOString(),
      ])
    );
  }

  function approveSelectedOrder() {
    if (!selectedOrder) {
      return;
    }

    startTransition(async () => {
      await verifyOrder(selectedOrder.id);
      router.refresh();
    });
  }

  return (
    <DashboardShell
      storeSlug={store.slug}
      storeName={store.name}
      currentPath={`/${store.slug}/admin/orders`}
      currentRole={currentRole}
      userName={userName}
      title="Orders Queue"
      subtitle="Monitoring pending verifications from recent local transactions."
      action={
        <div className="flex items-center gap-3">
          <button type="button" onClick={exportOrders} className="inline-flex items-center gap-2 rounded-lg border border-brand-green bg-white px-4 py-2 text-sm font-bold text-brand-green">
            <Download className="h-4 w-4" />
            Quick Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-panel-soft px-4 py-2 text-sm font-bold text-brand-ink">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-panel-soft px-4 py-2 text-sm font-bold text-brand-ink">
            Sort
          </button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel overflow-hidden rounded-xl">
          <div className="border-b border-brand-border/60 bg-brand-panel-soft px-5 py-4">
            <label className="flex items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-sm md:max-w-sm">
              <Search className="h-5 w-5 text-brand-outline" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-brand-outline" placeholder="Search orders, customers, or transactions..." />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white">
              <thead className="border-b border-brand-border bg-brand-panel-soft text-left text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer Name</th>
                  <th className="px-5 py-4">Order Value</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const active = order.id === selectedOrderId;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`cursor-pointer border-b border-brand-border/50 text-sm transition ${active ? "bg-brand-green/10" : "hover:bg-brand-panel-soft/60"}`}
                    >
                      <td className={`px-5 py-4 font-bold ${active ? "text-brand-green" : "text-brand-ink"}`}>{order.displayId}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-panel-high text-xs font-bold text-brand-ink">
                            {order.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>
                          <span className="text-base text-brand-ink">{order.user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[1.15rem] font-bold text-brand-orange-deep">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`status-pill ${order.status === "pending_verification" ? "bg-brand-orange text-brand-ink" : "bg-brand-green text-white"}`}>
                          {orderStatusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedOrderId(order.id);
                          }}
                          className="text-sm font-bold text-brand-green hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {selectedOrder ? (
          <aside className="panel rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[2rem] font-bold tracking-tight text-brand-ink">Verification Detail</h3>
                <p className="text-sm text-brand-muted">Order {selectedOrder.displayId}</p>
              </div>
              <button type="button" className="rounded-full p-2 text-brand-outline hover:bg-brand-panel-soft" onClick={() => setSelectedOrderId("") }>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
              <p className="font-bold text-brand-ink">{selectedOrder.user.name}</p>
              <p className="text-sm text-brand-muted">Phone: {selectedOrder.phone}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Payment Proof (UPI/Transfer)</p>
              <div className="mt-3 overflow-hidden rounded-xl border border-brand-border bg-brand-panel-soft">
                {selectedOrder.paymentProofUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/files/${store.id}/${selectedOrder.paymentProofUrl}`}
                    alt="Uploaded payment proof screenshot"
                    className="max-h-80 w-full bg-white object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-brand-muted">
                    <CheckCircle2 className="h-8 w-8 text-brand-outline" />
                    No screenshot uploaded
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-brand-muted">Receipt: {selectedOrder.screenshotName ?? "Not uploaded"}</p>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Declared Value</span><span className="font-bold text-brand-ink">{formatCurrency(selectedOrder.total)}</span></div>
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Transfer Mode</span><span className="font-bold text-brand-ink">{selectedOrder.paymentMethod === "cod" ? "Pay on Delivery" : "GPay (UPI)"}</span></div>
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Date Submitted</span><span className="font-bold text-brand-ink">{selectedOrder.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span></div>
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Address</span><span className="font-bold text-brand-ink text-right">{selectedOrder.address}</span></div>
            </div>

            {selectedOrder.status === "out_for_delivery" ? (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Delivery Assignment</p>
                {selectedOrder.rider ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-3 text-sm">
                    <Truck className="h-4 w-4 text-brand-green" />
                    <span className="font-bold text-brand-ink">{selectedOrder.rider.name}</span>
                    <span className="text-brand-muted">is assigned to this delivery</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-brand-green px-5 py-4 text-sm font-bold text-brand-green transition hover:bg-brand-green/5"
                  >
                    <Truck className="h-4 w-4" />
                    Assign Rider
                  </button>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={approveSelectedOrder}
              disabled={isPending || selectedOrder.status !== "pending_verification"}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              {selectedOrder.status === "pending_verification" 
                ? (selectedOrder.paymentMethod === "cod" ? "Approve & Confirm Order" : "Approve & Verify Payment")
                : "Already Verified"}
            </button>
            <button type="button" className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-panel-soft px-5 py-4 text-sm font-bold text-red-600">
              Flag as Invalid / Suspicious
            </button>
          </aside>
        ) : null}
      </div>

      {showAssignModal && selectedOrder ? (
        <RiderAssignmentModal
          order={{ id: selectedOrder.id, displayId: selectedOrder.displayId, address: selectedOrder.address, userName: selectedOrder.user.name }}
          riders={riders}
          onClose={() => setShowAssignModal(false)}
        />
      ) : null}
    </DashboardShell>
  );
}
