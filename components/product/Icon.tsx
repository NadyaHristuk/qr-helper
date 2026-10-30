import type { ReactNode, SVGProps } from 'react';

const icons = {
  reviews: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 3v-5.2A7.5 7.5 0 1 1 20 11.5Z" /><path d="m12 6 1.1 2.4 2.7.3-2 1.8.5 2.7-2.3-1.3-2.3 1.3.5-2.7-2-1.8 2.7-.3Z" /></>,
  wifi: <><path d="M3 8.5a15.4 15.4 0 0 1 18 0M6 12a10.2 10.2 0 0 1 12 0M9.1 15.5a5 5 0 0 1 5.8 0" /><circle cx="12" cy="19" r=".7" fill="currentColor" stroke="none" /></>,
  menu: <><path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4ZM20 4h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h3Z" /><path d="M7 8h3M7 11h3m6-3h1m-1 3h1" /></>,
  contacts: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M5.5 16a3.5 3.5 0 0 1 7 0M15 9h3m-3 4h3m-3 4h2" /></>,
  social: <><circle cx="6" cy="12" r="3" /><circle cx="18" cy="5" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" /></>,
  location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  booking: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18m-13 5 3 3 5-5" /></>,
  document: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9ZM14 3v6h6M8 13h8m-8 4h6" /></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  arrowLeft: <><path d="M20 12H4m6 6-6-6 6-6" /></>,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  scan: <><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M3 12h18" /><path d="M8 8h3v3H8Zm5 5h3v3h-3Z" /></>,
  tap: <><path d="M8 13V8a2 2 0 0 1 4 0v5l1.8-1.2a2 2 0 0 1 2-.1l1.9 1a2 2 0 0 1 1 2.2l-.8 4a3 3 0 0 1-3 2.4h-4a3 3 0 0 1-2.4-1.2L5 15.7a1.7 1.7 0 0 1 2.5-2.3l.5.6M5.5 8a4.5 4.5 0 0 1 9 0M3 6a7 7 0 0 1 14 0" /></>,
  cart: <><path d="M3 3h2l2.4 12h11.2l2-8H6" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
  shoppingBag: <><path d="M5 7h14l1 14H4ZM8 8V6a4 4 0 0 1 8 0v2" /></>,
  menuToggle: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  phone: <path d="M8 3H5a2 2 0 0 0-2 2 16 16 0 0 0 16 16 2 2 0 0 0 2-2v-3l-5-2-2 3a13 13 0 0 1-7-7l3-2Z" />,
  sms: <><path d="M21 11a8 8 0 0 1-8 8H8l-5 3V11a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" /><path d="M7 9h10M7 13h7" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
  video: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" /></>,
  store: <><path d="m4 3-2 6a3 3 0 0 0 5 2 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 5-2l-2-6ZM4 12v9h16v-9M9 21v-6h6v6M8 3 7 9m9-6 1 6m-5-6v6" /></>,
  smartphone: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M10 5h4m-3 14h2" /></>,
  coffee: <><path d="M4 9h13v6a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6Zm13 1h1a3 3 0 0 1 0 6h-1M7 3v2m4-3v3m4-2v2" /></>,
  salon: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="m8 15 9-12M7 3l9 12M12 9v1" /></>,
  clinic: <><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" /></>,
  hotel: <><path d="M3 21V5h12v16M15 11h6v10M1 21h22M7 8h4m-4 4h4m-4 4h4m-3 5v-2h2v2m8-7h1m-1 3h1" /></>,
  car: <><path d="m5 6-2 7v6h3v-3h12v3h3v-6l-2-7ZM3 12h18M6 6h12M6 14h1m10 0h1" /></>,
  reception: <><path d="M3 18h18M5 15a7 7 0 0 1 14 0ZM12 8V5m-2 0h4M3 21h18" /></>,
  sticker: <><path d="M20 13V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h8Zm-7 7v-5a2 2 0 0 1 2-2h5" /><path d="M7 7h3v3H7Zm7 0h2m-9 7h2" /></>,
  stand: <><path d="M7 3h10l4 18H3ZM17 3l-1 18M8 8h5v5H8Zm-1 9h7" /></>,
  sign: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M6 8h4v4H6Zm8 1h4m-4 4h4M6 16h12" /></>,
  glass: <><path d="M5 3h14v16H5ZM3 21h18M8 7l2-2m-2 6 6-6m-5 10h6" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 9h6m-6 4h4m6-4h3v3h-3Zm0 6h3" /></>,
  poster: <><path d="M5 2h14v20H5Zm3 4h8m-8 4h8m-8 4h5v5H8Zm8 1v4" /></>,
  ruler: <><path d="m3 15 12-12 6 6L9 21Zm9-9 2 2m-5 1 2 2m-5 1 2 2m-5 1 2 2" /></>,
  palette: <><path d="M21 11a9 9 0 1 0-9 10h1.5a2.5 2.5 0 0 0 1.6-4.4 1.5 1.5 0 0 1 1-2.6H18a3 3 0 0 0 3-3Z" /><circle cx="7" cy="9" r=".8" /><circle cx="11" cy="6" r=".8" /><circle cx="16" cy="8" r=".8" /><circle cx="6" cy="14" r=".8" /></>,
  package: <><path d="m12 2 10 5v10l-10 5L2 17V7Zm0 10v10M2 7l10 5 10-5M7 4.5l10 5V14" /></>,
  shield: <><path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5Z" /><path d="m8 12 3 3 5-6" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof icons;

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

/** Shared line icons for product choices and interface actions. */
export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {icons[name]}
    </svg>
  );
}
