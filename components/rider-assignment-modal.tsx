"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { assignRider } from "@/app/actions/orders";

export type RiderOption = {
  id: string;
  name: string;
  avatarUrl: string | null;
  activeOrderCount: number;
};

type RiderAssignmentModalProps = {
  order: { id: string; displayId: string; address: string; userName: string };
  riders: RiderOption[];
  onClose: () => void;
};

export function RiderAssignmentModal({ order, riders, onClose }: RiderAssignmentModalProps) {
  const router = useRouter();
  const [selectedRiderId, setSelectedRiderId] = useState(riders[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function confirmAssignment() {
    if (!selectedRiderId) {
      return;
    }

    startTransition(async () => {
      await assignRider(order.id, selectedRiderId);
      router.refresh();
      setStatus("success");
      setTimeout(onClose, 900);
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-focus">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-brand-ink">Assign Rider</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-brand-outline hover:bg-brand-panel-soft">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-brand-panel-soft p-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-muted">Order ID</p>
            <p className="font-bold text-brand-ink">{order.displayId}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-muted">Customer</p>
            <p className="font-bold text-brand-ink">{order.userName}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-muted">Delivery Address</p>
            <p className="font-bold text-brand-ink">{order.address}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-brand-muted">
            <span>Available Riders</span>
            <span className="rounded-full bg-brand-panel-soft px-2 py-0.5 text-brand-ink">{riders.length}</span>
          </p>

          {riders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-brand-border p-6 text-center text-sm text-brand-muted">
              No delivery staff found for this store yet.
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {riders.map((rider) => (
                <label
                  key={rider.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition ${
                    selectedRiderId === rider.id ? "border-brand-green bg-brand-green/5" : "border-brand-border/60 hover:bg-brand-panel-soft/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="rider"
                      checked={selectedRiderId === rider.id}
                      onChange={() => setSelectedRiderId(rider.id)}
                      className="h-4 w-4 text-brand-green focus:ring-brand-green"
                    />
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-panel-high text-sm font-bold text-brand-ink">
                      {rider.avatarUrl ? (
                        <Image src={rider.avatarUrl} alt={rider.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        rider.name.split(" ").map((part) => part[0]).slice(0, 2).join("")
                      )}
                    </div>
                    <span className="font-semibold text-brand-ink">{rider.name}</span>
                  </div>
                  <span className="text-xs text-brand-muted">
                    {rider.activeOrderCount} active order{rider.activeOrderCount === 1 ? "" : "s"}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-brand-border px-5 py-3 text-sm font-bold text-brand-ink">
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmAssignment}
            disabled={!selectedRiderId || isPending || riders.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {status === "success" ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Order Assigned!
              </>
            ) : isPending ? (
              "Assigning..."
            ) : (
              "Confirm Assignment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
