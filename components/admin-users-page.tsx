"use client";

import Image from "next/image";
import { Download, ImageUp, Plus, Search, UserPlus, UserRound } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { Store, User } from "@prisma/client";
import { createStaffAccount } from "@/app/actions/staff";
import { DashboardShell } from "@/components/dashboard-shell";
import { downloadCsv } from "@/lib/csv-export";
import type { Role } from "@/lib/users";

type AdminUsersPageProps = {
  store: Store;
  currentRole: Role;
  userName: string;
  staff: User[];
};

export function AdminUsersPage({ store, currentRole, userName, staff }: AdminUsersPageProps) {
  const [query, setQuery] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffState, staffFormAction, staffPending] = useActionState(createStaffAccount, undefined);

  const filteredStaff = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return staff;
    }

    return staff.filter((member) =>
      [member.name, member.username, member.role].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [staff, query]);

  function exportStaff() {
    downloadCsv(
      `${store.slug}-staff.csv`,
      ["Name", "Username", "Email", "Role"],
      filteredStaff.map((member) => [member.name, member.username, member.email, member.role])
    );
  }

  return (
    <DashboardShell
      storeSlug={store.slug}
      storeName={store.name}
      currentPath={`/${store.slug}/admin/users`}
      currentRole={currentRole}
      userName={userName}
      title="Staff Management"
      subtitle="Manage your team's access levels and profiles."
      action={
        <div className="flex items-center gap-3">
          <button type="button" onClick={exportStaff} className="inline-flex items-center gap-2 rounded-lg border border-brand-green bg-white px-5 py-3 text-sm font-bold text-brand-green">
            <Download className="h-4 w-4" />
            Quick Export
          </button>
          <button
            type="button"
            onClick={() => setShowAddStaff((current) => !current)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange-deep px-5 py-3 text-sm font-bold text-white"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      }
    >
      <div className="space-y-6">
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
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-panel-high text-brand-ink">
                    {member.avatarUrl ? (
                      <Image src={member.avatarUrl} alt={member.name} fill sizes="48px" className="object-cover" />
                    ) : (
                      <UserRound className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink">{member.name}</p>
                    <p className="text-xs text-brand-muted">{member.username}</p>
                    <p className="text-xs text-brand-muted">{member.email}</p>
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
              <form action={staffFormAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Name</span>
                  <input name="name" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Username</span>
                  <input name="username" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-brand-ink">Email</span>
                  <input name="email" type="email" required className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none" />
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
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-panel-soft/40">
                  <ImageUp className="h-4 w-4 text-brand-green" />
                  Avatar (optional)
                  <input name="avatar" type="file" accept="image/*" className="sr-only" />
                </label>

                {staffState?.error ? (
                  <p className="md:col-span-2 xl:col-span-5 text-sm font-semibold text-red-600">{staffState.error}</p>
                ) : null}

                <button type="submit" disabled={staffPending} className="md:col-span-2 xl:col-span-5 rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                  {staffPending ? "Creating..." : "Create Account"}
                </button>
              </form>
            </div>
          ) : null}
      </div>
    </DashboardShell>
  );
}
