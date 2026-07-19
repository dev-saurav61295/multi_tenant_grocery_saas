"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";
import { MdStorefront } from "react-icons/md";

export default function OfflinePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg px-4 py-12 text-brand-ink">
      <div className="w-full max-w-md rounded-3xl border border-brand-border bg-white p-8 text-center shadow-card relative overflow-hidden">
        {/* Subtle top decoration bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-green via-brand-green-bright to-brand-green" />

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-panel-soft shadow-inner">
          <div className="relative">
            <MdStorefront className="text-[40px] text-brand-green" />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow">
              <WifiOff className="h-4 w-4" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-brand-ink">
          No Internet Connection
        </h1>
        <p className="mt-2 text-sm text-brand-muted leading-relaxed">
          It looks like your device is offline or experiencing network disruption. We cannot reach Bhagwandas Traders servers right now.
        </p>

        <div className="mt-6 rounded-xl bg-brand-panel-soft p-4 text-left border border-brand-border/60">
          <h2 className="text-xs font-bold text-brand-ink uppercase tracking-wider">
            Available Offline Actions:
          </h2>
          <ul className="mt-2 space-y-1.5 text-xs text-brand-muted">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
              Browse previously visited pages & cached inventory
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green shrink-0" />
              Review saved orders from your offline cache
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-brand hover:brightness-110 active:scale-[0.98] transition"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-ink hover:bg-brand-panel-soft transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
