# Product V2: interaction tools for offline businesses

The comparison branch is `product-redesign-v2`, based on `pre-demo-hardening`. `master` remains Version A. No production deployment, database schema or order API change is part of this iteration.

## Customer-facing now

Business goal → interaction → physical format → content/design/size/quantity → cart → existing checkout.

Eight main goals cover reviews, guest Wi-Fi, menu/price list, contacts, social profiles, location, booking and documents. A secondary online-business solution retains website, OLX and app-link capabilities. Menu, location, booking and documents use the existing URL engine: the customer supplies a published HTTPS link. There is no file hosting, booking system or map API behind these options. All twelve legacy catalog routes remain, including the disabled payment concept.

Physical formats remain the existing production-option values. NFC is visibly unavailable and cannot be selected in the new chooser/editor. Demo price stays UAH 1 per order; materials, dimensions, fulfilment and payment need manager confirmation. Mockups are illustrative, decorative SVG studies, not representations of an approved manufacturing specification.

Existing QR payloads, public/admin endpoints, admin authentication, database schema and order persistence remain unchanged. The editor receives validated goal/format context through URL query parameters. Optional `businessGoal` is local cart presentation metadata; the established order API mapper deliberately sends its original fields. Older carts derive their presentation from existing catalog keys. Production artwork still travels as QR value, label, design and physical options. New SVG icon identifiers use the existing icon string field; the admin reader renders both these identifiers and legacy emoji values.

## Product quality boundaries

The preview calculates a screen-color relative-luminance contrast ratio and warns for a light code on dark background or a ratio below a conservative 4.5:1 heuristic. This is not a QR decoding test, print certification or guarantee. The calculation follows the [W3C relative-luminance/contrast definition](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); its text-contrast threshold does not establish QR scan reliability.

No green checks are shown for scan area or print-ready dimensions. S/M/L have no approved millimetre dimensions, so minimum physical module size cannot be calculated honestly. Future production QA needs dimensions, module count, quiet-zone validation, material/lighting checks and a scan of a production sample. The existing QR engine is preserved in this visual/product iteration.

## Future work — outside this storefront

- **QR + NFC:** hardware choice, chip encoding, provisioning, interaction tests and supported-phone guidance. The mockup is marked Coming later; no tap functionality is promised now.
- **Smart / Dynamic QR:** the admin-managed backend already exists. Customer ownership, choosing an existing managed link, access control and customer editing must be designed before a Standard/Smart editor control. No anonymous Dynamic QR creation.
- **Use cases:** messenger-specific guidance, promo/coupons, extended review destinations, integrated documents and richer booking flows.
- **Analytics:** separate consent/privacy, retention, bot handling and aggregation decisions; no analytics added here.
- **Customer accounts:** ownership, saved destinations and a simple account experience only when required.
- **Multi-location:** branch-specific destinations and management, before location-level reporting.
- **Saved templates:** reusable approved artwork, brand colors and format specifications.
- **Reorders:** explicit copies of approved production details with revalidation of content and destination.
- Payment gateway/webhooks, carrier API and manufacturing-ready print exports remain separate integrations.

## Presenting A and B

Present `master` as the original QR-type catalog and V2 as a business-goal product journey. Use the same customer scenario and keep demo price, destination and quantity constant. Ask which entry point makes choosing the right product easier. Compare the homepage, reviews → Google → stand selection, editor and cart; admin is not part of the visual comparison.

The two branches have different technical histories: V2 inherits the hardened order/admin/Dynamic QR infrastructure. Compare product comprehension rather than claiming identical backend feature sets. Use separate local ports or explicitly approved preview deployments; do not replace production or merge either branch as part of this comparison.
