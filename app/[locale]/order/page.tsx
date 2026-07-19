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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold text-navy">{t('title')}</h1>
      <OrderCart />
    </div>
  );
}
