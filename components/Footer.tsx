import { useTranslations } from 'next-intl';
import { Logo } from './Logo';

/** Футер сайта. */
export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2 font-extrabold text-navy">
          <Logo />
          <span>{t('common.siteName')}</span>
        </div>
        <p className="text-sm text-slate-500">{t('footer.tagline')}</p>
        <p className="text-xs text-slate-400">{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
