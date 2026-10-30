'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Icon } from '@/components/product/Icon';
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

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const links = [
    { href: '/#solutions', label: t('nav.solutions') },
    { href: '/#formats', label: t('nav.formats') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
  ];

  const orderLabel = (
    <span className="inline-flex items-center gap-2">
      <Icon name="cart" className="h-4 w-4" />
      <span>{t('common.orderCta')}</span>
      {cartCount > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">
          {cartCount}
        </span>
      )}
    </span>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-navy/10 bg-white/95 backdrop-blur-sm">
      <a href="#main-content" className="sr-only rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50">
        {t('nav.skipToContent')}
      </a>
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5 font-extrabold tracking-tight text-navy" onClick={() => setOpen(false)}>
          <Logo />
          <span className="truncate text-base sm:text-lg">{t('common.siteName')}</span>
        </Link>

        <nav aria-label={t('nav.primary')} className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center text-sm font-semibold transition hover:text-accent ${pathname === link.href ? 'text-accent' : 'text-navy/80'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <Link href="/order" className="btn-accent hidden sm:inline-flex" onClick={() => setOpen(false)}>
            {orderLabel}
          </Link>
          <Link href="/order" aria-label={t('common.orderCta')} className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-navy/15 text-navy transition hover:bg-slate-50 sm:hidden" onClick={() => setOpen(false)}>
            <Icon name="cart" className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{cartCount}</span>
            )}
          </Link>
          <button
            type="button"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-navy/15 text-navy transition hover:bg-slate-50 lg:hidden"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menuToggle'} className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav id="mobile-navigation" aria-label={t('nav.primary')} hidden={!open} className="border-t border-navy/10 bg-white lg:hidden">
        <div className="mx-auto max-w-7xl px-4 pb-5 pt-3 sm:px-6">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 text-sm font-semibold text-navy transition hover:bg-slate-50">
                  {link.label}<Icon name="arrow" className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:hidden">
            <LanguageSwitcher />
            <Link href="/order" onClick={() => setOpen(false)} className="btn-accent">{orderLabel}</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
