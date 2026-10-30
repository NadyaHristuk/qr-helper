import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { OrderCart } from '@/components/OrderCart';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OrderPageContent />;
}

function OrderPageContent() {
  const t = useTranslations('order');

  return (
    <div className="product-checkout bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight text-navy sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{t('intro')}</p>
        </div>
        <OrderCart />
      </div>
    </div>
  );
}
