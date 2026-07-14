"use client";

import { Plus, Search, UserPlus, UserRound } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { StoreSettings, User } from "@prisma/client";
import { createStaffAccount } from "@/app/actions/staff";
import { saveStoreSettings } from "@/app/actions/store-settings";
import { DashboardShell } from "@/components/dashboard-shell";
import type { Role } from "@/lib/users";

type AdminUsersPageProps = {
  currentRole: Role;
  userName: string;
  staff: User[];
  storeSettings: StoreSettings;
};

export function AdminUsersPage({ currentRole, userName, staff, storeSettings }: AdminUsersPageProps) {
  const [query, setQuery] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffState, staffFormAction, staffPending] = useActionState(createStaffAccount, undefined);
  const [settingsState, settingsFormAction, settingsPending] = useActionState(saveStoreSettings, undefined);

  const filteredStaff = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return staff;
    }

    return staff.filter((member) =>
      [member.name, member.username, member.role].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [staff, query]);

  return (
    <DashboardShell
      currentPath="/admin/users"
      currentRole={currentRole}
      userName={userName}
      title="Staff Management"
      subtitle="Manage your team's access levels and profiles."
      action={
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-orange-deep px-5 py-3 text-sm font-bold text-white">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-6">
          <label className="flex items-center gap-3 rounded-full bg-brand-panel-soft px-4 py-2.5 shadow-sm md:max-w-md">
            <Search className="h-5 w-5 text-brand-outline" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search staff members..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-brand-outline"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredStaff.map((member) => (
              <div key={member.id} className="panel rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-panel-high text-brand-ink">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink">{member.name}</p>
                    <p className="text-xs text-brand-muted">{member.username}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="rounded-full bg-brand-panel-soft px-3 py-1 text-xs font-bold capitalize text-brand-ink">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowAddStaff((current) => !current)}
              className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border/70 text-brand-muted transition hover:border-brand-green hover:text-brand-green"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-bold">Add New Staff</span>
            </button>
          </div>

          {showAddStaff ? (
            <div className="panel rounded-xl p-5">
              <form action={staffFormAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Name</span>
                  <input name="name" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Username</span>
                  <input name="username" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Password</span>
                  <input name="password" type="password" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Role</span>
                  <select name="role" required defaultValue="" className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none">
                    <option value="" disabled>Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </label>

                {staffState?.error ? (
                  <p className="md:col-span-2 xl:col-span-4 text-sm font-semibold text-red-600">{staffState.error}</p>
                ) : null}

                <button type="submit" disabled={staffPending} className="md:col-span-2 xl:col-span-4 rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                  {staffPending ? "Creating..." : "Create Account"}
                </button>
              </form>
            </div>
          ) : null}
        </section>

        <aside className="panel h-fit rounded-xl p-5">
          <h3 className="text-lg font-bold text-brand-ink">Store Configuration</h3>
          <p className="mt-1 text-sm text-brand-muted">Operating hours and hourly order capacity.</p>

          <form action={settingsFormAction} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Opening Time</span>
              <input
                type="time"
                name="openingTime"
                defaultValue={storeSettings.openingTime}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Closing Time</span>
              <input
                type="time"
                name="closingTime"
                defaultValue={storeSettings.closingTime}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Hourly Capacity</span>
              <input
                type="number"
                name="hourlyCapacity"
                min={1}
                defaultValue={storeSettings.hourlyCapacity}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>

            {settingsState?.error ? (
              <p className="text-sm font-semibold text-red-600">{settingsState.error}</p>
            ) : null}

            <button
              type="submit"
              disabled={settingsPending}
              className="w-full rounded-lg bg-brand-green px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {settingsPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </aside>
      </div>
    </DashboardShell>
  );
}
