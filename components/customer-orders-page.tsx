import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { Prisma, Store } from "@prisma/client";
import { AccountMenu } from "@/components/account-menu";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import type { SessionPayload } from "@/lib/session";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: { select: { name: true } } } } };
}>;

type CustomerOrdersPageProps = {
  store: Store;
  orders: OrderWithItems[];
  session: SessionPayload | null;
};

export function CustomerOrdersPage({ store, orders, session }: CustomerOrdersPageProps) {
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
              <span className="border-b-2 border-brand-green pb-1 text-sm font-bold text-brand-green">Orders</span>
              <Link href={`/${store.slug}/profile`} className="text-sm font-medium text-brand-ink">Profile</Link>
            </div>
            <AccountMenu storeSlug={store.slug} session={session} />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
        <div className="mb-8 flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-brand-green" />
          <h1 className="text-[2.1rem] font-bold tracking-tight text-brand-ink">Your Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-brand-ink">No order history yet</h2>
            <p className="mt-2 text-sm text-brand-muted">Start shopping to place your first order from this store.</p>
            <Link
              href={`/${store.slug}`}
              className="mt-5 inline-flex rounded-lg bg-brand-green px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-brand-border/70 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">Order ID</p>
                    <h2 className="mt-1 text-lg font-bold text-brand-ink">{order.displayId}</h2>
                    <p className="mt-1 text-sm text-brand-muted">Placed on {order.createdAt.toLocaleString()}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-brand-muted">Status</p>
                    <p className="mt-1 text-sm font-bold text-brand-green">{orderStatusLabels[order.status]}</p>
                    <p className="mt-2 text-xl font-bold text-brand-orange-deep">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-brand-border/60 pt-4">
                  <p className="text-sm font-semibold text-brand-ink">Items</p>
                  <ul className="mt-2 space-y-1 text-sm text-brand-muted">
                    {order.items.slice(0, 3).map((item) => (
                      <li key={item.id}>
                        {item.product.name} x {item.quantity}
                      </li>
                    ))}
                    {order.items.length > 3 ? <li>+{order.items.length - 3} more items</li> : null}
                  </ul>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/${store.slug}/order/${order.displayId}`}
                    className="inline-flex rounded-lg border border-brand-green px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-green/10"
                  >
                    View Order Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
