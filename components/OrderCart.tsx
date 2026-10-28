'use client';

import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
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

export function OrderCart() {
  const t = useTranslations('order');
  const tc = useTranslations('common');
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
        customerPhone: z
          .string()
          .trim()
          .min(1, t('errors.required'))
          .regex(/^\+?[\d\s().-]{10,24}$/, t('errors.required')),
        customerCity: z.string().trim().min(1, t('errors.required')).max(120),
        customerNpOffice: z.string().trim().min(1, t('errors.required')).max(120),
      }),
    [t],
  );
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FormValues> = async (d) => {
    setServerError(null);
    if (items.length === 0) {
      setServerError(t('errors.noItems'));
      return;
    }

    const template = items.some((i) => i.template === 'individual')
      ? 'individual'
      : 'standard';

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
          },
          template,
          items: items.map((i) => ({
            type: i.payloadType,
            value: i.value,
            label: i.label,
            shape: i.shape,
            template: i.template,
            colors: i.colors,
          })),
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | OrderResponse
        | OrderErrorResponse
        | null;

      if (!res.ok) {
        throw new Error(
          payload && 'error' in payload && payload.error
            ? payload.error
            : t('errors.submitFailed'),
        );
      }

      setResult(payload as OrderResponse);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setServerError(
        error instanceof Error && error.message
          ? error.message
          : t('errors.submitFailed'),
      );
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-green-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl text-white shadow-lg shadow-green-100">
          ✓
        </div>
        <h2 className="text-2xl font-black text-navy sm:text-3xl">
          {t('success', { number: result.id })}
        </h2>
        <p className="mt-3 leading-7 text-slate-600">{t('successNote')}</p>
        <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
          {(result.priceKop / 100).toFixed(0)} грн · {result.status}
        </div>
        <div className="mt-6">
          <Link href="/" className="btn-outline">
            {t('newOrder')}
          </Link>
        </div>
      </div>
    );
  }

  if (mounted && items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">🧾</div>
        <p className="text-slate-600">{t('cartEmpty')}</p>
        <Link href="/" className="btn-accent mt-5">
          {t('cartEmptyCta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="section-title">{t('cartTitle')}</h2>
            <p className="mt-1 text-sm text-slate-500">{items.length}</p>
          </div>
          <Link href="/" className="text-sm font-semibold text-navy transition hover:text-accent">
            {t('addMore')} →
          </Link>
        </div>

        <ul className="mt-5 space-y-3">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
            >
              <div className="shrink-0 rounded-xl bg-white p-2 shadow-sm">
                <StickerDesign
                  type={i.payloadType}
                  value={i.value}
                  shape={i.shape}
                  colors={i.colors}
                  label={i.label}
                  subtitle={i.subtitle}
                  icon={i.icon}
                  width={72}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy">{i.label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {t(i.template === 'individual' ? 'templateIndividual' : 'templateStandard')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(i.id)}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-accent transition hover:bg-red-50"
              >
                {t('remove')}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 sm:p-6" noValidate>
        <h2 className="section-title">{t('sectionCustomer')}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t('intro')}</p>

        <div className="mt-5 grid gap-4">
          <CartField autoComplete="name" label={t('fields.customerName')} placeholder={t('placeholders.customerName')} error={errors.customerName?.message} {...register('customerName')} />
          <CartField type="tel" inputMode="tel" autoComplete="tel" label={t('fields.customerPhone')} placeholder={t('placeholders.customerPhone')} error={errors.customerPhone?.message} {...register('customerPhone')} />
          <CartField autoComplete="address-level2" label={t('fields.customerCity')} placeholder={t('placeholders.customerCity')} error={errors.customerCity?.message} {...register('customerCity')} />
          <CartField label={t('fields.customerNpOffice')} placeholder={t('placeholders.customerNpOffice')} error={errors.customerNpOffice?.message} {...register('customerNpOffice')} />
        </div>

        {serverError && (
          <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-accent">{serverError}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-accent mt-6 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? t('submitting') : tc('orderCta')}
        </button>
      </form>
    </div>
  );
}

const CartField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function CartField({ label, error, ...props }, ref) {
  return (
    <div>
      <label className="label">{label}</label>
      <input ref={ref} className={`input ${error ? 'border-accent focus:border-accent focus:ring-accent/10' : ''}`} {...props} />
      {error && <p className="mt-1 text-xs font-medium text-accent">{error}</p>}
    </div>
  );
});
