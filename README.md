# Bhagwandas Traders Frontend

Next.js App Router frontend scaffold for a localized grocery SaaS platform. The project uses TypeScript, Tailwind CSS, mock data, and local component state to simulate the full storefront and operations UI without a real backend.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Routes

- `/` customer catalog with product grid, combo discount state, and persistent mini-cart
- `/checkout` checkout bill, static UPI QR block, and payment screenshot upload zone
- `/order/BGD-240731-101` post-purchase confirmation and WhatsApp action
- `/login` merchant login screen
- `/admin/orders` orders queue with verification drawer
- `/admin/inventory` inventory matrix with search and add-product flow
- `/staff/packing` packing station checklist
- `/delivery/dashboard` rider manifest and drop-off confirmation flow

## Styling

Brand tokens are defined in `tailwind.config.ts` and `app/globals.css`.

- Primary background: `#FFFFFF`
- Primary accent: `#10B981`
- Secondary action accent: `#F97316`

## Validation

Use the following commands before shipping:

```bash
npm run lint
npm run build
```
