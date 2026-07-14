# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Bhagwandas Traders — a Next.js App Router frontend scaffold for a localized grocery SaaS platform. It is UI-only: every screen is built with mock data and local React state, simulating the full storefront + operations flow with no real backend, API routes, database, or auth.

## Commands

```bash
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
```

There is no test suite/framework configured. Always run `npm run lint` and `npm run build` before considering a change done (per README's validation step) — `build` is the only type-check pass since `lint` alone won't catch TS errors.

## Architecture

**Route files are thin; components hold everything.** Every file under `app/**/page.tsx` does nothing but import and render one component from `components/`, named `<route>-page.tsx` (e.g. `app/admin/orders/page.tsx` renders `components/admin-orders-page.tsx`). When asked to change a page's behavior or markup, go straight to its `components/*.tsx` file, not the route file.

Almost every page component is a `"use client"` component that owns its own state via `useState`/`useMemo` (cart quantities, search filters, drawer/modal open state, form fields). There are no server actions, no data-fetching layer, and no client-side global store — state is local to each page component. Shared data comes from `lib/mock-data.ts` (typed arrays: `catalogProducts`, `recentOrders`, `inventoryItems`, `packingOrders`, `deliveryStops`) and `lib/format.ts` (`formatCurrency`, INR via `Intl.NumberFormat`).

Two layout "shells" wrap all pages, and are the right place to change chrome shared across a surface:
- `components/storefront-shell.tsx` (`StorefrontShell`) — customer-facing header/search/cart bar, used by catalog, checkout, and order-tracking pages.
- `components/dashboard-shell.tsx` (`DashboardShell`) — sidebar nav + header for the operations surfaces (`admin/orders`, `admin/inventory`, `staff/packing`, `delivery/dashboard`); nav highlighting is driven by a `currentPath` prop passed in from each page, not by reading the route itself.

Dynamic routes use the async `params` convention — e.g. `app/order/[id]/page.tsx` awaits `params: Promise<{ id: string }>` before rendering `OrderTrackingPage`.

**Styling**: Tailwind v4 via `@tailwindcss/postcss` (no separate Tailwind CLI/config build step beyond `postcss.config.mjs`). Brand design tokens (colors, shadow, radius) are custom Tailwind theme extensions in `tailwind.config.ts` under the `brand.*` namespace (`brand.green`, `brand.orange`, `brand.panel`, `brand.sidebar`, etc.) — use these tokens rather than introducing new ad hoc colors. `lucide-react` is the icon set in use throughout.

**Design references**: `stitch_bhagwandas_traders_digital_marketplace/` contains Google Stitch design exports (one folder per screen, each with `screen.png` + `code.html`) that correspond to the app's routes. When implementing or revising a page's visual design, check the matching Stitch folder first for the intended look before inventing new UI.

**This repo pins a bleeding-edge Next.js version** (16.2.10, App Router only) — per `AGENTS.md`, do not assume training-data knowledge of Next.js APIs/conventions applies. Check `node_modules/next/dist/docs/` (organized into `01-app`, `02-pages`, `03-architecture`, `04-community`) before using any Next.js API you're not certain about in this version, and follow any deprecation notices found there.
