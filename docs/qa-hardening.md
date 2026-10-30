# Pre-demo hardening QA

Branch: `pre-demo-hardening`. QA performed locally against the production build and the configured Neon database. Production deployment was not changed.

## Confirmed fixes

- Disabled Privat24 generation and ordering pending merchant integration. Removed PAN input and demo PAN, retained all twelve catalog concepts.
- Rejected malformed QR object fields as validation errors and rejected unsafe URL schemes and embedded URL credentials.
- Limited JSON request streams to 64 KiB before parsing/validation. QR responses, including errors, use `no-store`.
- Removed unsafe route assertion and rejected inherited catalog keys such as `constructor` and `__proto__` with 404.
- Validated admin login JSON, returned 404 for missing orders, and made status-save failures visible and retryable.
- Disabled status selects during saves to prevent overlapping updates. Dashboard updates use the saved server record; counters and filters derive from that state.
- Hardened legacy order item parsing and retained default carrier/size/quantity for older data.
- Pickup no longer requires a Nova Poshta branch; courier asks for a delivery address. Confirmation copy does not promise a specific shipping service or dispatch time.
- Removed outdated custom-template surcharges; demo pricing remains 1 UAH.
- Raised small buttons, form inputs and color controls to 44px minimum targets.
- Updated Next.js within version 15 to 15.5.28 and applied a compatible PostCSS 8 override. No framework/database migration.

## Verification evidence

- `npm install`, `npm run typecheck`, `npm test`, `npm run build`.
- Public GET `/api/orders`: 405. Unauthenticated admin GET/PATCH: 401. Invalid login types: 401. Malformed QR values, card payment payloads, unsafe schemes and oversized bodies: 400.
- Temporary API order exercised every status: created, confirmed, in_production, ready, shipped, completed, cancelled. Each PATCH was checked through a fresh protected GET and Prisma lookup. All item fields survived persistence. Only the newly created QA order was deleted.
- Real browser checkout reached success. Admin select update survived reload; status filtering hid the unmatched test order. Browser test data was removed; existing customer orders were not modified.
- Generated HTML includes favicon ICO, SVG icon, manifest and a single Apple PNG link with `sizes="180x180"`. PNG file is 180×180. Next.js selects the PNG despite the existing SVG fallback; no icon files or visual branding changed. Manifest has SVG `any` and `maskable` entries; platform installation behavior was not tested on a physical iOS/Android device.
- Headless Chrome checked 320, 360, 375, 390, 430, 768, 1024 and 1440px: UA/EN storefronts, sticker editor, disabled payment concept, empty cart and admin login. Additional checks covered custom colors, populated cart/checkout, success and populated admin dashboard. No horizontal overflow observed. A 320px editor screenshot was visually inspected.

## Remaining security findings and scope limits

`npm audit` after compatible updates reports four high findings: Zod 3 and the Prisma → @prisma/config → deepmerge-ts chain. Zod's oversized-collection exposure is bounded by the pre-parse request limit; this is a mitigation, not a claim that the dependency advisory is fixed. Prisma config processes repository-controlled configuration rather than customer order bodies. Do not use `npm audit fix --force`: its proposed upgrades change major versions. Reassess these dependencies separately and retain the audit findings until patched or formally accepted.

Browser QA uses desktop Chrome emulation; physical touch devices and Safari were not tested. The initial hardening scope did not include payment gateways, carrier integrations or dynamic redirects. Dynamic QR has since been implemented in a separate iteration; see [Dynamic QR infrastructure](dynamic-qr-proposal.md) for its schema changes, behavior and verification.
