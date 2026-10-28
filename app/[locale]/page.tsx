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
  const th = useTranslations('howItWorks');

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-20">
          <div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-navy sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {t('intro')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#kinds" className="btn-accent">
                {tc('customize')} →
              </a>
              <Link href="/how-it-works" className="btn-outline">
                {tc('orderCta')}
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <ValuePoint icon="⚡" text={th('step1')} />
              <ValuePoint icon="🎨" text={th('step2')} />
              <ValuePoint icon="📦" text={th('step4')} />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-red-100 blur-2xl" />
            <div className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-blue-100 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="rounded-2xl bg-slate-50 p-5">
                <StickerCard
                  stickerKey="wifi"
                  title={t('stickers.wifi.title')}
                  caption={t('stickers.wifi.caption')}
                  label={t('stickers.wifi.label')}
                  featured
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-navy">{th('title')}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Step number="1" title={th('step1')} text={th('step3Items.wifi')} />
          <Step number="2" title={th('step2')} text={th('step3Items.contacts')} />
          <Step number="3" title={th('step3')} text={th('step4')} />
        </div>
      </section>

      <section id="kinds" className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-navy">{t('kindsTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">{t('kindsHint')}</p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="overflow-hidden rounded-3xl bg-navy px-6 py-10 text-center text-white sm:px-10 sm:py-12">
          <p className="mx-auto max-w-2xl text-xl font-semibold leading-8">{t('ctaHint')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#kinds" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-semibold text-navy transition hover:bg-slate-100">
              {tc('customize')}
            </a>
            <Link href="/order" className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              {tc('orderCta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValuePoint({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-5 text-slate-600 shadow-sm">
      <span aria-hidden className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{number}</div>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
