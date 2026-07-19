"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { LockKeyhole, Upload, UserRound } from "lucide-react";
import type { Store } from "@prisma/client";
import {
  changeCustomerPassword,
  updateCustomerProfile,
  uploadCustomerAvatar,
} from "@/app/actions/customer-profile";
import { AccountMenu } from "@/components/account-menu";
import type { SessionPayload } from "@/lib/session";

type CustomerProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
};

type CustomerProfilePageProps = {
  store: Store;
  customer: CustomerProfile;
  session: SessionPayload | null;
};

export function CustomerProfilePage({ store, customer, session }: CustomerProfilePageProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateCustomerProfile, undefined);
  const [passwordState, passwordAction, passwordPending] = useActionState(changeCustomerPassword, undefined);
  const [avatarState, avatarAction, avatarPending] = useActionState(uploadCustomerAvatar, undefined);

  return (
    <div className="app-shell pb-12">
      <div className="bg-brand-orange px-4 py-1 text-center text-[11px] font-bold text-brand-ink">
        Delivering within 5KM | Operating Hours: 9:00 AM - 8:00 PM
      </div>
      <nav className="border-b border-brand-border/60 bg-brand-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <Link href={`/${store.slug}`} className="text-[2rem] font-bold tracking-tight text-brand-green">{store.name}</Link>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 md:flex">
              <Link href={`/${store.slug}`} className="text-sm font-medium text-brand-ink">Shop</Link>
              <Link href={`/${store.slug}/orders`} className="text-sm font-medium text-brand-ink">Orders</Link>
              <span className="border-b-2 border-brand-green pb-1 text-sm font-bold text-brand-green">Profile</span>
            </div>
            <AccountMenu storeSlug={store.slug} session={session} />
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
        <section className="rounded-xl border border-brand-border/70 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-brand-ink">Customer Profile</h1>
          <p className="mt-1 text-sm text-brand-muted">Manage your account details and security.</p>

          <div className="mt-6 flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-brand-panel-soft text-brand-muted">
              {customer.avatarUrl ? (
                <Image src={customer.avatarUrl} alt={customer.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <UserRound className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-ink">{customer.name}</p>
              <p className="text-sm text-brand-muted">@{customer.username}</p>
              <p className="text-sm text-brand-muted">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <form action={avatarAction} className="mt-5 space-y-3">
            <label className="block text-sm font-semibold text-brand-ink" htmlFor="avatar-upload">Profile photo</label>
            <input
              id="avatar-upload"
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
            />
            {avatarState?.error ? <p className="text-sm font-semibold text-red-600">{avatarState.error}</p> : null}
            {avatarState?.success ? <p className="text-sm font-semibold text-brand-green">{avatarState.success}</p> : null}
            <button
              type="submit"
              disabled={avatarPending}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-green px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-green/10 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {avatarPending ? "Uploading..." : "Upload Avatar"}
            </button>
          </form>
        </section>

        <section className="space-y-6">
          <form action={profileAction} className="rounded-xl border border-brand-border/70 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-brand-ink">Profile Details</h2>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">Full Name</span>
              <input
                name="name"
                defaultValue={customer.name}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
              />
              {profileState?.fieldErrors?.name ? (
                <p className="mt-1 text-sm font-semibold text-red-600">{profileState.fieldErrors.name}</p>
              ) : null}
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">Email</span>
              <input
                type="email"
                name="email"
                defaultValue={customer.email}
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
              />
              {profileState?.fieldErrors?.email ? (
                <p className="mt-1 text-sm font-semibold text-red-600">{profileState.fieldErrors.email}</p>
              ) : null}
            </label>

            {profileState?.error ? <p className="mt-4 text-sm font-semibold text-red-600">{profileState.error}</p> : null}
            {profileState?.success ? <p className="mt-4 text-sm font-semibold text-brand-green">{profileState.success}</p> : null}

            <button
              type="submit"
              disabled={profilePending}
              className="mt-5 rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {profilePending ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <form action={passwordAction} className="rounded-xl border border-brand-border/70 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-brand-ink">
              <LockKeyhole className="h-5 w-5" />
              Change Password
            </h2>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">Current Password</span>
              <input
                type="password"
                name="currentPassword"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
              />
              {passwordState?.fieldErrors?.currentPassword ? (
                <p className="mt-1 text-sm font-semibold text-red-600">{passwordState.fieldErrors.currentPassword}</p>
              ) : null}
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">New Password</span>
              <input
                type="password"
                name="newPassword"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
              />
              {passwordState?.fieldErrors?.newPassword ? (
                <p className="mt-1 text-sm font-semibold text-red-600">{passwordState.fieldErrors.newPassword}</p>
              ) : null}
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">Confirm New Password</span>
              <input
                type="password"
                name="confirmPassword"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
              />
              {passwordState?.fieldErrors?.confirmPassword ? (
                <p className="mt-1 text-sm font-semibold text-red-600">{passwordState.fieldErrors.confirmPassword}</p>
              ) : null}
            </label>

            {passwordState?.error ? <p className="mt-4 text-sm font-semibold text-red-600">{passwordState.error}</p> : null}
            {passwordState?.success ? <p className="mt-4 text-sm font-semibold text-brand-green">{passwordState.success}</p> : null}

            <button
              type="submit"
              disabled={passwordPending}
              className="mt-5 rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {passwordPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
