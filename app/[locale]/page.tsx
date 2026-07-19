import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { StickerCard } from '@/components/StickerCard';
import { CATALOG } from '@/lib/stickers/catalog';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('home');
  const tc = useTranslations('common');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 text-base text-slate-600 sm:text-lg">{t('intro')}</p>
        <div className="mt-6">
          <a href="#kinds" className="btn-accent">
            {tc('customize')} →
          </a>
        </div>
      </section>

      {/* Список видов наклеек */}
      <section id="kinds" className="mt-12">
        <h2 className="section-title mb-1 text-center">{t('kindsTitle')}</h2>
        <p className="mb-5 text-center text-sm text-slate-500">{t('kindsHint')}</p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {CATALOG.map((s) => (
            <StickerCard
              key={s.key}
              stickerKey={s.key}
              title={t(`stickers.${s.key}.title`)}
              caption={t(`stickers.${s.key}.caption`)}
              label={t(`stickers.${s.key}.label`)}
            />
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-12 rounded-2xl bg-navy px-6 py-10 text-center text-white">
        <p className="mx-auto max-w-2xl text-lg">{t('ctaHint')}</p>
        <div className="mt-6">
          <Link
            href="/order"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            {tc('orderCta')}
          </Link>
        </div>
      </section>
    </div>
  );
}
