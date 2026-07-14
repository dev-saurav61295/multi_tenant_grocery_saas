# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Bhagwandas Traders — a Next.js App Router grocery SaaS platform. Almost everything is now backed by a real Postgres database via Prisma: users/auth, the product catalog, and the full order lifecycle (checkout → verification → packing → delivery) are genuine reads/writes, not mock data. The only things still purely local/ephemeral are in-progress UI state with no reason to be persisted — e.g. which row is selected in a table, a staff packing checklist's checked/flagged state, a delivery rider's compliance checklist before confirming drop-off.

## Commands

```bash
npm run dev         # start dev server (Turbopack) at http://localhost:3000
npm run build       # production build
npm run start       # run the production build
npm run lint        # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
npm run db:migrate  # apply Prisma migrations to DATABASE_URL (also auto-seeds)
npm run db:seed     # (re-)seed demo users/products/store settings/orders from prisma/seed.ts
```

There is no test suite/framework configured. Always run `npm run lint` and `npm run build` before considering a change done (per README's validation step) — `build` is the only type-check pass since `lint` alone won't catch TS errors.

## Architecture

**Route files are thin; components hold everything.** Every file under `app/**/page.tsx` does nothing but import and render one component from `components/`, named `<route>-page.tsx` (e.g. `app/admin/orders/page.tsx` renders `components/admin-orders-page.tsx`). When asked to change a page's behavior or markup, go straight to its `components/*.tsx` file, not the route file.

Every `app/**/page.tsx` is an `async` Server Component that fetches real data via Prisma (and, for protected routes, `verifySession()`/`requireRole()`) and passes it down as props — the actual `"use client"` page components underneath still own their own transient UI state via `useState`/`useMemo` (search filters, which row is selected, drawer/modal open state), but the underlying business data always comes from the database now, not from local component state or a mock array. Mutations go through `"use server"` Server Actions in `app/actions/*.ts` (`auth.ts`, `orders.ts`, `inventory.ts`, `staff.ts`, `store-settings.ts`), each calling `revalidatePath()` so the relevant Server Component re-fetches after a write. `lib/format.ts` (`formatCurrency`) is the one small shared display helper.

**Database**: `prisma/schema.prisma` defines `User`, `Product`, `Order`/`OrderItem` (the full order lifecycle, one row per order moving through a `status` enum: `pending_verification → packing → out_for_delivery → delivered`, with `verified` available but not currently used as a resting state — see `app/actions/orders.ts`), and a singleton `StoreSettings` row. `lib/prisma.ts` is the standard singleton `PrismaClient`. `lib/users.ts` is the only place that queries `User` directly (`findUserByCredentials`, `registerCustomer`, `createStaffUser`), hashing/comparing passwords with `bcryptjs`, and re-exports Prisma's generated `Role`/`User` types under the `Role`/`AppUser` names so other files can `import type { Role } from "@/lib/users"` without knowing Prisma exists. `lib/cart.ts` parses and server-side-prices a cart (`productId:quantity` pairs passed as a `?items=` search param from the catalog to `/checkout` — there's no client cart store) so totals are always recomputed from live `Product` rows, never trusted from the client. Local setup requires a `DATABASE_URL` (and `DIRECT_URL`, used only for migrations) in `.env` (see `.env.example`), then `npm run db:migrate` (runs migrations + auto-seeds) or `npm run db:seed` to (re-)seed demo users/products/orders from `prisma/seed.ts` (accounts: `admin_user` / `staff_user` / `delivery_user` / `neha_sharma` / `mohan_verma` / `aarav_jain` / `suhani_gupta`, all `password123`).

`components/dashboard-shell.tsx` (`DashboardShell`) is the sidebar nav + header shell for the operations surfaces (`admin/orders`, `admin/inventory`, `admin/users`, `staff/packing`, `delivery/dashboard`) — nav items are filtered by a `currentRole` prop so each role only sees the sections it can access, and highlighting is driven by a `currentPath` prop, not by reading the route itself. `components/storefront-shell.tsx` (`StorefrontShell`) is a customer-facing header/search/cart shell that exists but is **not actually used** by the catalog/checkout/order-tracking pages — each of those has its own inline header instead (a pre-existing inconsistency, not something introduced by any specific change); `components/account-menu.tsx` (`AccountMenu`, login/logout UI) is the one piece shared between them.

Dynamic routes use the async `params` convention — e.g. `app/order/[id]/page.tsx` awaits `params: Promise<{ id: string }>` before rendering `OrderTrackingPage`.

**Styling**: Tailwind v4 via `@tailwindcss/postcss` (no separate Tailwind CLI/config build step beyond `postcss.config.mjs`). Brand design tokens (colors, shadow, radius) are custom Tailwind theme extensions in `tailwind.config.ts` under the `brand.*` namespace (`brand.green`, `brand.orange`, `brand.panel`, `brand.sidebar`, etc.) — use these tokens rather than introducing new ad hoc colors. `lucide-react` is the icon set in use throughout.

**Design references**: `stitch_bhagwandas_traders_digital_marketplace/` contains Google Stitch design exports (one folder per screen, each with `screen.png` + `code.html`) that correspond to the app's routes. When implementing or revising a page's visual design, check the matching Stitch folder first for the intended look before inventing new UI.

**This repo pins a bleeding-edge Next.js version** (16.2.10, App Router only) — per `AGENTS.md`, do not assume training-data knowledge of Next.js APIs/conventions applies. Check `node_modules/next/dist/docs/` (organized into `01-app`, `02-pages`, `03-architecture`, `04-community`) before using any Next.js API you're not certain about in this version, and follow any deprecation notices found there.
