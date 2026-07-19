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

export function OrderCart() {
  const t = useTranslations('order');
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
        customerName: z.string().trim().min(1, t('errors.required')),
        customerPhone: z.string().trim().min(1, t('errors.required')),
        customerCity: z.string().trim().min(1, t('errors.required')),
        customerNpOffice: z.string().trim().min(1, t('errors.required')),
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
      if (!res.ok) throw new Error(String(res.status));
      setResult((await res.json()) as OrderResponse);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setServerError(t('errors.submitFailed'));
    }
  };

  // Успех
  if (result) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl text-white">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-navy">
          {t('success', { number: result.id })}
        </h2>
        <p className="mt-2 text-slate-600">{t('successNote')}</p>
        <p className="mt-4 text-sm text-slate-500">
          {(result.priceKop / 100).toFixed(0)} грн · {result.status}
        </p>
        <Link href="/" className="btn-outline mt-6">
          {t('newOrder')}
        </Link>
      </div>
    );
  }

  // Пустая корзина (после монтирования, чтобы не мигало на SSR)
  if (mounted && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
        <p className="text-slate-600">{t('cartEmpty')}</p>
        <Link href="/" className="btn-accent mt-5">
          {t('cartEmptyCta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-slate-600">{t('intro')}</p>

      {/* Корзина наклеек */}
      <section>
        <h2 className="section-title mb-4">{t('cartTitle')}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3"
            >
              <StickerDesign
                type={i.payloadType}
                value={i.value}
                shape={i.shape}
                colors={i.colors}
                label={i.label}
                subtitle={i.subtitle}
                icon={i.icon}
                width={80}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy">{i.label}</p>
                <p className="text-xs text-slate-500">
                  {t(i.template === 'individual' ? 'templateIndividual' : 'templateStandard')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(i.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-accent hover:bg-red-50"
              >
                {t('remove')}
              </button>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn-outline mt-4">
          {t('addMore')}
        </Link>
      </section>

      {/* Контакты */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section>
          <h2 className="section-title mb-4">{t('sectionCustomer')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <CartField label={t('fields.customerName')} placeholder={t('placeholders.customerName')} error={errors.customerName?.message} {...register('customerName')} />
            <CartField label={t('fields.customerPhone')} placeholder={t('placeholders.customerPhone')} error={errors.customerPhone?.message} {...register('customerPhone')} />
            <CartField label={t('fields.customerCity')} placeholder={t('placeholders.customerCity')} error={errors.customerCity?.message} {...register('customerCity')} />
            <CartField label={t('fields.customerNpOffice')} placeholder={t('placeholders.customerNpOffice')} error={errors.customerNpOffice?.message} {...register('customerNpOffice')} />
          </div>
        </section>

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">{serverError}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-accent w-full text-base disabled:opacity-60">
          {isSubmitting ? t('submitting') : t('pay')}
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
      <input ref={ref} className="input" {...props} />
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  );
});
