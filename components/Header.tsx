'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Icon } from '@/components/product/Icon';
import { getCart, subscribeCart } from '@/lib/stickers/cart';
import styles from './Shell.module.css';

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
    <span className={styles.orderContent}>
      <Icon name="cart" className="h-4 w-4" />
      <span>{t('common.orderCta')}</span>
      {cartCount > 0 && (
        <span className={styles.orderCount}>
          {cartCount}
        </span>
      )}
    </span>
  );

  return (
    <header className={styles.header}>
      <a href="#main-content" className={styles.skipLink}>
        {t('nav.skipToContent')}
      </a>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <Logo className={styles.brandMark} />
          <span className={styles.brandName}>{t('common.siteName')}</span>
        </Link>

        <nav aria-label={t('nav.primary')} className={styles.desktopNav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={styles.navLink}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopLanguage}><LanguageSwitcher /></div>
          <Link href="/order" className={`${styles.orderButton} ${styles.desktopOrder}`} onClick={() => setOpen(false)}>
            {orderLabel}
          </Link>
          <Link href="/order" aria-label={t('common.orderCta')} className={`${styles.iconButton} ${styles.mobileCart}`} onClick={() => setOpen(false)}>
            <Icon name="cart" className="h-5 w-5" />
            {cartCount > 0 && (
              <span className={styles.cartCount}>{cartCount}</span>
            )}
          </Link>
          <button
            type="button"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className={`${styles.iconButton} ${styles.menuToggle}`}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menuToggle'} className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav id="mobile-navigation" aria-label={t('nav.primary')} hidden={!open} className={styles.mobileNav}>
        <div className={`${styles.container} ${styles.menuInner}`}>
          <ul className={styles.menuLinks}>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className={styles.menuLink}>
                  {link.label}<Icon name="arrow" className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.menuToolbar}>
            <LanguageSwitcher />
            <Link href="/order" onClick={() => setOpen(false)} className={`${styles.orderButton} ${styles.menuOrder}`}>{orderLabel}</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
