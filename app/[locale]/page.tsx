import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { StickerCard } from '@/components/StickerCard';
import type { StickerType, StickerValue } from '@/lib/qr/payloads';

/** Порядок и демо-содержимое 12 видов наклеек для превью на главной. */
const STICKERS: {
  key: string;
  demoType: StickerType;
  demoValue: StickerValue;
}[] = [
  { key: 'socials', demoType: 'facebook', demoValue: 'https://facebook.com/qr.pomichnyk' },
  { key: 'wifi', demoType: 'wifi', demoValue: { ssid: 'Cafe_Guest', password: 'welcome2024' } },
  {
    key: 'vcard',
    demoType: 'vcard',
    demoValue: { name: 'QR Помічник', company: 'Ваш заклад', phone: '+380501234567', email: 'hello@zaklad.ua' },
  },
  { key: 'email', demoType: 'email', demoValue: { email: 'hello@zaklad.ua', subject: 'Відгук' } },
  { key: 'sms', demoType: 'sms', demoValue: { phone: '+380501234567', message: 'Відгук:' } },
  { key: 'google', demoType: 'google', demoValue: 'https://g.page/vash-zaklad/review' },
  { key: 'privat24', demoType: 'privat24', demoValue: '5168755412345678' },
  { key: 'carPhone', demoType: 'carPhone', demoValue: '+380501234567' },
  { key: 'site', demoType: 'site', demoValue: 'https://vash-sait.ua' },
  { key: 'youtube', demoType: 'youtube', demoValue: 'https://youtube.com/@vash-kanal' },
  { key: 'olx', demoType: 'olx', demoValue: 'https://www.olx.ua/list/user/abcd1234/' },
  { key: 'app', demoType: 'site', demoValue: 'https://qr-pomichnyk.ua/app' },
];

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
          <Link href="/order" className="btn-accent">
            {t('kindsTitle')} →
          </Link>
        </div>
      </section>

      {/* Список видов наклеек */}
      <section className="mt-12">
        <h2 className="section-title mb-5 text-center">{t('kindsTitle')}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {STICKERS.map((s) => (
            <StickerCard
              key={s.key}
              title={t(`stickers.${s.key}.title`)}
              caption={t(`stickers.${s.key}.caption`)}
              demoType={s.demoType}
              demoValue={s.demoValue}
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
