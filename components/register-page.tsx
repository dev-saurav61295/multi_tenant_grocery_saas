"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { register } from "@/app/actions/auth";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-2rem] top-[-2rem] h-80 w-80 rounded-full bg-brand-green-fixed/30 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-[-3rem] h-80 w-80 rounded-full bg-brand-orange/20 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green text-white shadow-card">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-[2.25rem] font-bold tracking-tight text-brand-ink">Bhagwandas Traders</h1>
          <p className="mt-2 text-base font-medium text-brand-muted">Create your customer account</p>
        </div>

        <div className="rounded-xl border border-brand-green/10 bg-white p-8 shadow-focus lg:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-ink">Register</h2>
            <p className="text-sm text-brand-muted">Create an account to place and track orders</p>
          </div>

          <form action={formAction} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Full Name</span>
              <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
                <UserRound className="h-5 w-5 text-brand-outline" />
                <input
                  type="text"
                  name="name"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="e.g. Neha Sharma"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Username</span>
              <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
                <Mail className="h-5 w-5 text-brand-outline" />
                <input
                  type="text"
                  name="username"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Password</span>
              <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
                <LockKeyhole className="h-5 w-5 text-brand-outline" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="Create a password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-brand-outline">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {state?.error ? (
              <p className="text-sm font-semibold text-red-600">{state.error}</p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="text-center text-sm text-brand-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand-green">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
