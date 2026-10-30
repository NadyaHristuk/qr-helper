import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './Logo';
import { Icon } from '@/components/product/Icon';

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-navy/10 bg-[#f5f5f2]">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 font-extrabold tracking-tight text-navy">
              <Logo /><span className="text-lg">{t('common.siteName')}</span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t('footer.tagline')}</p>
          </div>
          <nav aria-label={t('footer.navigation')} className="flex flex-col items-start gap-1 sm:flex-row sm:gap-5">
            <Link href="/#solutions" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy transition hover:text-accent">{t('nav.solutions')}</Link>
            <Link href="/#formats" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy transition hover:text-accent">{t('nav.formats')}</Link>
            <Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy transition hover:text-accent">{t('nav.howItWorks')}<Icon name="arrow" className="h-4 w-4" /></Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-navy/10 pt-5 text-xs leading-5 text-slate-500">{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
