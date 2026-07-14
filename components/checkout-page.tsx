"use client";

import Link from "next/link";
import { CreditCard, ImageUp } from "lucide-react";
import { useActionState, useState } from "react";
import { AccountMenu } from "@/components/account-menu";
import { placeOrder } from "@/app/actions/orders";
import { formatCurrency } from "@/lib/format";
import type { PricedCart } from "@/lib/pricing";
import type { SessionPayload } from "@/lib/session";

type CheckoutPageProps = {
  session: SessionPayload | null;
  cart: PricedCart;
  itemsParam: string;
};

export function CheckoutPage({ session, cart, itemsParam }: CheckoutPageProps) {
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [state, formAction, pending] = useActionState(placeOrder, undefined);

  return (
    <div className="app-shell pb-32">
      <div className="bg-brand-orange px-4 py-1 text-center text-[11px] font-bold text-brand-ink">
        Delivering within 5KM | Operating Hours: 9:00 AM - 8:00 PM
      </div>
      <nav className="border-b border-brand-border/60 bg-brand-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <Link href="/" className="text-[2rem] font-bold tracking-tight text-brand-green">Bhagwandas Traders</Link>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 md:flex">
              <a className="text-sm text-brand-muted" href="#">Catalog</a>
              <a className="text-sm text-brand-muted" href="#">Orders</a>
              <span className="border-b-2 border-brand-green pb-1 text-sm font-bold text-brand-green">Checkout</span>
            </div>
            <AccountMenu session={session} />
          </div>
        </div>
      </nav>

      <form action={formAction}>
        <input type="hidden" name="items" value={itemsParam} />
        <input type="hidden" name="screenshotName" value={uploadedFileName} />

        <div className="px-4 py-6 lg:px-6 lg:py-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="panel rounded-xl p-6 lg:p-8">
              <div className="mb-6 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-brand-green" />
                <h1 className="text-[2.1rem] font-bold tracking-tight text-brand-ink">Order Summary</h1>
              </div>

              <div className="overflow-hidden rounded-xl border border-brand-border/70 bg-white">
                {cart.lines.map((item, index) => (
                  <div key={item.productId} className={`flex items-center justify-between px-5 py-5 ${index === cart.lines.length - 1 ? "" : "border-b border-brand-border/50"}`}>
                    <div>
                      <p className="text-[1.15rem] font-semibold text-brand-ink">{item.name}</p>
                      <p className="text-sm text-brand-muted">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-[1.6rem] font-bold text-brand-ink">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {cart.comboDiscount > 0 ? (
                <div className="mt-6 rounded-xl border border-brand-green/20 bg-brand-green/10 p-4">
                  <div className="flex items-center justify-between text-sm font-bold text-brand-green">
                    <span>Tiered combo discount</span>
                    <span>-{formatCurrency(cart.comboDiscount)}</span>
                  </div>
                  <p className="mt-2 text-sm text-brand-muted">₹20 off per combo-eligible item bought 3 or more at a time.</p>
                </div>
              ) : null}

              <div className="mt-6 space-y-2 border-t border-brand-border/70 pt-6">
                <div className="flex items-center justify-between text-sm text-brand-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex items-end justify-between pt-2">
                  <span className="text-[2rem] font-bold text-brand-ink">Grand Total</span>
                  <div className="text-right">
                    <span className="text-[3rem] font-bold tracking-tight text-brand-orange-deep">{formatCurrency(cart.total)}</span>
                    <p className="text-[11px] font-bold text-brand-muted">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-semibold text-brand-ink">Phone Number</span>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. +91 98765 21001"
                  className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-brand-ink">Delivery Address</span>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="House/flat no., street, landmark, area"
                  className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 outline-none"
                />
              </label>

              {state?.error ? (
                <p className="mt-4 text-sm font-semibold text-red-600">{state.error}</p>
              ) : null}

              <div className="mt-4 rounded-xl bg-brand-panel-alt px-4 py-4 text-sm text-brand-muted">
                Your payment is secured by end-to-end encryption. Bhagwandas Traders manually verifies every screenshot for order confirmation.
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-focus lg:p-8">
              <div className="text-center">
                <h2 className="text-[1.8rem] font-bold text-brand-ink">Scan to Pay</h2>
                <p className="mt-2 text-sm text-brand-muted">Complete payment via any UPI app</p>
              </div>

              <div className="mt-6 grid place-items-center rounded-xl bg-brand-panel-soft p-6">
                <div className="grid h-72 w-full max-w-xs place-items-center rounded-xl bg-brand-panel-alt">
                  <div className="grid h-52 w-52 grid-cols-6 gap-2 rounded-2xl bg-white p-4 shadow-card">
                    {Array.from({ length: 36 }).map((_, index) => (
                      <div
                        key={index}
                        className={`${index % 2 === 0 || index % 5 === 0 ? "bg-brand-green" : "bg-brand-panel-soft"} rounded-sm`}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="inline-flex rounded-full bg-brand-orange-deep px-3 py-1 text-[11px] font-bold text-white">BHAGWANDAS@UPI</p>
                  </div>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-brand-orange bg-brand-orange/5 px-6 py-10 text-center transition hover:bg-brand-orange/10">
                <div className="rounded-full bg-brand-orange p-4 text-white shadow-card">
                  <ImageUp className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-brand-ink">Upload Payment Screenshot</p>
                  <p className="mt-1 text-sm text-brand-muted">JPG, PNG or PDF accepted for manual verification.</p>
                </div>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setUploadedFileName(file?.name ?? "");
                  }}
                />
              </label>

              <div className="mt-4 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-muted">
                {uploadedFileName || "No screenshot uploaded yet"}
              </div>
              <p className="mt-4 text-center text-sm italic text-brand-muted">Verification usually takes 5-10 minutes.</p>
            </section>
          </div>
        </div>

        <footer className="surface-footer fixed inset-x-0 bottom-0 z-30">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-6">
            <div className="hidden md:block">
              <p className="text-sm font-bold text-brand-ink">Confirming order for: {formatCurrency(cart.total)}</p>
              <p className="text-sm text-brand-muted">Payment verification will start immediately.</p>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-brand-green px-5 py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60 md:w-auto md:min-w-[320px]"
            >
              <CreditCard className="h-5 w-5" />
              {pending ? "Submitting..." : "Submit Order for Verification"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
