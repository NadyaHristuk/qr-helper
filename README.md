# QR Helper

QR Helper is a Next.js product configurator for creating and ordering QR-based printed products for small businesses.

The project started as a sticker-ordering MVP and is being expanded into a production-ready workflow: configurable QR designs, product/material options, quantities, delivery/payment choices, order management and an internal admin dashboard.

## Current product flow

1. Choose a QR use case (Wi-Fi, reviews, contacts, social links, website, car phone, etc.).
2. Enter the payload data.
3. Configure the sticker design and shape.
4. Choose the physical product, size and quantity.
5. Add one or more products to the cart.
6. Enter customer, delivery and payment preferences.
7. Create an order in PostgreSQL.
8. Manage the order through the protected admin dashboard.

The home page also contains additional product concepts for stakeholder review: menu/price list, booking, directions, promo codes, documents, dynamic QR, QR+NFC, signs, stands, posters and business cards.

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
```

Never commit the real admin password.

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

See [pre-demo QA findings and verification limits](docs/qa-hardening.md) and the [Dynamic QR proposal](docs/dynamic-qr-proposal.md). Payment QR remains a disabled concept pending merchant integration. Demo pricing is 1 UAH; no card details are collected.

## API/security notes

- Order creation is public, but order listing is admin-only.
- QR image generation uses POST rather than putting QR payloads into public GET query strings.
- QR image responses are not publicly cached.
- Customer order fields are validated with Zod.
- Admin access is isolated behind a server-side password check and httpOnly session cookie.

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

- Dynamic QR short links
- Customer account / QR destination management
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
