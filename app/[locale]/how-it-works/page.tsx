import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/product/Icon';

const STEPS = ['1', '2', '3'] as const;
const FAQ_ITEMS = ['1', '2', '3', '4', '5', '6'] as const;

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HowItWorksContent />;
}

function HowItWorksContent() {
  const t = useTranslations('howItWorks');

  return (
    <div className="product-how bg-white">
      <section className="border-b border-navy/10 bg-[#f5f5f2]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t('eyebrow')}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-navy sm:text-5xl">{t('title')}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{t('intro')}</p>
          <Link href="/#solutions" className="btn-accent mt-7 gap-3">{t('cta')}<Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <section aria-label={t('stepsLabel')}>
          <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
            {STEPS.map((step) => (
              <li key={step} className="border-t-2 border-navy/15 pt-5">
                <span aria-hidden className="text-sm font-bold tracking-wider text-accent">0{step}</span>
                <h2 className="mt-5 text-xl font-bold leading-7 tracking-tight text-navy">{t(`steps.${step}.title`)}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t(`steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 grid gap-6 border-y border-navy/10 py-8 sm:mt-20 sm:grid-cols-[1fr_1.4fr] sm:gap-12">
          <h2 className="text-2xl font-bold tracking-tight text-navy">{t('readyTitle')}</h2>
          <p className="text-base leading-7 text-slate-600">{t('readyBody')}</p>
        </section>

        <section id="faq" className="mt-14 scroll-mt-28 sm:mt-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy">{t('faqTitle')}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{t('faqIntro')}</p>
            </div>
            <div className="border-t border-navy/15">
              {FAQ_ITEMS.map((item) => (
                <details key={item} className="group border-b border-navy/15 py-2">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 text-sm font-semibold leading-6 text-navy marker:content-[''] sm:text-base">
                    {t(`faq.q${item}`)}
                    <span aria-hidden className="shrink-0 text-2xl font-normal text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-slate-600">{t(`faq.a${item}`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
