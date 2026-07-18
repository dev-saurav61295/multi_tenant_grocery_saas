"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import type { Store as PrismaStore } from "@prisma/client";
import { register } from "@/app/actions/auth";

type RegisterPageProps = {
  store: PrismaStore;
};

export function RegisterPage({ store }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const boundRegister = register.bind(null, store.id);
  const [state, formAction, pending] = useActionState(boundRegister, undefined);

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
          <h1 className="mt-5 text-[2.25rem] font-bold tracking-tight text-brand-ink">{store.name}</h1>
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
              <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.name ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
                <UserRound className="h-5 w-5 text-brand-outline" />
                <input
                  type="text"
                  name="name"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="e.g. Neha Sharma"
                  required
                />
              </div>
              {state?.fieldErrors?.name ? (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.name}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Username</span>
              <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.username ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
                <UserRound className="h-5 w-5 text-brand-outline" />
                <input
                  type="text"
                  name="username"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="Choose a username"
                  required
                />
              </div>
              {state?.fieldErrors?.username ? (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.username}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Email</span>
              <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.email ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
                <Mail className="h-5 w-5 text-brand-outline" />
                <input
                  type="email"
                  name="email"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="you@example.com"
                  required
                />
              </div>
              {state?.fieldErrors?.email ? (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.email}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Password</span>
              <div className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm ${state?.fieldErrors?.password ? 'border-red-500 ring-1 ring-red-500' : 'border-brand-border/70'}`}>
                <LockKeyhole className="h-5 w-5 text-brand-outline" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="Create a password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-brand-outline">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {state?.fieldErrors?.password ? (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">{state.fieldErrors.password}</p>
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
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Confirm Password</span>
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
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
              <Link href={`/${store.slug}/login`} className="font-semibold text-brand-green">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <footer className="mt-8 text-center text-sm text-brand-muted">
          <p className="text-xs uppercase tracking-[0.28em]">Powered by <span className="font-bold text-brand-ink">FreshNeighbor SaaS</span></p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="#">Support</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </footer>
      </section>
    </div>
  );
}
