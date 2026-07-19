# Multi-Tenant Grocery SaaS

A path-based, multi-tenant grocery commerce platform built on the Next.js App Router. Each store gets its own storefront and operations dashboards under `/{store-slug}/...`, backed by a shared Postgres database with per-tenant isolation.

A store's full order lifecycle is covered end to end: customer catalog and cart → checkout (UPI with payment-proof upload, or Pay on Delivery) → admin payment verification → staff packing → rider assignment and delivery — with transactional emails and live dashboard updates at every step.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19** + TypeScript
- **Postgres** via **Prisma** (hosted on Supabase; any Postgres works)
- **Supabase Realtime** (broadcast channels) for live dashboard/notification updates — optional, falls back to polling
- **Tailwind CSS v4** with custom brand tokens, `lucide-react` icons
- **Nodemailer** for transactional email, with a database audit log
- **bcryptjs** cookie-session auth, `qrcode` for server-rendered UPI QR codes

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment — copy `.env.example` to `.env` and fill in:

   | Variable | Purpose |
   |---|---|
   | `DATABASE_URL` | Postgres connection string (e.g. Supabase pooler) |
   | `DIRECT_URL` | Direct Postgres connection, used only by migrations |
   | `SMTP_HOST/PORT/USER/PASSWORD/FROM_ADDRESS` | Transactional email |
   | `APP_BASE_URL` | Absolute origin for links inside emails |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (realtime, optional) |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key (realtime, optional) |
   | `SUPABASE_SECRET_KEY` | Supabase secret/service-role key (realtime, optional) |

   Without the three Supabase variables the app still works — dashboards refresh every 30 seconds instead of instantly.

3. Create the schema and seed demo data:

   ```bash
   npm run db:migrate   # applies migrations, then auto-seeds
   ```

4. Run it:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` and pick the demo store, or create your own store at `/signup`.

## Demo Accounts

Seeded into the `bhagwandas-traders` demo store, all with password `password123`:

| Username | Role | Lands on |
|---|---|---|
| `admin_user` | Admin | Orders queue, inventory, users, settings |
| `staff_user` | Staff | Packing station |
| `delivery_user` | Delivery | Rider manifest |
| `neha_sharma` | Customer | Storefront catalog |

## Routes (per store)

- `/{store}` — customer catalog with cart and combo discounts
- `/{store}/checkout` — bill, UPI QR + payment-proof upload or Pay on Delivery
- `/{store}/order/{displayId}` — live order tracking
- `/{store}/login`, `/{store}/register`, `/{store}/verify-email` — tenant-scoped auth
- `/{store}/admin/orders` · `/inventory` · `/users` · `/settings` — admin dashboards
- `/{store}/staff/packing` — packing station
- `/{store}/delivery/dashboard`, `/{store}/delivery/complete/{orderId}` — rider flow
- `/signup` — public store onboarding (creates the store + first admin)

## Realtime Updates

Order mutations broadcast a lightweight event on a per-store Supabase Realtime channel; open dashboards (admin queue, packing station, rider manifest, customer order tracking) subscribe and re-fetch their server data automatically. Place an order in one browser and watch it appear on the admin queue in another within a second — no refresh.

Dashboards also surface role-relevant events as toast notifications with a soft chime: admins are alerted to new orders and completed deliveries, packing staff to newly approved orders, and riders to assignments and pickups.

The Supabase coupling is confined to `lib/realtime.ts` (publish) and `lib/use-store-events.ts` (subscribe), so the provider can be swapped without touching business logic.

## Commands

```bash
npm run dev         # dev server at http://localhost:3000
npm run build       # production build (also the type-check pass)
npm run start       # serve the production build
npm run lint        # ESLint
npm run db:migrate  # apply Prisma migrations + auto-seed
npm run db:seed     # (re-)seed demo data
```

## Validation

Before shipping changes, run:

```bash
npm run lint
npm run build
```

There is no test suite; `npm run build` is the only full type-check.
