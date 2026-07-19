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

const FAQ_ITEMS = ['1', '2', '3', '4', '5', '6'] as const;

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
  const tc = useTranslations('common');

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-navy">{t('title')}</h1>

      {/* Шаги */}
      <ol className="mt-8 space-y-6">
        <Step n={1}>{t('step1')}</Step>
        <Step n={2}>{t('step2')}</Step>
        <Step n={3}>
          {t('step3')}
          <ul className="mt-3 space-y-1.5">
            {STEP3_ITEMS.map((k) => (
              <li key={k} className="flex gap-2 text-slate-600">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t(`step3Items.${k}`)}</span>
              </li>
            ))}
          </ul>
        </Step>
        <Step n={4}>{t('step4')}</Step>
      </ol>

      <div className="mt-8">
        <Link href="/order" className="btn-accent">
          {tc('orderCta')}
        </Link>
      </div>

      {/* FAQ */}
      <section id="faq" className="mt-16 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-bold text-navy">{t('faqTitle')}</h2>
        <div className="mt-6 space-y-3">
          {FAQ_ITEMS.map((i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 bg-white p-4 open:shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-navy marker:content-['']">
                {t(`faq.q${i}`)}
                <span className="text-accent transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-slate-600">{t(`faq.a${i}`)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
        {n}
      </span>
      <div className="pt-1 text-slate-700">{children}</div>
    </li>
  );
}
