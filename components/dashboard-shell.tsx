"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { Bell, Boxes, ClipboardList, HelpCircle, LogOut, PackageCheck, Settings, ShieldCheck, Truck } from "lucide-react";
import { logout } from "@/app/actions/auth";
import type { Role } from "@/lib/users";

const allNavItems = [
  { href: "/admin/orders", label: "Orders Queue", icon: ClipboardList, roles: ["admin"] as Role[] },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, roles: ["admin"] as Role[] },
  { href: "/admin/users", label: "Staff & Users", icon: ShieldCheck, roles: ["admin"] as Role[] },
  { href: "/admin/settings", label: "Store Settings", icon: Settings, roles: ["admin"] as Role[] },
  { href: "/staff/packing", label: "Packing Station", icon: PackageCheck, roles: ["staff"] as Role[] },
  { href: "/delivery/dashboard", label: "Delivery Portal", icon: Truck, roles: ["delivery"] as Role[] },
];

type DashboardShellProps = {
  storeSlug: string;
  storeName: string;
  currentPath: string;
  currentRole: Role;
  userName: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
};

export function DashboardShell({
  storeSlug,
  storeName,
  currentPath,
  currentRole,
  userName,
  title,
  subtitle,
  children,
  action,
}: DashboardShellProps) {
  const navItems = allNavItems.filter((item) => item.roles.includes(currentRole));
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const initials = userName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-brand-background text-brand-ink">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-8 bg-brand-sidebar px-6 py-8 text-white shadow-focus">
          <div className="space-y-3">
            <div>
              <h1 className="text-[2rem] font-bold tracking-tight text-brand-green-fixed">{storeName}</h1>
              <p className="text-sm text-brand-border/80">Admin Panel</p>
            </div>
          </div>

          <nav aria-label="Dashboard navigation" className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
                const href = `/${storeSlug}${item.href}`;

              return (
                <Link
                  key={item.href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-brand-orange text-brand-ink"
                      : "text-brand-border hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <button className="w-full rounded-xl bg-brand-green-bright px-4 py-3 text-sm font-bold text-brand-ink">
              + New Order
            </button>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Today&apos;s service window</p>
              <p className="mt-2 text-sm text-brand-border">9:00 AM to 8:00 PM across the 5KM delivery radius.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm font-semibold">Signed in as {userName}</p>
              <form action={logout.bind(null, storeSlug)}>
                <button
                  type="submit"
                  aria-label="Log out"
                  className="flex items-center gap-1 text-sm font-semibold text-brand-border hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-4 border-b border-brand-border/60 bg-brand-panel px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex flex-1 items-center gap-4">
              <div>
              <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {action}
              <button type="button" aria-label="Notifications" className="rounded-full p-2 text-brand-outline hover:bg-brand-panel-soft">
                <Bell className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Help" className="rounded-full p-2 text-brand-outline hover:bg-brand-panel-soft">
                <HelpCircle className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAccountMenu((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-panel-high text-sm font-bold text-brand-ink"
                >
                  {initials}
                </button>
                {showAccountMenu ? (
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-brand-border/60 bg-white p-3 shadow-focus">
                    <p className="truncate text-sm font-bold text-brand-ink">{userName}</p>
                    <p className="text-xs capitalize text-brand-muted">{currentRole}</p>
                    <form action={logout.bind(null, storeSlug)} className="mt-3">
                      <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}