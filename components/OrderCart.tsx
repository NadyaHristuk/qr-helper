'use client';

import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import {
  getCart,
  removeFromCart,
  clearCart,
  subscribeCart,
  type CartItem,
} from '@/lib/stickers/cart';

type OrderResponse = { id: number; priceKop: number; status: string };
type OrderErrorResponse = { error?: string };

const PRODUCT_LABELS: Record<string, [string, string]> = {
  sticker: ['Звичайна наліпка', 'Standard sticker'],
  vinyl: ['Вінілова / вологостійка', 'Vinyl / water-resistant'],
  transparent: ['Прозора на скло', 'Transparent glass sticker'],
  sign: ['Табличка', 'Rigid sign'],
  stand: ['Настільний стенд', 'Table stand'],
  poster: ['Постер', 'Poster'],
  business_card: ['Візитка з QR', 'QR business card'],
  qr_nfc: ['QR + NFC', 'QR + NFC'],
};

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

  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const onSubmit: SubmitHandler<FormValues> = async (d) => {
    setServerError(null);
    if (items.length === 0) {
      setServerError(t('errors.noItems'));
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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">🧾</div>
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
          {items.map((i) => (
            <li key={i.id} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 min-[420px]:grid-cols-[72px_minmax(0,1fr)_auto] min-[420px]:items-center min-[420px]:gap-4">
              <div className="rounded-xl bg-white p-2 shadow-sm">
                <StickerDesign type={i.payloadType} value={i.value} shape={i.shape} colors={i.colors} label={i.label} subtitle={i.subtitle} icon={i.icon} width={72} />
              </div>
              <div className="min-w-0 self-center">
                <p className="break-words font-bold text-navy">{i.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{PRODUCT_LABELS[i.productType]?.[ua ? 0 : 1] ?? i.productType} · {i.size} · ×{i.quantity}</p>
                <p className="text-xs leading-5 text-slate-400">{t(i.template === 'individual' ? 'templateIndividual' : 'templateStandard')}</p>
              </div>
              <button type="button" onClick={() => removeFromCart(i.id)} className="col-span-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-accent transition hover:bg-red-50 min-[420px]:col-span-1 min-[420px]:text-center">{t('remove')}</button>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/40 sm:p-6" noValidate>
        <h2 className="section-title">{t('sectionCustomer')}</h2>
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
            <RadioOption label={ua ? 'Онлайн (підключається)' : 'Online (integration planned)'} value="online" {...register('paymentMethod')} />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <label className="label">{ua ? 'Коментар до замовлення' : 'Order note'}</label>
          <textarea className="input min-h-24 resize-y" maxLength={500} placeholder={ua ? 'Побажання щодо друку, доставки або замовлення' : 'Printing, delivery or order notes'} {...register('customerNote')} />
        </div>

        {serverError && <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-accent">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-accent mt-6 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? t('submitting') : tc('orderCta')}</button>
      </form>
    </div>
  );
}

const CartField = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(function CartField({ label, error, ...props }, ref) {
  return <div><label className="label">{label}</label><input ref={ref} className={`input ${error ? 'border-accent focus:border-accent focus:ring-accent/10' : ''}`} {...props} />{error && <p className="mt-1 text-xs font-medium text-accent">{error}</p>}</div>;
});

const RadioOption = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(function RadioOption({ label, ...props }, ref) {
  return <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 hover:border-navy/30"><input ref={ref} type="radio" className="h-4 w-4" {...props} /><span>{label}</span></label>;
});
