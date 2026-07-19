'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABELS: Record<string, string> = { ua: 'Укр', en: 'Eng' };

/** Переключатель языка Укр/Рус — сохраняет текущий путь. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={loc === locale}
          className={`px-2.5 py-1 font-medium transition ${
            loc === locale
              ? 'bg-navy text-white'
              : 'bg-white text-navy hover:bg-slate-50'
          }`}
        >
          {LABELS[loc] ?? loc}
        </button>
      ))}
    </div>
  );
}
