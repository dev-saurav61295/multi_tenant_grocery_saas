"use client";

import { CheckCircle2, Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { formatCurrency } from "@/lib/format";
import { recentOrders } from "@/lib/mock-data";
import type { Role } from "@/lib/users";

type AdminOrdersPageProps = {
  currentRole: Role;
  userName: string;
};

export function AdminOrdersPage({ currentRole, userName }: AdminOrdersPageProps) {
  const [orders, setOrders] = useState(recentOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  function approveSelectedOrder() {
    if (!selectedOrder) {
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === selectedOrder.id ? { ...order, status: "Verified" } : order
      )
    );
  }

  return (
    <DashboardShell
      currentPath="/admin/orders"
      currentRole={currentRole}
      userName={userName}
      title="Orders Queue"
      subtitle="Monitoring pending verifications from recent local transactions."
      action={
        <div className="flex items-center gap-3">
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
                      <td className={`px-5 py-4 font-bold ${active ? "text-brand-green" : "text-brand-ink"}`}>{order.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-panel-high text-xs font-bold text-brand-ink">
                            {order.customer.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                          </div>
                          <span className="text-base text-brand-ink">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[1.15rem] font-bold text-brand-orange-deep">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`status-pill ${order.status === "Verified" ? "bg-brand-green text-white" : "bg-brand-orange text-brand-ink"}`}>
                          {order.status === "Verified" ? "Verified" : "Pending Verification"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-brand-green">View Details</td>
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
                <p className="text-sm text-brand-muted">Order {selectedOrder.id}</p>
              </div>
              <button type="button" className="rounded-full p-2 text-brand-outline xl:hidden" onClick={() => setSelectedOrderId("") }>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-brand-green/20 bg-brand-green/5 p-4">
              <p className="font-bold text-brand-ink">{selectedOrder.customer}</p>
              <p className="text-sm text-brand-muted">Phone: {selectedOrder.phone}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Payment Proof (UPI/Transfer)</p>
              <div className="mt-3 overflow-hidden rounded-xl border border-brand-border bg-gradient-to-b from-brand-panel-soft to-white p-5">
                <div className="mx-auto max-w-[220px] rounded-[2rem] border-4 border-brand-ink bg-white p-3 shadow-focus">
                  <div className="space-y-3 rounded-[1.2rem] bg-brand-panel-soft p-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-white">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-brand-green">Payment Successful</p>
                    <p className="text-[2rem] font-bold text-brand-orange-deep">{formatCurrency(selectedOrder.total)}</p>
                    <p className="text-xs text-brand-muted">Receipt: {selectedOrder.screenshotName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Declared Value</span><span className="font-bold text-brand-ink">{formatCurrency(selectedOrder.total)}</span></div>
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Transfer Mode</span><span className="font-bold text-brand-ink">GPay (UPI)</span></div>
              <div className="flex items-center justify-between border-b border-brand-border/50 pb-2"><span className="text-brand-muted">Area</span><span className="font-bold text-brand-ink">{selectedOrder.area}</span></div>
            </div>

            <button
              type="button"
              onClick={approveSelectedOrder}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110"
            >
              <CheckCircle2 className="h-5 w-5" />
              Approve & Verify Payment
            </button>
            <button type="button" className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-panel-soft px-5 py-4 text-sm font-bold text-red-600">
              Flag as Invalid / Suspicious
            </button>
          </aside>
        ) : null}
      </div>
    </DashboardShell>
  );
}
