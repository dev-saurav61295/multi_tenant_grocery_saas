"use client";

import { useActionState } from "react";
import type { Store } from "@prisma/client";
import { saveStoreSettings } from "@/app/actions/store-settings";
import { DashboardShell } from "@/components/dashboard-shell";
import type { Role } from "@/lib/users";

type AdminSettingsPageProps = {
  store: Store;
  currentRole: Role;
  userName: string;
  ordersThisHour: number;
};

export function AdminSettingsPage({ store, currentRole, userName, ordersThisHour }: AdminSettingsPageProps) {
  const [settingsState, settingsFormAction, settingsPending] = useActionState(saveStoreSettings, undefined);

  const loadPercent = Math.min(100, Math.round((ordersThisHour / store.hourlyCapacity) * 100));
  const loadLabel = loadPercent >= 100 ? "At Capacity" : loadPercent >= 75 ? "Near Capacity" : "Optimal";
  const loadColor = loadPercent >= 100 ? "bg-red-500" : loadPercent >= 75 ? "bg-brand-orange-deep" : "bg-brand-green";

  return (
    <DashboardShell
      storeSlug={store.slug}
      storeName={store.name}
      currentPath={`/${store.slug}/admin/settings`}
      currentRole={currentRole}
      userName={userName}
      title="Store Settings"
      subtitle="Operating hours, hourly order capacity, and live load."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel rounded-xl p-5">
          <h3 className="text-lg font-bold text-brand-ink">Store Configuration</h3>
          <p className="mt-1 text-sm text-brand-muted">Operating hours and hourly order capacity.</p>

          <form action={settingsFormAction} className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Opening Time</span>
              <input
                type="time"
                name="openingTime"
                defaultValue={store.openingTime}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Closing Time</span>
              <input
                type="time"
                name="closingTime"
                defaultValue={store.closingTime}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Hourly Capacity</span>
              <input
                type="number"
                name="hourlyCapacity"
                min={1}
                defaultValue={store.hourlyCapacity}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>

            {settingsState?.error ? (
              <p className="md:col-span-3 text-sm font-semibold text-red-600">{settingsState.error}</p>
            ) : null}

            <button
              type="submit"
              disabled={settingsPending}
              className="md:col-span-3 rounded-lg bg-brand-green px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {settingsPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        <aside className="panel h-fit rounded-xl p-5">
          <h3 className="text-lg font-bold text-brand-ink">Real-Time Load</h3>
          <p className="mt-1 text-sm text-brand-muted">Orders placed in the current hour vs. hourly capacity.</p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-brand-ink">{ordersThisHour} / {store.hourlyCapacity} orders</span>
              <span className="font-bold text-brand-muted">{loadLabel}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-brand-panel-high">
              <div className={`h-full rounded-full ${loadColor}`} style={{ width: `${loadPercent}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
