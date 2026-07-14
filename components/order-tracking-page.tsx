import Link from "next/link";
import { CheckCircle2, MapPin, MessageCircleMore } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { AccountMenu } from "@/components/account-menu";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import type { SessionPayload } from "@/lib/session";
import type { Store } from "@prisma/client";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } };
}>;

type OrderTrackingPageProps = {
  store: Store;
  order: OrderWithItems;
  session: SessionPayload | null;
};

export function OrderTrackingPage({ store, order, session }: OrderTrackingPageProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const delivered = order.status === "delivered";

  return (
    <div className="app-shell pb-12">
      <div className="bg-brand-orange px-4 py-1 text-center text-[11px] font-bold text-brand-ink">
        Delivering within 5KM | Operating Hours: 9:00 AM - 8:00 PM
      </div>
      <nav className="border-b border-brand-border/60 bg-brand-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <Link href={`/${store.slug}`} className="text-[2rem] font-bold tracking-tight text-brand-green">{store.name}</Link>
          <AccountMenu storeSlug={store.slug} session={session} />
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-green-bright text-brand-green shadow-focus">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <h1 className="mt-8 text-[3rem] font-bold tracking-tight text-brand-green">
            {delivered ? "Order Delivered!" : "Order Submitted Successfully!"}
          </h1>
          <p className="mt-3 text-base text-brand-muted">Thank you for shopping with Bhagwandas Traders. Your fresh groceries are one step closer.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.65fr_0.95fr]">
          <div className="soft-card rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand-muted">Order Information</span>
              <span className="status-pill inline-flex items-center gap-2 bg-brand-orange text-white">
                {!delivered ? <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> : null}
                {orderStatusLabels[order.status]}
              </span>
            </div>
            <h2 className="mt-4 text-[2.1rem] font-bold tracking-tight text-brand-ink">{order.displayId}</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Placed {order.createdAt.toLocaleDateString()} and queued for manual verification.
            </p>
            <div className="mt-6 border-t border-brand-border/60 pt-6 text-base leading-7 text-brand-ink">
              Our team is currently verifying your manual payment receipt. Please allow <span className="font-bold text-brand-green">5-15 minutes</span> for this process to complete. You will receive a notification as soon as your order is confirmed and moves to the packaging stage.
            </div>
          </div>

          <div className="rounded-xl bg-brand-panel-alt p-6">
            <h3 className="text-xl font-semibold text-brand-ink">Order Summary</h3>
            <div className="mt-5 space-y-4 text-sm text-brand-ink">
              <div className="flex items-center justify-between"><span>Items ({itemCount})</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.comboDiscount > 0 ? (
                <div className="flex items-center justify-between text-brand-green"><span>Combo discount</span><span>-{formatCurrency(order.comboDiscount)}</span></div>
              ) : null}
              <div className="flex items-center justify-between border-t border-brand-border/60 pt-4"><span className="font-bold">Total Amount</span><span className="text-[1.5rem] font-bold text-brand-orange-deep">{formatCurrency(order.total)}</span></div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-brand-border/50 bg-brand-panel px-4 py-4">
              <MapPin className="mt-0.5 h-5 w-5 text-brand-green" />
              <div>
                <p className="text-sm font-bold text-brand-ink">Delivery to:</p>
                <p className="text-sm text-brand-muted">{order.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-brand-border/70 bg-white">
          {order.items.map((item, index) => (
            <div key={item.id} className={`flex items-center justify-between px-5 py-4 ${index === order.items.length - 1 ? "" : "border-b border-brand-border/50"}`}>
              <div>
                <p className="font-semibold text-brand-ink">{item.product.name}</p>
                <p className="text-sm text-brand-muted">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-brand-ink">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row">
          <Link
            href={`https://wa.me/919876521000?text=${encodeURIComponent(`Hi Bhagwandas Traders, I need help with order ${order.displayId}.`)}`}
            className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-brand-green px-6 py-4 text-base font-bold text-brand-green transition hover:bg-brand-green/10"
          >
            <MessageCircleMore className="h-5 w-5" />
            Chat with Store on WhatsApp
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl shadow-focus">
          <div className="relative h-64 bg-gradient-to-br from-brand-panel-alt via-brand-green-fixed/30 to-brand-orange/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.7),transparent_25%),radial-gradient(circle_at_70%_55%,rgba(0,109,55,0.15),transparent_18%),radial-gradient(circle_at_40%_70%,rgba(252,143,52,0.18),transparent_20%)]" />
            <div className="absolute bottom-6 left-6">
              <p className="text-2xl font-semibold text-brand-ink">
                {delivered ? "Delivered — enjoy your groceries!" : "Preparing the freshest produce for you"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="surface-footer mt-10 px-6 py-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4 text-sm text-brand-muted">
          <div>
            <h3 className="text-xl font-bold text-brand-green">{store.name}</h3>
            <p className="mt-2">Quality local groceries. Delivering freshness to your doorstep.</p>
          </div>
          <div>
            <p className="font-bold text-brand-ink">Links</p>
            <p className="mt-2">Store Locator</p>
            <p>Contact Us</p>
          </div>
          <div>
            <p className="font-bold text-brand-ink">Support</p>
            <p className="mt-2">Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
          <div>
            <p className="font-bold text-brand-ink">Contact</p>
            <p className="mt-2">Chat on WhatsApp</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
