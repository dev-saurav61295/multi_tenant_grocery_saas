# Improvement Prompts

Seven self-contained prompts for improving this codebase, ordered by recommended execution sequence. Each prompt is designed to be handed to a coding agent as-is.

**Read this section before running any prompt:**

- Read `CLAUDE.md` first — it describes the architecture (thin routes → `components/*.tsx`, Server Actions in `app/actions/*.ts`, tenant isolation by `storeId`, realtime doorbell events, etc.). Follow its conventions exactly.
- This repo pins **Next.js 16** (bleeding-edge). Do not trust training-data knowledge of Next.js APIs — check `node_modules/next/dist/docs/` before using anything you're not sure about. Middleware here is `proxy.ts` (default-exported `proxy` function), NOT `middleware.ts`.
- There is no test suite. Validation = `npm run lint` && `npm run build` (build is the only type-check). Both must pass before you're done.
- Do NOT install browser-automation tooling to verify UI. Instead, finish by writing a short numbered **manual test script** (exact URLs, demo credentials, expected results) for the user to run. Demo logins: `admin_user` / `staff_user` / `delivery_user` / `neha_sharma`, all password `password123`, store slug `bhagwandas-traders`.
- Money is integer rupees. Dates/IDs: `displayId` format is `{codePrefix}-{YYMMDD}-{100+orderNumber}`.
- Prisma migrations: use `npx prisma migrate dev --create-only --name <name>`, inspect/edit the SQL if data backfill is needed, then apply. The dev DB is a Supabase pooler that is **intermittently unreachable — retry on P1001 errors, never `migrate reset`** (it would wipe data; drift was already baselined in `prisma/migrations/20260715000000_add_payment_method`).
- Dependency note: Prompts 3 and 5 both extend `StoreEventKind` in `lib/store-channel.ts`; if running both, do them in sequence, not in parallel. Prompt 2 unblocks full category deletion (reassignment). Otherwise prompts are independent.

---

## Prompt 1 — Sign the session cookie (HMAC)

**Goal:** Make the session cookie tamper-proof. Today `lib/session.ts` stores plain unencrypted JSON (`{id, username, name, role, storeId, storeSlug}`) in an httpOnly cookie; anyone can edit `role` to `"admin"` in their browser and the app trusts it.

**Design decisions (do not re-litigate):**
- Use **HMAC-SHA256 over the JSON payload** with a server secret, cookie value = `base64url(payloadJson) + "." + base64url(signature)`. No new dependencies — no iron-session, no JWT library.
- Implement sign/verify with the **Web Crypto API (`crypto.subtle`)**, NOT Node's `crypto` module — `proxy.ts` (Middleware) must be able to verify, and it may run on the Edge runtime. Put the helpers in a new zero-dependency module `lib/session-signing.ts` (same rationale as `lib/roles.ts` — see CLAUDE.md: proxy must never transitively import Prisma/bcrypt).
- Secret comes from a new required env var `SESSION_SECRET`. Add it to `.env.example` with a comment (`openssl rand -hex 32` suggestion). If unset at runtime, throw a clear error on session creation and treat all sessions as invalid on read (do not silently fall back to unsigned).
- Invalid, missing, or malformed signature ⇒ treat as logged out (return `null`), never throw to the user.
- Existing sessions become invalid after deploy (users just log in again). That's accepted; don't build migration logic.

**Where to change:**
- `lib/session-signing.ts` (new): `signSession(payloadJson, secret)`, `verifySessionCookie(cookieValue, secret): string | null` (returns the payload JSON or null). Async (crypto.subtle is async).
- `lib/session.ts`: `createSession` signs; `getSession` verifies.
- `proxy.ts`: `readSession` currently does `JSON.parse(cookie)`. It must now verify the signature — make `proxy` an `async function` (Next 16 supports async proxy; confirm in `node_modules/next/dist/docs/`, file `03-file-conventions/proxy.md`).
- Docs: update the CLAUDE.md "Auth & sessions" paragraph (it currently documents the plain-JSON choice) and README's env table.

**Acceptance criteria:**
1. Logging in works; role gating still works (admin → `/admin/orders`, etc.).
2. Manually editing the cookie payload in DevTools (e.g. changing `role`) and reloading results in being treated as logged out / redirected to login — not privilege escalation.
3. `npm run lint` and `npm run build` pass. Include a manual test script covering points 1–2.

---

## Prompt 2 — Full product edit

**Goal:** Admin inventory (`components/admin-inventory-page.tsx`, actions in `app/actions/inventory.ts`) currently supports inline editing of **price and stock only** (`updateProduct`). Extend editing to all product fields: name, brand, size, category, description, combo-eligibility, and replacing the product image. Category reassignment is the key one — it's what lets an admin empty a category so `deleteCategory` stops refusing.

**Design decisions:**
- Reuse the existing add-product form UI pattern: clicking a row's edit button opens the same form panel **prefilled** (title "Edit Product", submit label "Save Changes"), instead of the current inline price/stock inputs. Remove the inline-edit code path.
- Extend the existing `updateProduct` server action to accept the full field set via `FormData` (add a hidden `productId`). Keep its `(state, formData) => Promise<State>` shape and switch the form to `useActionState` (this is the codebase's form-action convention — see `createProduct`).
- Category must be a `<select>` fed from the `categories` prop and validated server-side against the `Category` table, exactly like `createProduct` does.
- Image: optional file input; when provided, upload via `savePublicUpload(storeId, "products", file)` and overwrite `imageUrl`; when omitted, keep the existing image. Don't delete old image files from disk (consistent with the rest of the app).
- All queries stay scoped by `storeId` from the session (`requireRole("admin")`).

**Acceptance criteria:**
1. Every field of an existing product can be changed from the UI, including moving it to a different category and swapping its photo.
2. After moving all products out of a category, that category can be deleted in Manage Categories.
3. Server rejects an unknown category name with the existing friendly error.
4. Lint + build pass; manual test script included.

---

## Prompt 3 — Order cancellation with restock

**Goal:** There is no way to cancel an order, and stock decremented at checkout is never returned. Add an admin-only cancel action for orders that haven't left the store, which restores stock.

**Design decisions:**
- Add `cancelled` to the `OrderStatus` enum in `prisma/schema.prisma`. This needs a migration (`ALTER TYPE ... ADD VALUE` — Prisma generates it; remember the pooler-retry rule from the preamble).
- New `cancelOrder(orderId)` server action in `app/actions/orders.ts`, `requireRole("admin")`. Allowed **only** while status is `pending_verification` or `packing` (pre-dispatch). Reject anything else with a friendly `{ error }` return, don't throw.
- In **one transaction**: set status `cancelled`, and `increment` each `OrderItem.quantity` back onto its product's stock. (Mirror image of the decrement loop in `placeOrder`.)
- Publish a realtime event: extend `StoreEventKind` in `lib/store-channel.ts` with `"cancelled"` and call `publishStoreEvent` like the other mutations (payload stays `{orderId, displayId, kind}` — doorbell rule).
- Add a human label in `lib/order-status.ts` ("Cancelled").
- UI: a "Cancel Order" button in the admin orders drawer (`components/admin-orders-page.tsx`) with `window.confirm`, shown only for cancellable statuses; wire through `startTransition` + explicit `router.refresh()` after the action (required in this app — actions invoked via `startTransition` don't auto-refresh). Add a toast message for kind `cancelled` where it makes sense (admin: no — they did it themselves; staff packing: **yes** — "Order X was cancelled" so they stop packing it; customer order-tracking page shows the new status via its existing refresher).
- Staff packing queue and dashboards must not show cancelled orders — check each page's Prisma `where` filters (`app/[store]/staff/packing/page.tsx` filters by status already; verify admin orders list handles the new status gracefully in its status label rendering and CSV export).
- No cancellation email (out of scope; the `EmailType` enum stays untouched).

**Acceptance criteria:**
1. Admin cancels a `pending_verification` order → status flips to Cancelled, stock counts on the affected products go back up (verify in inventory UI), staff packing station drops it (with a toast), customer tracking page shows Cancelled.
2. Cancelling an `out_for_delivery` or `delivered` order is impossible from UI and rejected by the action.
3. Lint + build pass; manual test script included.

---

## Prompt 4 — Catalog category filter

**Goal:** The customer storefront (`components/catalog-page.tsx`, data from `app/[store]/page.tsx`) lists all products with search but no category browsing. Add category filter chips.

**Design decisions:**
- `app/[store]/page.tsx` additionally fetches the store's categories (`prisma.category.findMany`, ordered by name) and passes them to `CatalogPage`.
- Client-side filtering only — products are already all in memory. A horizontal, scrollable chip row above the product grid: "All" (default) + one chip per category. Selected chip state via `useState`; combine with the existing search filter in the existing `useMemo`.
- Only render chips for categories that actually have ≥1 product on the page; skip the whole row if there are no categories.
- Match existing storefront styling (brand tokens: `brand.green` for the active chip, `brand.panel-soft` etc. for inactive — mimic classes already used in the file). Check `UI Mock UP/2-storefront_after_login.html` for visual reference before inventing anything.
- No URL params, no server round-trips.

**Acceptance criteria:**
1. Chips render with "All" active by default; clicking a category narrows the grid; search and category compose (both apply).
2. Empty-state message when the combination yields nothing.
3. Lint + build pass; manual test script included.

---

## Prompt 5 — Low-stock realtime alerts for admins

**Goal:** When a sale pushes a product's stock below the low-stock threshold, admins should get a realtime toast. All infrastructure exists (`lib/realtime.ts`, `lib/use-store-events.ts`, `components/store-notifications.tsx`).

**Design decisions:**
- Single source of truth for the threshold: export `LOW_STOCK_THRESHOLD = 30` from a shared pure module (suggest `lib/inventory-thresholds.ts`); replace the local constant in `components/admin-inventory-page.tsx` with the import.
- In `placeOrder` (`app/actions/orders.ts`), after the transaction commits, determine which ordered products **crossed** the threshold (were ≥ threshold before, are < threshold after — you know the decremented quantities and can read post-transaction stocks in one `findMany`). For each crossing product, publish one event.
- Extend `lib/store-channel.ts`: add `"low_stock"` to `StoreEventKind` and an optional `productName?: string` field on `StoreEventPayload`. Product names are public catalog data, so this doesn't violate the doorbell rule — but nothing else (no quantities, no customer data) goes in. For low-stock events set `orderId`/`displayId` to the product id / product name respectively or leave displayId empty — pick one, keep types honest, document the choice in the CLAUDE.md realtime paragraph.
- Toasts: add a `low_stock` message to the admin **orders** page's existing `StoreNotifications` messages map, and mount a `StoreNotifications` on the admin **inventory** page (it currently has no realtime subscription — remember the one-subscriber-per-page rule; it gains live refresh as a bonus). Message like: `"${productName}" is running low on stock`.
- Do not notify staff/delivery/customers.

**Acceptance criteria:**
1. Place an order (as customer) that drops a product from ≥30 to <30 → admin sees the low-stock toast within ~1s on orders or inventory dashboard; products that were already below 30 do NOT re-alert on every sale.
2. Realtime-unconfigured mode (env vars absent) still works (silently no toasts, polling refresh).
3. Lint + build pass; manual test script included (tip: use inventory edit to set a product's stock to exactly 30, then buy 1).

---

## Prompt 6 — Pagination for orders and inventory tables

**Goal:** `app/[store]/admin/orders/page.tsx` and `app/[store]/admin/inventory/page.tsx` load every row. Add server-side pagination.

**Design decisions:**
- Page-number pagination via URL search param `?page=2` (1-based), server-side `skip`/`take`. Page size: 25 for orders, 50 for inventory (constants in the page files).
- Next 16 convention: `searchParams` is a **Promise** prop on pages — `const { page } = await searchParams;`. Verify against `node_modules/next/dist/docs/` if unsure.
- Fetch `take: pageSize`, `skip: (page-1)*pageSize`, plus a `count()` in the same `Promise.all` for total pages. Orders ordered `createdAt: "desc"`, inventory stays `name: "asc"`.
- Clamp/ignore invalid `page` values (NaN, <1, > last page → fall back to 1 / last).
- Pager UI: a small footer bar under each table — "Page X of Y", Prev/Next as `<Link>`s preserving the path (`/${store.slug}/admin/orders?page=N`). Hide when only one page. Match dashboard styling.
- Known trade-offs to implement deliberately: (a) the client-side search box now only filters the current page — add a muted hint next to the search input ("searches this page"); (b) CSV export exports the current page only — rename button label to "Export Page". Do not build server-side search in this prompt.
- The admin orders page's default-selected order (`orders[0]`) and the realtime `router.refresh()` flow need no changes — refresh re-fetches the current page.

**Acceptance criteria:**
1. With more rows than a page (seed more if needed via `npm run db:seed` or temporary duplication — clean up after), Prev/Next navigate correctly, page numbers clamp, single-page stores show no pager.
2. Realtime updates still land on whatever page is open.
3. Lint + build pass; manual test script included.

---

## Prompt 7 — Payment-proof screenshot in the verification drawer

**Goal:** Admins verify UPI orders in the drawer on `components/admin-orders-page.tsx`, but the uploaded payment screenshot isn't shown — they approve blind. Embed it.

**Context you need:**
- `Order.paymentProofUrl` stores a path **relative to the store's private uploads dir**, e.g. `payment-proofs/<uuid>.png` (see `savePrivateUpload` in `lib/storage.ts`). COD orders have `paymentProofUrl = null`.
- The authorized serving route already exists: `GET /api/files/{storeId}/{...path}` (`app/api/files/[storeId]/[...path]/route.ts`) — requires a same-store session with role admin/staff/delivery and sets `Cache-Control: private, no-store`. So the browser URL is `/api/files/${store.id}/${order.paymentProofUrl}`.

**Design decisions:**
- In the drawer's payment section, when `selectedOrder.paymentProofUrl` exists: render the screenshot inline (constrained, e.g. `max-h-64 object-contain`, rounded border, brand styling) with the original filename (`screenshotName`) as caption, and wrap it in an `<a target="_blank">` to the same URL so admins can open it full-size in a new tab.
- Use a plain `<img>` tag, NOT `next/image` — the route is auth-gated and dynamic; if `next/image` optimization proxies the request server-side without cookies it will 404. Add an eslint disable comment for `@next/next/no-img-element` on that line if the linter complains, with a short justifying comment.
- COD orders (`paymentMethod === "cod"`) show a "Pay on Delivery — no payment proof" note instead. UPI orders missing a proof (shouldn't happen, but legacy/seeded rows may lack one) show a muted "No screenshot on file".
- Broken image (file deleted from disk): add an `onError` fallback that swaps to the "No screenshot on file" state — don't leave a broken-image icon.
- Check `UI Mock UP/orders_queue_bhagwandas_traders_dashboard.html` for how the mockup envisioned the verification drawer before styling.

**Acceptance criteria:**
1. A UPI order placed with a screenshot shows the actual image in the drawer; clicking opens it full-size in a new tab; a logged-out user (or a user from another store) hitting that URL directly gets 404.
2. COD orders show the COD note; no broken-image states anywhere.
3. Lint + build pass; manual test script included.
