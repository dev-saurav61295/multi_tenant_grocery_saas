"use client";

import Link from "next/link";
import { CheckCircle2, CheckSquare, MapPinned } from "lucide-react";
import { useState, useTransition } from "react";
import type { Prisma, Store } from "@prisma/client";
import { completeDelivery } from "@/app/actions/orders";
import { DashboardShell } from "@/components/dashboard-shell";
import { formatCurrency } from "@/lib/format";
import type { Role } from "@/lib/users";

type OrderWithItems = Prisma.OrderGetPayload<{ include: { user: true } }>;

type DeliveryCompletePageProps = {
  store: Store;
  order: OrderWithItems | null;
  currentRole: Role;
  userName: string;
};

const checklistLabels = {
  itemsMatched: "Items matched with Manifest",
  paymentUploaded: "Payment verification screenshot uploaded",
  sanitized: "Sanitized hands before handling",
} as const;

export function DeliveryCompletePage({ store, order, currentRole, userName }: DeliveryCompletePageProps) {
  const [checklist, setChecklist] = useState({
    itemsMatched: true,
    paymentUploaded: false,
    sanitized: false,
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allChecked = Object.values(checklist).every(Boolean);

  function toggle(key: keyof typeof checklist) {
    setChecklist((current) => ({ ...current, [key]: !current[key] }));
  }

  function confirmDropOff() {
    if (!order) {
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await completeDelivery(order.id);
        setConfirmed(true);
      } catch {
        setError("Something went wrong finalizing this order. Please try again.");
      }
    });
  }

  if (!order) {
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
        <div className="panel rounded-xl p-8 text-center">
          <p className="text-lg font-semibold text-brand-ink">Stop not found</p>
          <p className="mt-2 text-sm text-brand-muted">This delivery stop doesn&apos;t exist or has already been removed from the manifest.</p>
          <Link href={`/${store.slug}/delivery/dashboard`} className="mt-6 inline-flex rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white">
            Back to Dashboard
          </Link>
        </div>
      </DashboardShell>
    );
  }

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
      {confirmed ? (
        <div className="panel mx-auto max-w-lg rounded-2xl p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-green-bright text-brand-green">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-[2rem] font-bold tracking-tight text-brand-green">Delivery Complete!</h2>
          <p className="mt-2 text-sm text-brand-muted">Order {order.displayId} for {order.user.name} has been finalized.</p>
          <Link
            href={`/${store.slug}/delivery/dashboard`}
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-brand-border/40 bg-white shadow-focus">
          <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-brand-border/30">
            <div className="space-y-8 p-6 lg:p-8">
              <div>
                <span className="inline-flex rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink">Manifest Summary</span>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Order ID</p>
                <p className="mt-2 text-[3rem] font-bold tracking-tight text-brand-green">{order.displayId}</p>
              </div>

              <div className="flex items-end justify-between border-b border-brand-border/20 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Total Bill Amount</p>
                  <p className="mt-2 text-[2.2rem] font-bold text-brand-orange-deep">{formatCurrency(order.total)}</p>
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
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">
                  <MapPinned className="h-4 w-4 text-brand-green" /> Drop-off Location
                </p>
                <div className="mt-4 rounded-xl border border-brand-border/50 bg-white p-4">
                  <p className="font-semibold text-brand-ink">{order.address}</p>
                  <p className="mt-2 text-sm text-brand-muted">Within 5KM service radius</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Compliance Checklist</p>
                <div className="mt-4 space-y-3">
                  {(Object.keys(checklistLabels) as Array<keyof typeof checklistLabels>).map((key) => (
                    <label key={key} className="flex items-center gap-3 rounded-lg border border-brand-border/50 bg-white px-4 py-3 text-sm text-brand-ink">
                      <input
                        type="checkbox"
                        checked={checklist[key]}
                        onChange={() => toggle(key)}
                        className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-brand-green"
                      />
                      {checklistLabels[key]}
                    </label>
                  ))}
                </div>
              </div>

              {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

              <button
                type="button"
                disabled={!allChecked || isPending}
                onClick={confirmDropOff}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-green px-6 py-5 text-[1.55rem] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckSquare className="h-6 w-6" />
                {isPending ? "Finalizing..." : "Confirm Drop-off & Finalize Order"}
              </button>
            </div>
          </div>
        </section>
      )}
    </DashboardShell>
  );
}
