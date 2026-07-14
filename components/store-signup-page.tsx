"use client";

import { ArrowRight, LockKeyhole, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createStore } from "@/app/actions/store";

export function StoreSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(createStore, undefined);

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <section className="relative z-10 w-full max-w-md rounded-xl border border-brand-border/60 bg-white p-8 shadow-focus lg:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green text-white shadow-card">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-[2.25rem] font-bold tracking-tight text-brand-ink">Create a store</h1>
          <p className="mt-2 text-base font-medium text-brand-muted">Launch a new grocery tenant in minutes.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Store Name</span>
            <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
              <Store className="h-5 w-5 text-brand-outline" />
              <input name="storeName" className="w-full bg-transparent outline-none" placeholder="Fresh Mart Express" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Store Slug</span>
            <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
              <Store className="h-5 w-5 text-brand-outline" />
              <input name="storeSlug" className="w-full bg-transparent outline-none" placeholder="fresh-mart-express" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Name</span>
            <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
              <UserRound className="h-5 w-5 text-brand-outline" />
              <input name="adminName" className="w-full bg-transparent outline-none" placeholder="Store Administrator" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Username</span>
            <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
              <UserRound className="h-5 w-5 text-brand-outline" />
              <input name="adminUsername" className="w-full bg-transparent outline-none" placeholder="admin_user" required />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Password</span>
            <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
              <LockKeyhole className="h-5 w-5 text-brand-outline" />
              <input
                type={showPassword ? "text" : "password"}
                name="adminPassword"
                className="w-full bg-transparent outline-none"
                placeholder="Create a password"
                required
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-brand-outline">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {state?.error ? <p className="text-sm font-semibold text-red-600">{state.error}</p> : null}

          <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60">
            {pending ? "Creating Store..." : "Create Store"}
            <ArrowRight className="h-5 w-5" />
          </button>

          <p className="text-center text-sm text-brand-muted">
            Already have a store? <Link href="/" className="font-semibold text-brand-green">Back to landing</Link>
          </p>
        </form>
      </section>
    </div>
  );
}