# Homepage narrative and hero preparation

Branch: `product-redesign-v2`. Before screenshots: `127f53f`. This pass clarifies the existing storefront story, integrates the selected café review-stand photo, and refines the visual hierarchy without changing the product/order architecture.

## 1. Misleading numbers removed

Removed the hero caption's `01 /`, section labels `01 /`, `02 /`, `03 /`, the three flagship corner numbers, and the poster illustration's tiny `QR HELPER / 01` imprint. Only the real ordered process shows **1, 2, 3**. A DOM text-node check confirms there are no other standalone numbered labels on the homepage.

Solutions now has a semantic business-solutions label and a clearly headed “Інші рішення / More solutions” continuation. Physical formats uses “Де це буде розміщено? / Where will you place it?”; the former abstract headline is supporting copy.

## 2. Section structure

Hero → trust strip → solutions (flagship + other solutions) → physical formats → how it works → industries → final CTA → footer.

The real steps are choose an action, customize the design/format, then place an order. The last description explains that details are confirmed before the finished product is received.

The hero's secondary link and header navigation use `#solutions`, `#formats`, `#how-it-works` on the current landing page. From other routes, navigation returns to the same locale's homepage section. The detailed `/how-it-works` page remains linked from the explanatory section and footer. Mobile anchor selection closes the menu.

## 3. Before / after screenshots

[Open comparison gallery](index.html) · [Capture manifest](capture-manifest.json)

Six exact viewport pairs and six complete-page pairs cover:

- UA: 1440×900, 1920×1080, 390×844, 844×390.
- EN: 1440×900, 1920×1080.

The before and after use the same browser, routes and sizes, with an empty cart. Exact viewport dimensions and full-page pair widths were verified. Full-page heights differ as the industry section and copy now have a different hierarchy.

## 4. Desktop balance

Checked 1366×768, 1440×900, 1600×900 and 1920×1080 in both languages. The 1280 px main container is retained; the centered industry grid is capped at 1056 px. Hero copy, visual, solution cards, CTA and footer remain aligned to their existing container.

The visual review pass keeps the hero editorial and asymmetrical: the copy and primary action stay on the left, while the 500 px photo anchors the right. At 1440×900 the hero ends at approximately **753 px**; the trust strip and start of solutions remain visible. There is no artificial `100vh` height. On short landscape the compact two-column hero remains scrollable.

## 5. Industry layout

A centered normal section heading and supporting sentence introduce the six industries. The grid is **3 columns × 2 rows** at ≥1024 px, two columns at 640–1023 px, and one column below 640 px. Every item has an icon, title and supporting line. Vertical dividers were removed. Browser measurements confirm equal column widths, the expected row count and a grid centered within one pixel of the content viewport.

## 6. Hero image integration

`components/product/HeroEnvironment.tsx` is a server-compatible wrapper around the environment visual. The selected café review-stand photo is integrated at `public/images/hero/cafe-review-stand.webp`:

```tsx
<HeroEnvironment
  locale={lang}
  image={{
    src: '/images/hero/cafe-review-stand.webp',
    alt: ua ? 'Клієнт сканує QR-стенд для відгуків у кав’ярні' : 'A customer scans a café review QR stand',
    objectPosition: { desktop: '50% 50%', mobile: '46% 51%' },
  }}
/>
```

The square frame preserves layout geometry. `next/image` supplies responsive image loading; CSS controls `object-fit: cover` and separate desktop/mobile crop positions. The photo stays within a 500 px desktop scene so it does not outweigh the left-side copy. An optional `overlay` accepts localized HTML/SVG details; the scan hint is rendered as localized HTML with an SVG icon. Essential copy stays in HTML/SVG rather than embedded in raster artwork.

The selected photograph was supplied by the user; no alternative environments were generated or substituted.

## 7. QA results

The selected hero image and the four requested integration screenshots are documented in [hero image integration QA](../hero-image-integration/README.md).

Passed `npm run typecheck`, `npm test` (three files / 34 checks), `npm run build`, and `git diff --check`.

UA/EN browser QA covered 11 sizes each: 320×740, 390×844, 568×320, 667×375, 768×1024, 844×390, 1024×600, 1366×768, 1440×900, 1600×900 and 1920×1080. Verified no horizontal overflow, exact section order, only three real step numbers, industry breakpoints/centering, desktop cue visibility, native in-page navigation, mobile menu bounds/close behavior, localized returns from the cart and the separate detailed page link.

A server-render probe checked both the SVG fallback and the supplied-image branch, desktop/mobile crop properties and a localized overlay. The selected photograph and responsive crops were visually reviewed at the requested sizes. Browser QA used Chrome viewport emulation, not physical devices.

[Viewport measurements](viewport-matrix.json) · [Browser log](console-events.json) · [Verification summary](verification-summary.json)

Changed source files: `app/[locale]/page.tsx`, `app/globals.css`, `components/Header.tsx`, `components/product/ProductMockup.tsx`, and new `HeroEnvironment.tsx` / `HeroEnvironment.module.css`. Backend/order/admin logic and database schema are unchanged. The pre-existing staged `package-lock.json` change is excluded. No merge, push or production deployment was performed; protected branches retain their original refs.

## 8. Visual review update

The selected café photo was reviewed in the live homepage and retained. The hero now gives it a stronger but balanced frame, with an HTML/SVG scan hint over secondary foreground; the QR code and phone screen stay clear. Solution and industry cards, format mockups, and the final CTA use more consistent rounded surfaces, depth and hover states. Motion respects reduced-motion preferences. No new raster image or product architecture was needed for this visual pass.
