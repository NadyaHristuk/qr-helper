# QR Helper

QR Helper is a Next.js product configurator for creating and ordering QR-based printed products for small businesses.

The project started as a sticker-ordering MVP and is being expanded into a production-ready workflow: configurable QR designs, product/material options, quantities, delivery/payment choices, order management and an internal admin dashboard.

## Product V2 comparison branch

`product-redesign-v2` presents ready-made customer interaction tools for offline businesses. The original `master` remains separate; V2 is based on `pre-demo-hardening` and includes its existing hardened backend. No deployment or database migration is part of the redesign.

1. Choose a business goal: reviews, Wi-Fi, menu, contacts, social, location, booking or documents.
2. Choose the customer action and physical format.
3. Add content and customize the printed design, size and quantity.
4. Review physical products in the cart.
5. Complete the existing delivery/payment checkout.
6. Confirm the order with the business through the existing PostgreSQL/admin workflow.

All twelve legacy QR capabilities remain. Published menu/document/map/booking links use the existing URL engine. NFC is visibly unavailable; customer Smart controls are deferred until ownership and management are designed. Demo pricing remains 1 UAH per order.

See [product scope, roadmap and A/B presentation guidance](docs/product-roadmap.md) and [V2 implementation and visual QA](docs/product-redesign-v2.md).

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- next-intl (Ukrainian / English)
- Prisma 6
- PostgreSQL
- react-hook-form + Zod
- `qrcode` for QR generation
- Vercel for preview/production deployments
- GitHub Actions for typecheck/build CI

## Main features

### Customer side

- Responsive UI down to 320px
- QR payload validation before adding to cart
- Live SVG sticker preview
- Multiple sticker shapes
- Standard / individual design modes
- Custom colors
- Multiple physical product types
- S / M / L size selection
- Quantity per position
- Multi-item cart
- Delivery selection
- Payment preference selection
- Customer note
- PostgreSQL order persistence
- Ukrainian and English UI

### Admin side

Admin dashboard: `/<locale>/admin`

Features:

- Password-protected admin session
- httpOnly admin cookie
- Order list from PostgreSQL
- Search and status filtering
- Operational counters
- Order/customer/delivery details
- Production details for every line item
- Dynamic QR infrastructure: admin-managed editable destinations with stable printed URLs
- Dynamic QR creation, destination editing, activation/deactivation and public URL copying
- Status workflow:
  - `created`
  - `confirmed`
  - `in_production`
  - `ready`
  - `shipped`
  - `completed`
  - `cancelled`

The public order API does not expose the order list.

## Environment variables

Copy `.env.example` to `.env`:

```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
ADMIN_PASSWORD="use-a-strong-private-password"
APP_URL="https://qr-helper-two.vercel.app"
# Optional comma-separated extra origins serving this application:
DYNAMIC_QR_SERVICE_ORIGINS=""
```

Never commit the real admin password.

Set `APP_URL` to the durable HTTPS origin used on printed Dynamic QR products. Vercel defaults to the existing production host when it is omitted; local development without it copies the current host for testing and shows a printing reminder. Add any other application host aliases to `DYNAMIC_QR_SERVICE_ORIGINS` to prevent redirect loops across domains.

## Local development

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open:

- `/ua` — Ukrainian storefront
- `/en` — English storefront
- `/ua/admin` or `/en/admin` — admin dashboard

## Database changes

This project currently uses Prisma `db push` rather than a migration history.

After pulling a version with a changed Prisma schema, run:

```bash
npm run db:push
```

For Vercel, `DATABASE_URL` must point to the same PostgreSQL database and the schema must be synchronized before using the new runtime fields.

## Quality checks

```bash
npm run typecheck
npm test
npm run build
# or
npm run check
```

GitHub Actions runs typecheck, regression tests and build on pushes and pull requests.

See [pre-demo QA findings and verification limits](docs/qa-hardening.md) and the [implemented Dynamic QR infrastructure and future work](docs/dynamic-qr-proposal.md). Payment QR remains a disabled concept pending merchant integration. Demo pricing is 1 UAH; no card details are collected.

## API/security notes

- Order creation is public, but order listing is admin-only.
- QR image generation uses POST rather than putting QR payloads into public GET query strings.
- QR image responses are not publicly cached.
- Customer order fields are validated with Zod.
- Admin access is isolated behind a server-side password check and httpOnly session cookie.
- Admin mutations require an `Origin` header matching the exact request origin; CLI clients must provide it explicitly.
- Public `/q/:slug` routes resolve admin-created records and return uncached `302` redirects. No scan analytics or destination preview requests are performed.

To order a product with an editable destination, create its Dynamic QR in the admin dashboard and paste the copied public URL into an existing URL-based sticker input. The editor and checkout retain their existing flow; customer Dynamic QR creation and ownership are future work.

## Product roadmap

Already represented in the UI for stakeholder discussion:

- Menu / price list QR
- Location / directions
- Messenger links
- Booking / appointments
- Promo / coupon
- Instruction / PDF / document
- Extended review flows
- QR + NFC
- Signs / stands / posters / business cards

Next architectural layer after the current order workflow is stable:

- Customer ownership and self-service management of Dynamic QR destinations
- Scan analytics
- Online payment gateway + webhook handling
- Nova Poshta API integration
- Production PDF/SVG/print-sheet export
- Notifications
- Rate limiting / CAPTCHA / idempotency
- Automated API/QR tests and monitoring

## Development approach

The project is intentionally developed with an AI-assisted engineering workflow. AI is used as an implementation agent for auditing, refactoring, UX iteration, security hardening, deployment work and feature implementation, while product scope, architecture decisions, constraints, review and acceptance remain human-controlled.

That workflow is part of what this repository demonstrates: not only frontend coding, but the ability to direct AI effectively across a real product lifecycle.
