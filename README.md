# MarketHub — Multi-Vendor E-commerce Marketplace

A production-quality multi-vendor marketplace built for a university Web Technologies project. Vendors open their own stores and sell products, customers browse and buy with Stripe (test mode), and an admin oversees the whole platform.

**Live demo:** _(URL added after deployment)_

---

## Features

### Storefront (customers)
- Home page with hero, category grid and newest products
- Product catalog with pagination, full-text search (title + description)
- Filters: category, vendor, price range, in-stock only; sort by price / newest
- Product detail page with image gallery, vendor info, stock status and related products
- Public vendor store pages
- Persistent shopping cart — localStorage for guests, synced to the database after login
- Checkout with server-verified prices, success / cancel pages. Two payment modes:
  - **Stripe Checkout (test mode)** with webhook — used automatically when Stripe keys are configured
  - **Demo payment mode** — when no Stripe keys are set, orders complete instantly with no real payment (used for the live demo because Stripe is not available in every country)
- Order history with per-order detail and live status
- Dark mode toggle, fully responsive, loading skeletons, toasts, error boundaries

### Vendor dashboard (`/vendor`)
- Store stats: revenue, orders, units sold, product counts
- Full product CRUD (create, edit, delete **own products only**) with image URLs and stock management
- Orders list showing only the items belonging to that vendor
- New vendor stores start as `PENDING` and must be approved by an admin before their products go live

### Admin panel (`/admin`)
- Dashboard with totals and a 14-day revenue chart (Recharts) + top products
- Manage users (change role, delete), vendors (approve / suspend), products (hide / delete), categories (create / delete) and orders (update status)

### Security
- Role-based access enforced **both** in middleware and in every API route
- Passwords hashed with bcrypt; JWT sessions via NextAuth (Auth.js v5)
- All API input validated with Zod; prices always re-read from the database at checkout
- Stripe webhook signature verification; no secrets in client code

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 (mobile-first, dark mode) |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Auth | NextAuth.js / Auth.js v5 (credentials + bcrypt) |
| Payments | Stripe Checkout + webhook (test mode) |
| Validation | Zod |
| State | Zustand (cart) |
| Charts | Recharts |

## Screenshots

_Screenshots placeholder — add images of the home page, product page, cart, vendor dashboard and admin panel here._

## Getting started

```bash
git clone <repo-url>
cd marketplace
npm install
cp .env.example .env   # fill in the values (see below)
npx prisma migrate dev # create tables
npm run db:seed        # seed demo data
npm run dev
```

### Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Session encryption secret |
| `NEXTAUTH_URL` | Base URL of the app |
| `STRIPE_SECRET_KEY` | _(optional)_ Stripe secret key (test mode, `sk_test_...`) — leave empty for demo payment mode |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | _(optional)_ Stripe publishable key (test mode) |
| `STRIPE_WEBHOOK_SECRET` | _(optional)_ Stripe webhook signing secret (`whsec_...`) |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@markethub.test` | `Admin123!` |
| Vendor (TechNova) | `vendor1@markethub.test` | `Vendor123!` |
| Vendor (Urban Threads) | `vendor2@markethub.test` | `Vendor123!` |
| Customer | `customer@markethub.test` | `Customer123!` |

**Payments:** the live demo runs in **demo payment mode** (no Stripe keys configured), so "Place order" completes instantly without a real charge. With Stripe test keys configured, checkout redirects to Stripe — test card `4242 4242 4242 4242`, any future expiry date, any CVC.

## Project structure

```
app/
  (shop)/        # home, catalog, product, store, cart, checkout result pages
  (auth)/        # login, register
  account/       # profile + order history
  vendor/        # vendor dashboard (products CRUD, orders, stats)
  admin/         # admin panel (users, vendors, products, orders, categories)
  api/           # route handlers (auth, register, cart, checkout, webhooks, vendor, admin)
components/      # UI components (client + server)
lib/             # prisma client, auth, stripe, validators, cart store, utils
prisma/          # schema + seed
middleware.ts    # role-based route protection
```

## Assumptions / implementation notes

- **Prices are stored in integer cents** to avoid floating-point money errors.
- **Image uploads use URLs** (no Cloudinary account needed). Seed data uses free picsum.photos images, so pictures are decorative placeholders rather than literal product photos.
- **Prisma 6 (stable)** is used instead of the v7/v8 release candidates for reliability.
- Carts: guests keep a local cart; after login it is merged with the server cart.
- Vendors must be `APPROVED` by an admin before creating products; products from suspended vendors are hidden from the storefront.
- The checkout success page verifies the payment directly with Stripe as an idempotent fallback in case the webhook is delayed.
- Shipping is free and the currency is USD (demo simplification).
- **Stripe is not available in the project owner's country**, so the deployed demo uses the built-in demo payment mode. The complete Stripe integration (Checkout Session, signature-verified webhook, stock decrement on payment) is implemented and activates automatically once `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are provided.
