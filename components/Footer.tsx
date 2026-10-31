import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './Logo';
import { Icon } from '@/components/product/Icon';
import styles from './Shell.module.css';

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerInner}`}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.brand}>
              <Logo className={styles.brandMark} /><span className={styles.brandName}>{t('common.siteName')}</span>
            </Link>
            <p className={styles.footerTagline}>{t('footer.tagline')}</p>
          </div>
          <nav aria-label={t('footer.navigation')} className={styles.footerNav}>
            <Link href="/#solutions" className={styles.footerLink}>{t('nav.solutions')}</Link>
            <Link href="/#formats" className={styles.footerLink}>{t('nav.formats')}</Link>
            <Link href="/how-it-works" className={styles.footerLink}>{t('nav.howItWorks')}<Icon name="arrow" className="h-4 w-4" /></Link>
          </nav>
        </div>
        <p className={styles.footerLegal}>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
