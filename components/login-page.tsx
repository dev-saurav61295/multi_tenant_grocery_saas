"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, MessageCircle, Store } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import type { Store as PrismaStore } from "@prisma/client";
import { login } from "@/app/actions/auth";
import { useGlobalLoader } from "@/components/GlobalLoaderProvider";

type LoginPageProps = {
  store: PrismaStore;
};

export function LoginPage({ store }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const boundLogin = login.bind(null, store.id);
  const [state, formAction, pending] = useActionState(boundLogin, undefined);
  const { showLoader, hideLoader } = useGlobalLoader();

  // Keep the loader up from submit until the dashboard route commits (the
  // provider clears it on the pathname change). On a failed login the action
  // returns an error instead of redirecting, so no route change is coming —
  // release the loader explicitly so the error is shown.
  useEffect(() => {
    if (pending) {
      showLoader();
    } else if (state?.error) {
      hideLoader();
    }
  }, [pending, state, showLoader, hideLoader]);

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-2rem] top-[-2rem] h-80 w-80 animate-pulse rounded-full bg-brand-green-fixed/30 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-[-3rem] h-80 w-80 animate-pulse rounded-full bg-brand-orange/20 blur-3xl [animation-delay:1s]" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green text-white shadow-card">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-[2.25rem] font-bold tracking-tight text-brand-ink">{store.name}</h1>
          <p className="mt-2 text-base font-medium text-brand-muted">Store &amp; Account Access</p>
        </div>

        <div className="rounded-xl border border-brand-green/10 bg-white p-8 shadow-focus lg:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-ink">Sign In</h2>
            <p className="text-sm text-brand-muted">Enter your credentials to access your account</p>
          </div>

          <form action={formAction} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-brand-muted">Username or Email</span>
              <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
                <Mail className="h-5 w-5 text-brand-outline" />
                <input
                  type="text"
                  name="username"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="e.g. admin_user"
                  required
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-semibold text-brand-muted">Password</span>
                <span className="text-sm font-semibold text-brand-muted">Forgot password? Contact store support.</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-brand-border/70 bg-white px-4 py-3 shadow-sm">
                <LockKeyhole className="h-5 w-5 text-brand-outline" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full bg-transparent outline-none placeholder:text-brand-outline"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="text-brand-outline">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-brand-muted">
              <input type="checkbox" name="remember" className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-brand-green" />
              Remember me for 30 days
            </label>

            {state?.error ? (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {state.error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Signing In..." : "Sign In to Dashboard"}
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-brand-outline">
              <span className="h-px flex-1 bg-brand-border" />
              Or continue with
              <span className="h-px flex-1 bg-brand-border" />
            </div>

            <button
              type="button"
              disabled
              title="WhatsApp sign-in is coming soon"
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-brand-green px-5 py-4 text-base font-bold text-brand-green opacity-60"
            >
              <MessageCircle className="h-5 w-5" />
              Continue with WhatsApp (coming soon)
            </button>

            <p className="text-center text-sm text-brand-muted">
              New customer?{" "}
              <Link href={`/${store.slug}/register`} className="font-semibold text-brand-green">
                Register here
              </Link>
            </p>
          </form>
        </div>

        <footer className="mt-8 text-center text-sm text-brand-muted">
          <p className="text-xs uppercase tracking-[0.28em]">Powered by <span className="font-bold text-brand-ink">FreshNeighbor SaaS</span></p>
          <p className="mt-4">Customer support details are available from your store admin.</p>
        </footer>
      </section>
    </div>
  );
}
