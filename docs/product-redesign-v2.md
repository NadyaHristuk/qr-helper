# Product redesign V2 — implementation and QA

## Branch safety

- Working branch: `product-redesign-v2`, created from `pre-demo-hardening` at `b9fc763` after a fast-forward-only pull confirmed the base was current.
- `master` remains at `4a08966be968b36f9c40c2d8f45ea5d436fd549e`. The `pre-demo-hardening` branch pointer is also unchanged.
- No merge, history rewrite, push or deployment was performed. No database migration or database write was needed for this presentation iteration.
- The existing uncommitted `package-lock.json` addition (`hasInstallScript`) is preserved outside the redesign commits. No dependency was added.

## Product architecture

Version A starts with QR capabilities. Version B starts with a business goal, then a customer interaction and physical format, before using the existing editor and checkout. The intermediate `/solutions/:goal` screen makes these choices concrete rather than merely renaming the old catalog.

Reviews, Wi-Fi and menu/price list are flagship solutions. Contacts, social profiles, location, booking and documents are primary entries; a secondary online-business solution exposes website, OLX and app links. Published-link use cases explicitly require an existing URL. There is no new menu CMS, document upload, reservation system or map integration.

The visual system keeps navy, red and white with warm neutral product surfaces. Native SVG product studies show a stand, sticker, glass application, sign, card, poster and a camera interaction. The use-case grid and material/physical-format studies are intentionally different layouts. Decorative SVGs have accessibility treatment and do not stand in for the customer's usable QR code.

## Preserved capabilities and contracts

All twelve catalog routes remain: `socials`, `wifi`, `vcard`, `email`, `sms`, `google`, `privat24`, `carPhone`, `site`, `youtube`, `olx`, `app`. Privat24 remains disabled. The original payload builders, QR generation, database schema, admin authentication, order lifecycle and endpoints have no diff against the branch base. StickerDesign gains line-icon presentation; stable SVG icon identifiers use the existing icon string field, while legacy emoji values remain readable. The admin item icon gets a minimal compatibility renderer; its layout and behavior are unchanged. QR data generation remains unchanged.

A validated goal/product query initializes the existing editor. Optional local cart `businessGoal` metadata distinguishes menu from document and other shared URL capabilities. It is intentionally absent from the unchanged order API request. Older carts infer a sensible goal from the existing catalog key. New physical choices use the existing productType values; NFC cannot be selected and a legacy NFC cart item must be removed before checkout.

The editor presents action, content, design, physical format, then size/quantity, with a sticky desktop preview. Printed defaults address the visitor (e.g. VIEW OUR MENU), while the screen explains the business goal. Cart cards show goal, format, size, quantity, design and a human-readable destination, omitting Wi-Fi passwords, full vCards, message bodies and URL query/fragment details from the summary.

## Removed from customer UI

- Internal stakeholder/roadmap panels, including Yura references and product-range brainstorming.
- The homepage's flat twelve-type sticker catalog as the primary entry point.
- Emoji as the main icon system in the storefront, navigation, editor and cart.
- Registration requirements, unverified 24-hour fulfilment promises, payment availability and the circular claim that scanning a QR installs a scanner.
- Sticker-only CTA/cart wording where the product can be a stand, sign or other format.

Internal plans now live in [product-roadmap.md](product-roadmap.md). The admin dashboard itself was not redesigned; its shared site header/footer naturally use the current storefront shell.

## Concept-only and UX boundaries

QR+NFC is Coming later and disabled; no hardware or provisioning is implemented. Dynamic QR's existing admin backend is retained, but customer Smart controls, ownership and anonymous creation are not added. Analytics, accounts, multi-location management, saved templates and reorder automation are roadmap items.

Physical mockups are illustrative; the editor previews the printed artwork, not a manufacturing-accurate render of each carrier. S/M/L have no approved physical dimensions and pricing remains a demo UAH 1 per order. Material, dimensions, delivery and payment require manager confirmation. Online payment is visibly unavailable.

QR quality is a computed screen-color contrast ratio with a caution for low contrast/reversed polarity. It is a heuristic, not a print-ready/scan-certification badge. There are no fabricated green checks for quiet zone, physical module size or production approval. See [quality boundaries](product-roadmap.md#product-quality-boundaries).

## Verification

`npm run typecheck`, `npm test`, `npm run build` pass. The suite contains 24 Dynamic QR regressions, 6 existing payload/order tests and 4 product presentation tests (34 total). New checks cover contrast math, private-value summaries, goal-to-existing-catalog mapping, availability and visitor-facing printed text.

Local browser QA used the production build in headless Chrome:

- 320, 360, 375, 390, 430, 768, 1024 and 1440px across UA/EN homepage, solution chooser, How it works, editor, populated cart/checkout and admin login: 72 page/viewport combinations without horizontal overflow.
- Reviews → Google → rigid sign → editor → cart; a documents/poster route verifies distinct goal and format context despite sharing the site QR engine.
- Expanded color controls, actual 1.0:1 contrast warning, preserved direct website route and visible control heights of at least 44px.
- Mobile navigation opens/closes with Escape, skip-link target is focusable, one primary homepage heading, labeled form fields and decorative SVG treatment.
- Checkout reaches success with the original request fields. The browser intercepts only the POST response with a fixture, verifies the request contract, and makes **no order/database write**. Backend persistence was not re-exercised because backend code is unchanged.
- Legacy unavailable NFC cart state is marked and blocked, with a working remove action.
- No JS exceptions or missing-translation errors observed. Browser verbose recommendations about password fields remain; physical Safari/iOS/Android devices were not tested.

Screenshots are local QA artifacts under `/tmp/qr-helper-v2/` (not runtime assets and not committed):

| Artifact | View |
| --- | --- |
| `homepage-ua-desktop.png` | Full UA desktop page |
| `homepage-en-desktop.png` | Full EN desktop page |
| `homepage-ua-320.png` | UA hero at 320px |
| `homepage-ua-320-full.png` | Full UA mobile page |
| `solution-ua-320.png` | Goal/format chooser at 320px |
| `editor-en-320.png` / `editor-en-desktop.png` | Expanded editor |
| `cart-en-320.png` | Populated physical-product order |
| `success-en-320.png` | Checkout success fixture |

## Client comparison

Show Version A (`master`) and Version B (`product-redesign-v2`) separately, using one scenario: a café wants Google reviews, on a stand, in the same quantity and with the same destination. A starts with a QR type; B starts with the business outcome and helps place the physical product. Compare homepage comprehension, selection, editor and order review; keep admin outside the presentation. Use separate local checkouts/ports or explicitly approved preview deployments, without replacing production or merging branches.

V2 inherits a newer technical base, so the comparison should focus on product understanding rather than suggesting the two branches have identical backend features.

## Changed files

- `README.md`
- `app/[locale]/how-it-works/page.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/order/page.tsx`
- `app/[locale]/page.tsx`
- `app/[locale]/solutions/[goal]/page.tsx`
- `app/[locale]/stickers/[type]/page.tsx`
- `app/globals.css`
- `components/AdminDashboard.tsx`
- `components/Footer.tsx`
- `components/Header.tsx`
- `components/OrderCart.tsx`
- `components/StickerDesign.tsx`
- `components/StickerEditor.tsx`
- `components/product/Icon.tsx`
- `components/product/ProductMockup.tsx`
- `components/product/SolutionBuilder.tsx`
- `docs/product-redesign-v2.md`
- `docs/product-roadmap.md`
- `lib/products/presentation.ts`
- `lib/products/quality.ts`
- `lib/products/solutions.ts`
- `lib/stickers/cart.ts`
- `messages/en.json`
- `messages/ua.json`
- `tests/product-quality.cjs`
