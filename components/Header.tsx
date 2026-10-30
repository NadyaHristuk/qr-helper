'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getCart, subscribeCart } from '@/lib/stickers/cart';

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCart = () => setCartCount(getCart().length);
    syncCart();
    return subscribeCart(syncCart);
  }, []);

  const links = [
    { href: '/how-it-works', label: t('nav.howItWorks') },
    { href: '/order', label: t('nav.order') },
    { href: '/how-it-works#faq', label: t('nav.faq') },
  ];

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    return pathname === base;
  };

  const orderLabel = (
    <span className="inline-flex items-center gap-2">
      <span>{t('common.orderCta')}</span>
      {cartCount > 0 && (
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">
          {cartCount}
        </span>
      )}
    </span>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-extrabold text-navy"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span className="truncate text-sm min-[360px]:text-base sm:text-lg">
            {t('common.siteName')}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`text-sm font-medium transition hover:text-accent ${
                isActive(l.href) ? 'text-accent' : 'text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 sm:gap-3">
          <div className="hidden min-[350px]:block">
            <LanguageSwitcher />
          </div>
          <Link href="/order" className="btn-accent hidden sm:inline-flex">
            {orderLabel}
          </Link>
          <Link
            href="/order"
            aria-label={t('common.orderCta')}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-navy sm:hidden"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden>🛒</span>
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="menu"
            aria-expanded={open}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-navy md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4 md:hidden">
          <div className="mb-3 min-[350px]:hidden">
            <LanguageSwitcher />
          </div>
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2 sm:hidden">
              <Link
                href="/order"
                onClick={() => setOpen(false)}
                className="btn-accent w-full"
              >
                {orderLabel}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
