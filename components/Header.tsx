'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

/** Шапка сайта: лого + название, меню, переключатель языка, кнопка заказа. */
export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/how-it-works', label: t('nav.howItWorks') },
    { href: '/order', label: t('nav.order') },
    { href: '/how-it-works#faq', label: t('nav.faq') },
  ];

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    return pathname === base;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold text-navy"
          onClick={() => setOpen(false)}
        >
          <Logo />
          <span>{t('common.siteName')}</span>
        </Link>

        {/* Десктоп-меню */}
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/order" className="btn-accent hidden sm:inline-flex">
            {t('common.orderCta')}
          </Link>
          {/* Бургер для мобильных */}
          <button
            type="button"
            aria-label="menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-navy md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-ink hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/order"
                onClick={() => setOpen(false)}
                className="btn-accent w-full"
              >
                {t('common.orderCta')}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
