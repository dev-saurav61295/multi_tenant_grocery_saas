"use client";

import { AlertTriangle, CheckCircle2, Clock3, Printer } from "lucide-react";
import { useState, useTransition } from "react";
import type { Prisma } from "@prisma/client";
import { dispatchOrder } from "@/app/actions/orders";
import { DashboardShell } from "@/components/dashboard-shell";
import type { Role } from "@/lib/users";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { user: true; items: { include: { product: true } } };
}>;

type StaffPackingPageProps = {
  currentRole: Role;
  userName: string;
  orders: OrderWithItems[];
};

export function StaffPackingPage({ currentRole, userName, orders }: StaffPackingPageProps) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});
  const [flaggedItems, setFlaggedItems] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0];

  if (!selectedOrder) {
    return (
      <DashboardShell
        currentPath="/staff/packing"
        currentRole={currentRole}
        userName={userName}
        title="Packing Station Panel"
        subtitle="Manage the ready queue and complete packing with checklist precision."
      >
        <div className="panel rounded-xl p-8 text-center text-brand-muted">Nothing in the packing queue right now.</div>
      </DashboardShell>
    );
  }

  const checkedForOrder = checkedItems[selectedOrder.id] ?? [];
  const flaggedForOrder = flaggedItems[selectedOrder.id] ?? [];
  const allChecked = selectedOrder.items.every((item) => checkedForOrder.includes(item.id));

  function toggleChecked(itemId: string) {
    setCheckedItems((current) => {
      const existing = current[selectedOrder.id] ?? [];
      const next = existing.includes(itemId) ? existing.filter((value) => value !== itemId) : [...existing, itemId];
      return { ...current, [selectedOrder.id]: next };
    });
  }

  function toggleFlagged(itemId: string) {
    setFlaggedItems((current) => {
      const existing = current[selectedOrder.id] ?? [];
      const next = existing.includes(itemId) ? existing.filter((value) => value !== itemId) : [...existing, itemId];
      return { ...current, [selectedOrder.id]: next };
    });
  }

  function markComplete() {
    startTransition(() => dispatchOrder(selectedOrder.id));
  }

  return (
    <DashboardShell
      currentPath="/staff/packing"
      currentRole={currentRole}
      userName={userName}
      title="Packing Station Panel"
      subtitle="Manage the ready queue and complete packing with checklist precision."
      action={
        <div className="flex items-center gap-3 rounded-full bg-brand-panel-soft px-4 py-2 text-sm font-bold text-brand-ink">
          <Clock3 className="h-4 w-4 text-brand-green" />
          {orders.length} READY
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <section className="rounded-xl border border-brand-border/50 bg-brand-panel-soft/60">
          <div className="flex items-center justify-between border-b border-brand-border/50 bg-white/70 px-5 py-4">
            <h2 className="text-xl font-semibold text-brand-ink">Queue</h2>
            <span className="rounded-full bg-brand-green-bright px-3 py-1 text-[10px] font-bold text-brand-ink">{orders.length} READY</span>
          </div>
          <div className="space-y-3 p-4">
            {orders.map((order) => {
              const active = order.id === selectedOrderId;
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-brand-green-bright bg-white shadow-card ring-4 ring-brand-green-bright/20" : "border-transparent bg-white hover:shadow-card"}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className={`text-sm font-bold ${active ? "text-brand-green" : "text-brand-ink"}`}>{order.displayId}</span>
                    <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${active ? "bg-brand-green/10 text-brand-green" : "bg-brand-panel-high text-brand-muted"}`}>{active ? "Packing" : "Wait"}</span>
                  </div>
                  <p className="text-sm text-brand-ink">{order.user.name}</p>
                  <p className="text-[11px] text-brand-muted">{order.items.length} items • Priority: {order.priority}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel flex min-h-[620px] flex-col rounded-xl bg-white">
          <div className="flex flex-col gap-4 border-b border-brand-border/50 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[2.3rem] font-bold tracking-tight text-brand-ink">Order {selectedOrder.displayId}</h2>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 font-bold text-brand-green"><CheckCircle2 className="h-4 w-4" /> Payment Verified</span>
                <span className="text-brand-outline">•</span>
                <span className="text-brand-muted">{priorityLabel(selectedOrder.priority)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Packing Items ({selectedOrder.items.length})</p>
            {selectedOrder.items.map((item, index) => {
              const isChecked = checkedForOrder.includes(item.id);
              const isFlagged = flaggedForOrder.includes(item.id);
              return (
                <div key={item.id} className="rounded-xl border border-brand-border/60 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${index % 2 === 0 ? "from-brand-panel-alt to-brand-green-fixed/30" : "from-brand-panel-soft to-brand-orange/20"}`} />
                      <div>
                        <p className="text-[1.15rem] font-semibold text-brand-ink">{item.product.name}</p>
                        <p className="mt-1 text-sm text-brand-muted">Qty: <span className="font-bold text-brand-green">{item.quantity}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleFlagged(item.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${isFlagged ? "border-brand-orange-deep bg-brand-orange-deep text-white" : "border-brand-orange-deep text-brand-orange-deep"}`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Flag Out of Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleChecked(item.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${isChecked ? "border-brand-green bg-brand-green text-white" : "border-brand-border text-brand-border"}`}
                        aria-label={`Toggle ${item.product.name} packed state`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex items-center gap-4 border-t border-brand-border/50 px-6 py-5">
            <button
              type="button"
              onClick={markComplete}
              disabled={!allChecked || isPending}
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl bg-brand-green px-6 py-5 text-lg font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              {isPending ? "Dispatching..." : "Mark Packing Complete & Dispatch"}
            </button>
            <button type="button" className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-panel-alt text-brand-ink">
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function priorityLabel(priority: string) {
  return priority === "Standard" ? "Standard Delivery" : priority;
}
