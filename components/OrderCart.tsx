'use client';

import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { Icon } from './product/Icon';
import { PHYSICAL_PRODUCTS, findSolution, solutionForCatalog, localized } from '@/lib/products/solutions';
import { destinationSummary } from '@/lib/products/presentation';
import {
  getCart,
  removeFromCart,
  clearCart,
  subscribeCart,
  type CartItem,
} from '@/lib/stickers/cart';

type OrderResponse = { id: number; priceKop: number; status: string };
type OrderErrorResponse = { error?: string };


export function OrderCart() {
  const t = useTranslations('order');
  const tc = useTranslations('common');
  const locale = useLocale();
  const ua = locale === 'ua';
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<OrderResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setItems(getCart());
    return subscribeCart(() => setItems(getCart()));
  }, []);

  const schema = useMemo(
    () =>
      z.object({
        customerName: z.string().trim().min(1, t('errors.required')).max(120),
        customerPhone: z.string().trim().min(1, t('errors.required')).regex(/^\+?[\d\s().-]{10,24}$/, t('errors.required')),
        customerCity: z.string().trim().min(1, t('errors.required')).max(120),
        customerNpOffice: z.string().trim().max(120),
        customerNote: z.string().trim().max(500).optional(),
        deliveryMethod: z.enum(['nova_poshta', 'pickup', 'courier']),
        paymentMethod: z.enum(['manager', 'online']),
      }).superRefine((data, ctx) => {
        if (data.deliveryMethod !== 'pickup' && !data.customerNpOffice) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customerNpOffice'], message: t('errors.required') });
        }
      }),
    [t],
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerNpOffice: '', deliveryMethod: 'nova_poshta', paymentMethod: 'manager' },
  });

  const deliveryMethod = watch('deliveryMethod');

  const hasUnavailableProducts = items.some((item) => PHYSICAL_PRODUCTS.find((product) => product.key === item.productType)?.available === false);

  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const onSubmit: SubmitHandler<FormValues> = async (d) => {
    setServerError(null);
    if (items.length === 0) {
      setServerError(t('errors.noItems'));
      return;
    }

    if (hasUnavailableProducts) {
      setServerError(ua ? 'Приберіть недоступний формат, щоб продовжити.' : 'Remove the unavailable format to continue.');
      return;
    }

    const template = items.some((i) => i.template === 'individual') ? 'individual' : 'standard';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: d.customerName,
            phone: d.customerPhone,
            city: d.customerCity,
            npOffice: d.customerNpOffice,
            note: d.customerNote ?? '',
          },
          deliveryMethod: d.deliveryMethod,
          paymentMethod: d.paymentMethod,
          template,
          items: items.map((i) => ({
            type: i.payloadType,
            value: i.value,
            label: i.label,
            subtitle: i.subtitle,
            icon: i.icon,
            shape: i.shape,
            template: i.template,
            colors: i.colors,
            productType: i.productType,
            size: i.size,
            quantity: i.quantity,
          })),
        }),
      });

      const payload = (await res.json().catch(() => null)) as OrderResponse | OrderErrorResponse | null;

      if (!res.ok) {
        throw new Error(payload && 'error' in payload && payload.error ? payload.error : t('errors.submitFailed'));
      }

      setResult(payload as OrderResponse);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setServerError(error instanceof Error && error.message ? error.message : t('errors.submitFailed'));
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-green-200 bg-white p-5 text-center shadow-xl shadow-slate-200/50 sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl text-white shadow-lg shadow-green-100">✓</div>
        <h2 className="text-2xl font-black text-navy sm:text-3xl">{t('success', { number: result.id })}</h2>
        <p className="mt-3 leading-7 text-slate-600">{t('successNote')}</p>
        <div className="mt-6"><Link href="/" className="btn-outline w-full sm:w-auto">{t('newOrder')}</Link></div>
      </div>
    );
  }

  if (mounted && items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-navy"><Icon name="shoppingBag" /></div>
        <p className="text-slate-600">{t('cartEmpty')}</p>
        <Link href="/" className="btn-accent mt-5 w-full sm:w-auto">{t('cartEmptyCta')}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between min-[360px]:gap-4">
          <div>
            <h2 className="section-title">{t('cartTitle')}</h2>
            <p className="mt-1 text-sm text-slate-500">{items.length} {ua ? 'позицій' : 'items'} · {totalUnits} {ua ? 'шт.' : 'units'}</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-navy transition hover:text-accent">{t('addMore')} →</Link>
        </div>

        <ul className="mt-5 space-y-3">
          {items.map((i) => {
            const requestedGoal = i.businessGoal ? findSolution(i.businessGoal) : undefined;
            const goal = requestedGoal?.variants.some((variant) => variant.catalogKey === i.key) ? requestedGoal : solutionForCatalog(i.key);
            const physical = PHYSICAL_PRODUCTS.find((product) => product.key === i.productType);
            return <li key={i.id} className="rounded-2xl border border-slate-200 p-3 sm:p-4">
              <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4">
                <div className="flex items-center justify-center rounded-xl bg-[#f0ede8] p-2"><StickerDesign type={i.payloadType} value={i.value} shape={i.shape} colors={i.colors} label={i.label} subtitle={i.subtitle} icon={i.icon} visualIcon={goal?.icon ?? 'scan'} width={72} /></div>
                <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{ua ? 'Дія клієнта' : 'Customer action'}</p><h3 className="mt-1 break-words text-base font-bold text-navy">{goal ? localized(goal.title, locale) : ua ? 'Ваш виріб' : 'Your product'}</h3><p className="mt-2 break-words text-xs leading-5 text-slate-500">{ua ? 'Напис' : 'Message'}: {i.label}</p></div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-slate-100 pt-3 text-xs leading-5">
                <div><dt className="text-slate-500">{ua ? 'Формат' : 'Format'}</dt><dd className="font-semibold text-navy">{physical ? localized(physical.title, locale) : ua ? 'Наліпка' : 'Sticker'}{physical && !physical.available && <span className="block font-normal text-accent">{ua ? 'Поки недоступно' : 'Not available yet'}</span>}</dd></div>
                <div><dt className="text-slate-500">{ua ? 'Розмір · кількість' : 'Size · quantity'}</dt><dd className="font-semibold text-navy">{i.size} · ×{i.quantity}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">{ua ? 'Дизайн' : 'Design'}</dt><dd className="text-navy">{t(i.template === 'individual' ? 'templateIndividual' : 'templateStandard')}</dd></div>
                <div className="col-span-2 min-w-0"><dt className="text-slate-500">{ua ? 'Призначення QR' : 'QR destination'}</dt><dd className="break-all font-medium text-navy">{destinationSummary(i.payloadType, i.value, locale)}</dd></div>
              </dl>
              <button type="button" onClick={() => removeFromCart(i.id)} className="mt-3 min-h-11 rounded-lg px-2 text-sm font-semibold text-accent hover:bg-red-50">{t('remove')}</button>
            </li>;
          })}
        </ul>
        {hasUnavailableProducts && <p role="alert" className="mt-4 text-sm leading-6 text-accent">{ua ? 'У кошику є недоступний формат. Приберіть його, щоб оформити замовлення.' : 'Your cart contains a format that is not available yet. Remove it to place the order.'}</p>}
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/40 sm:p-6" noValidate>
        <h2 className="section-title">{t('sectionCustomer')}</h2>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">{ua ? 'Демонстраційна ціна замовлення — 1 грн. Деталі виготовлення та оплати узгодимо з вами.' : 'Demo order price: UAH 1. We will confirm production and payment details with you.'}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t('intro')}</p>

        <div className="mt-5 grid gap-4">
          <CartField autoComplete="name" label={t('fields.customerName')} placeholder={t('placeholders.customerName')} error={errors.customerName?.message} {...register('customerName')} />
          <CartField type="tel" inputMode="tel" autoComplete="tel" label={t('fields.customerPhone')} placeholder={t('placeholders.customerPhone')} error={errors.customerPhone?.message} {...register('customerPhone')} />
          <CartField autoComplete="address-level2" label={t('fields.customerCity')} placeholder={t('placeholders.customerCity')} error={errors.customerCity?.message} {...register('customerCity')} />
          {deliveryMethod !== 'pickup' && <CartField label={deliveryMethod === 'courier' ? (ua ? 'Адреса доставки' : 'Delivery address') : t('fields.customerNpOffice')} placeholder={deliveryMethod === 'courier' ? undefined : t('placeholders.customerNpOffice')} error={errors.customerNpOffice?.message} {...register('customerNpOffice')} />}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-navy">{ua ? 'Доставка' : 'Delivery'}</h3>
          <div className="mt-3 grid gap-2">
            <RadioOption label={ua ? 'Нова Пошта' : 'Nova Poshta'} value="nova_poshta" {...register('deliveryMethod')} />
            <RadioOption label={ua ? 'Самовивіз' : 'Pickup'} value="pickup" {...register('deliveryMethod')} />
            <RadioOption label={ua ? 'Курʼєр' : 'Courier'} value="courier" {...register('deliveryMethod')} />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-navy">{ua ? 'Оплата' : 'Payment'}</h3>
          <div className="mt-3 grid gap-2">
            <RadioOption label={ua ? 'Після підтвердження менеджером' : 'After manager confirmation'} value="manager" {...register('paymentMethod')} />
            <RadioOption disabled label={ua ? 'Онлайн-оплата — згодом' : 'Online payment — coming later'} value="online" {...register('paymentMethod')} />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <label htmlFor="order-note" className="label">{ua ? 'Коментар до замовлення' : 'Order note'}</label>
          <textarea id="order-note" className="input min-h-24 resize-y" maxLength={500} placeholder={ua ? 'Побажання щодо друку, доставки або замовлення' : 'Printing, delivery or order notes'} {...register('customerNote')} />
        </div>

        {serverError && <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-accent">{serverError}</p>}

        <button type="submit" disabled={isSubmitting || hasUnavailableProducts} className="btn-accent mt-6 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? t('submitting') : tc('orderCta')}</button>
      </form>
    </div>
  );
}

const CartField = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(function CartField({ label, error, ...props }, ref) {
  return <div><label htmlFor={props.name} className="label">{label}</label><input id={props.name} ref={ref} className={`input ${error ? 'border-accent focus:border-accent focus:ring-accent/10' : ''}`} {...props} />{error && <p className="mt-1 text-xs font-medium text-accent">{error}</p>}</div>;
});

const RadioOption = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(function RadioOption({ label, ...props }, ref) {
  return <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 hover:border-navy/30"><input ref={ref} type="radio" className="h-4 w-4" {...props} /><span>{label}</span></label>;
});
