import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const STEP3_ITEMS = [
  'wifi',
  'feedback',
  'contacts',
  'google',
  'socials',
  'pay',
  'car',
  'site',
  'olx',
] as const;

const FAQ_ITEMS = ['1', '2', '5', '6'] as const;

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HowItWorksContent />;
}

function HowItWorksContent() {
  const t = useTranslations('howItWorks');
  const th = useTranslations('home');
  const te = useTranslations('editor');
  const tc = useTranslations('common');

  return (
    <div className="bg-slate-50/60">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-navy sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{th('intro')}</p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Step n={1}>{th('kindsHint')}</Step>
          <Step n={2}>{te('fillHint')}</Step>
          <Step n={3}>{th('ctaHint')}</Step>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-navy">{t('step3')}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {STEP3_ITEMS.map((k) => (
              <li key={k} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t(`step3Items.${k}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8">
          <Link href="/#kinds" className="btn-accent">
            {tc('customize')}
          </Link>
        </div>

        <section id="faq" className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-black text-navy">{t('faqTitle')}</h2>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((i) => (
              <details
                key={i}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-navy marker:content-['']">
                  {t(`faq.q${i}`)}
                  <span className="text-xl text-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-7 text-slate-600">{t(`faq.a${i}`)}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
        {n}
      </span>
      <div className="mt-4 text-sm leading-6 text-slate-600">{children}</div>
    </div>
  );
}
