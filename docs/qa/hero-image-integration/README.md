# Hero image integration

The selected café review-stand photo is used by the existing `HeroEnvironment` on the homepage. Its asymmetrical framing, subtle halo, scan hint and updated card treatments use CSS or localized HTML/SVG; the photo itself contains no added copy.

| Locale | Viewport | Screenshot |
|---|---:|---|
| UA | 1440×900 | [Desktop](./ua-desktop-1440x900.png) |
| UA | 390×844 | [Mobile](./ua-mobile-390x844.png) |
| UA | 844×390 | [Landscape](./ua-landscape-844x390.png) |
| UA | 1920×1080 | [Wide desktop](./ua-desktop-1920x1080.png) |
| EN | 1440×900 | [Desktop](./en-desktop-1440x900.png) |

The stand and phone remain visible at all reviewed sizes. The desktop scene is capped at 500 px; desktop and mobile use separate `object-position` values. The hint card stays over the secondary foreground rather than the QR code or phone screen.
