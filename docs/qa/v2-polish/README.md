# Product V2 visual polish

Branch: `product-redesign-v2`. Baseline: `551fea5`. This pass preserves the existing business goal → interaction → physical product → customize → order flow.

## 1. Visual issues found

The original mobile editor placed the preview after all five configuration sections. At 1366×600 the original preview was **738 px high and sticky**, below an 81 px header. Repeated bordered sections made the form feel longer, the material illustrations had similar flat surfaces, supporting text was often undersized, and the industries/footer lacked structure. The final CTA had excessive surrounding space.

## 2. Files changed

- `app/[locale]/page.tsx`: storefront composition, semantic layout classes, industry descriptors.
- `app/globals.css`: public spacing/type/radius system, responsive hero, industry strip, compact final CTA and visual checkout normalization.
- `components/product/ProductMockup.tsx`: physical illustrations and hero composition.
- `components/StickerEditor.tsx` and `StickerEditor.module.css`: configurator hierarchy and responsive preview.
- `components/Header.tsx`, `Footer.tsx` and `Shell.module.css`: compact responsive shell.
- This report, comparison gallery, capture manifest, screenshots and viewport evidence.

No backend, Prisma schema, order request contract or admin logic changed. The existing staged `package-lock.json` edit is excluded from these commits.

## 3. Before / after screenshots

Open the [comparison gallery](index.html). Both versions use identical routes, viewport sizes and fictional data. Exact viewport captures cover all eleven requested cases; three full-page pairs show the complete storefront, editor and cart. [Capture manifest](capture-manifest.json).

| Page | Viewport | Before | After |
| --- | --- | --- | --- |
| Homepage UA | 1440×900 | [PNG](before/home-ua-1440x900.png) | [PNG](after/home-ua-1440x900.png) |
| Homepage UA | 390×844 | [PNG](before/home-ua-390x844.png) | [PNG](after/home-ua-390x844.png) |
| Homepage UA | 844×390 | [PNG](before/home-ua-844x390.png) | [PNG](after/home-ua-844x390.png) |
| Homepage EN | 1440×900 | [PNG](before/home-en-1440x900.png) | [PNG](after/home-en-1440x900.png) |
| Editor UA | 1440×900 | [PNG](before/editor-ua-1440x900.png) | [PNG](after/editor-ua-1440x900.png) |
| Editor UA | 390×844 | [PNG](before/editor-ua-390x844.png) | [PNG](after/editor-ua-390x844.png) |
| Editor UA | 844×390 | [PNG](before/editor-ua-844x390.png) | [PNG](after/editor-ua-844x390.png) |
| Editor EN | 1440×900 | [PNG](before/editor-en-1440x900.png) | [PNG](after/editor-en-1440x900.png) |
| Cart UA | 390×844 | [PNG](before/cart-ua-390x844.png) | [PNG](after/cart-ua-390x844.png) |
| Cart UA | 844×390 | [PNG](before/cart-ua-844x390.png) | [PNG](after/cart-ua-844x390.png) |
| Cart UA | 1440×900 | [PNG](before/cart-ua-1440x900.png) | [PNG](after/cart-ua-1440x900.png) |

Editor fixture: Guest Wi-Fi, fictional password, Custom colors. Cart fixture: three M review stands. No customer records appear in the captures.

## 4. Viewport matrix and verification

Nine routes × 22 viewports = **198 combinations**. Routes: `/ua`, `/en`, UA/EN Wi-Fi editor, UA/EN populated cart, UA reviews solution, EN how-it-works and UA admin login (shared shell regression). The editor was filled and its individual color controls expanded.

| Coverage | Viewports |
| --- | --- |
| Portrait / width regression | 320×740, 360×800, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×1000 |
| Landscape | 568×320, 667×375, 740×360, 812×375, 844×390, 896×414, 1024×600, 1180×820, 1280×720, 1366×768, 1440×900, 1920×1080 |
| Wide / short additions | 1600×900, 1366×600 |

Checks: no horizontal overflow; no independently scrolling main content; visible/reachable editor CTA; preview source order; sticky panel fits available height; header height; opened mobile menu bounds and Escape. Raw measurements: [viewport matrix](viewport-matrix.json). Browser console: [events](console-events.json). No runtime exceptions or error-level logs; three verbose Chrome password-form recommendations were retained. [Verification summary](verification-summary.json).

Functional browser regression also covers goal → selected rigid sign → editor → cart, live low-contrast warning, restoration of Standard colors and successful checkout presentation. The order API response was intercepted with a fictional response; no database write or payment was performed. Product format and icon survived the existing order request mapping.

Required checks: `npm run typecheck`, `npm test` (three files / 34 checks), `npm run build` passed. The build generates Prisma Client; it does not apply a migration.

## 5. Landscape fixes

Header content is 72 px on desktop, 64 px on mobile, and 56 px on short screens (plus its 1 px border). The dropdown is bounded by the remaining dynamic viewport height. All requested menu test sizes fit without scrolling. The editor uses one normal page scroll and a normal bottom action on mobile. A ResizeObserver enables desktop sticky positioning only when the entire preview fits, with 16 px bottom clearance; short landscape explicitly uses static positioning. The landscape hero places copy and illustration side by side when width allows.

## 6. Typography and spacing

Hero: 64 px desktop, 56 px smaller desktop, 48 px tablet and 34–40 px mobile; short landscape uses 36 px. Section headings: 40/36/30 px. Flagship headings: 22 px; format headings: 18 px. Body: 14–18 px; supporting information: at least 12 px. Inputs use 16 px text. Small preview metadata was darkened to meet normal-text contrast on white.

Main spacing uses 4/8/12/16/24/32/48/64/96 px. Public controls use 8 px radius, cards 12 px and large panels 16 px. UI shadows are restrained; physical illustrations retain their own cast shadows.

## 7. Editor changes

The five sections remain intact, with secondary numbers, stronger headings, thin separators and compact context. Shape buttons include silhouettes. Accessible native color inputs sit behind swatch controls. Physical choices include thumbnails, descriptions and a check state; unavailable NFC has a muted Coming later badge.

Mobile order: title → preview → customer action → destination → design → physical product → size/quantity → CTA. Desktop: flexible form + 400–440 px preview inside a 1280 px container. Attributes and measured contrast sit below the larger artwork. The desktop CTA is attached to the preview. The indicator describes screen-color contrast and asks for a real scan check; it makes no print-readiness claim.

## 8. Mockup improvements

Acrylic stand edges, transparent supports, highlights and layered ground shadows replace the cardboard impression. The hero combines a review stand, mounted menu plate, peeled Wi-Fi sticker and schematic scanning phone. Format studies distinguish a round sticker, stand, rigid plate, glass-door decal, paper card stack, curled poster and NFC puck. Decorative QR patterns remain illustrations; the actual editor QR engine is unchanged.

## 9. Remaining visual compromises

Mockups are editorial SVG illustrations, not manufacturing proofs. The editor previews the printed artwork; exact dimensions and physical construction are confirmed before production. Contrast calculation cannot certify scanning or printing. QA used headless desktop Chrome with viewport emulation; real iOS/Android browser chrome, virtual keyboards, native color dialogs and physical print scans require device checks. Long mobile pages use ordinary document scrolling. No production deployment, push or merge was performed.
