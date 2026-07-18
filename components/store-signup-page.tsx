"use client";

import { ArrowRight, LockKeyhole, Mail, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { createStore } from "@/app/actions/store";

export function StoreSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.storeName ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <Store className="h-5 w-5 text-brand-outline" />
              <input name="storeName" className="w-full bg-transparent outline-none" placeholder="Fresh Mart Express" required />
            </div>
            {state?.fieldErrors?.storeName ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.storeName}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Store Slug</span>
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.storeSlug ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <Store className="h-5 w-5 text-brand-outline" />
              <input name="storeSlug" className="w-full bg-transparent outline-none" placeholder="fresh-mart-express" required />
            </div>
            {state?.fieldErrors?.storeSlug ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.storeSlug}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Name</span>
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.adminName ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <UserRound className="h-5 w-5 text-brand-outline" />
              <input name="adminName" className="w-full bg-transparent outline-none" placeholder="Store Administrator" required />
            </div>
            {state?.fieldErrors?.adminName ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.adminName}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Username</span>
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.adminUsername ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <UserRound className="h-5 w-5 text-brand-outline" />
              <input name="adminUsername" className="w-full bg-transparent outline-none" placeholder="admin_user" required />
            </div>
            {state?.fieldErrors?.adminUsername ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.adminUsername}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Email</span>
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.adminEmail ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <Mail className="h-5 w-5 text-brand-outline" />
              <input type="email" name="adminEmail" className="w-full bg-transparent outline-none" placeholder="admin@example.com" required />
            </div>
            {state?.fieldErrors?.adminEmail ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.adminEmail}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Admin Password</span>
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.adminPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <LockKeyhole className="h-5 w-5 text-brand-outline" />
              <input
                type={showPassword ? "text" : "password"}
                name="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                placeholder="Create a password"
                required
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-brand-outline">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {state?.fieldErrors?.adminPassword ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.adminPassword}</p>
            ) : null}

            {password.length > 0 && (
              <div className="mt-2.5 rounded-lg border border-brand-border/40 bg-brand-panel-soft p-3 text-xs space-y-1.5">
                <p className="font-semibold text-brand-ink mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-brand-muted">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? 'bg-brand-green-bright' : 'bg-brand-outline'}`} />
                    <span className={password.length >= 8 ? 'text-brand-green font-bold' : ''}>8+ characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-brand-green-bright' : 'bg-brand-outline'}`} />
                    <span className={/[A-Z]/.test(password) ? 'text-brand-green font-bold' : ''}>One uppercase</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-brand-green-bright' : 'bg-brand-outline'}`} />
                    <span className={/[a-z]/.test(password) ? 'text-brand-green font-bold' : ''}>One lowercase</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${/\d/.test(password) ? 'bg-brand-green-bright' : 'bg-brand-outline'}`} />
                    <span className={/\d/.test(password) ? 'text-brand-green font-bold' : ''}>One number</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-brand-green-bright' : 'bg-brand-outline'}`} />
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-brand-green font-bold' : ''}>One special char (e.g. !@#$)</span>
                  </div>
                </div>
              </div>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-brand-muted">Confirm Admin Password</span>
            <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
              <LockKeyhole className="h-5 w-5 text-brand-outline" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                placeholder="Confirm your password"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="text-brand-outline">
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">Passwords do not match.</p>
            )}
            {confirmPassword.length > 0 && password === confirmPassword && (
              <p className="mt-1.5 text-xs text-brand-green font-semibold">Passwords match!</p>
            )}
            {state?.fieldErrors?.confirmPassword ? (
              <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.confirmPassword}</p>
            ) : null}
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