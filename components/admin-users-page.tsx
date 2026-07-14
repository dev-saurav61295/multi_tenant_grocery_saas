"use client";

import { Plus, Search, UserPlus, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { staffMembers } from "@/lib/mock-data";
import type { Role } from "@/lib/users";

type AdminUsersPageProps = {
  currentRole: Role;
  userName: string;
};

const statusStyles: Record<string, string> = {
  "Active Now": "bg-brand-green-bright",
};

export function AdminUsersPage({ currentRole, userName }: AdminUsersPageProps) {
  const [query, setQuery] = useState("");
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("20:00");
  const [hourlyCapacity, setHourlyCapacity] = useState(40);
  const [saved, setSaved] = useState(false);

  const filteredStaff = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return staffMembers;
    }

    return staffMembers.filter((member) =>
      [member.name, member.email, member.role].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query]);

  const capacityLoadPercent = 65;

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
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-panel-high text-brand-ink">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-ink">{member.name}</p>
                      <p className="text-xs text-brand-muted">{member.email}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-brand-panel-soft px-3 py-1 text-xs font-bold text-brand-ink">
                    {member.role}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-brand-muted">
                    <span className={`h-2 w-2 rounded-full ${statusStyles[member.status] ?? "bg-brand-outline"}`} />
                    {member.status}
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border/70 text-brand-muted transition hover:border-brand-green hover:text-brand-green"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm font-bold">Add New Staff</span>
            </button>
          </div>
        </section>

        <aside className="panel h-fit rounded-xl p-5">
          <h3 className="text-lg font-bold text-brand-ink">Store Configuration</h3>
          <p className="mt-1 text-sm text-brand-muted">Operating hours and hourly order capacity.</p>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Opening Time</span>
              <input
                type="time"
                value={openingTime}
                onChange={(event) => setOpeningTime(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Closing Time</span>
              <input
                type="time"
                value={closingTime}
                onChange={(event) => setClosingTime(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Hourly Capacity</span>
              <input
                type="number"
                min={1}
                value={hourlyCapacity}
                onChange={(event) => setHourlyCapacity(Number(event.target.value))}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm outline-none"
              />
            </label>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-muted">
                <span>Capacity Load</span>
                <span>{capacityLoadPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-panel-high">
                <div className="h-2 rounded-full bg-brand-green" style={{ width: `${capacityLoadPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-brand-muted">Operating at {capacityLoadPercent}% of max capacity.</p>
            </div>

            <button
              type="button"
              onClick={() => setSaved(true)}
              className="w-full rounded-lg bg-brand-green px-4 py-3 text-sm font-bold text-white"
            >
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
