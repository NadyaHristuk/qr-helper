'use client';

import { forwardRef, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { QrPreview } from './QrPreview';
import type { StickerType, StickerValue } from '@/lib/qr/payloads';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Ключи полей-наклеек (по ним проверяем «заполнено хотя бы одно»). */
const STICKER_KEYS = [
  'facebook',
  'instagram',
  'telegram',
  'google',
  'phone',
  'email',
  'wifiSsid',
  'site',
  'olx',
  'youtube',
  'privat24',
  'carPhone',
  'promo',
] as const;

/** Порядок строк формы (wifi — особая строка с двумя полями). */
type RowKey =
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'google'
  | 'phone'
  | 'email'
  | 'wifi'
  | 'site'
  | 'olx'
  | 'youtube'
  | 'privat24'
  | 'carPhone'
  | 'promo';

const ROWS: RowKey[] = [
  'facebook',
  'instagram',
  'telegram',
  'google',
  'phone',
  'email',
  'wifi',
  'site',
  'olx',
  'youtube',
  'privat24',
  'carPhone',
  'promo',
];

/** Тип превью-QR для простых (однострочных) полей. */
const PREVIEW_TYPE: Record<Exclude<RowKey, 'wifi' | 'phone' | 'email'>, StickerType> = {
  facebook: 'facebook',
  instagram: 'instagram',
  telegram: 'telegram',
  google: 'google',
  site: 'site',
  olx: 'olx',
  youtube: 'youtube',
  privat24: 'privat24',
  carPhone: 'carPhone',
  promo: 'promo',
};

type OrderResponse = { id: number; priceKop: number; status: string };

export function OrderForm() {
  const t = useTranslations('order');
  const [result, setResult] = useState<OrderResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          facebook: z.string().trim().optional(),
          instagram: z.string().trim().optional(),
          telegram: z.string().trim().optional(),
          google: z.string().trim().optional(),
          phone: z.string().trim().optional(),
          email: z
            .string()
            .trim()
            .optional()
            .refine((v) => !v || EMAIL_RE.test(v), t('errors.invalidEmail')),
          wifiSsid: z.string().trim().optional(),
          wifiPassword: z.string().optional(),
          site: z.string().trim().optional(),
          olx: z.string().trim().optional(),
          youtube: z.string().trim().optional(),
          privat24: z.string().trim().optional(),
          carPhone: z.string().trim().optional(),
          promo: z.string().trim().optional(),
          template: z.enum(['standard', 'individual']),
          customerName: z.string().trim().min(1, t('errors.required')),
          customerPhone: z.string().trim().min(1, t('errors.required')),
          customerCity: z.string().trim().min(1, t('errors.required')),
          customerNpOffice: z.string().trim().min(1, t('errors.required')),
        })
        .refine(
          (d) => STICKER_KEYS.some((k) => (d[k] ?? '').toString().trim() !== ''),
          { message: t('errors.atLeastOne'), path: ['atLeastOne'] },
        ),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { template: 'standard' },
  });

  const values = watch();

  /** Собирает элементы заказа из заполненных полей формы. */
  function buildItems(d: FormValues): { type: StickerType; value: StickerValue }[] {
    const items: { type: StickerType; value: StickerValue }[] = [];
    const push = (type: StickerType, value: StickerValue) => items.push({ type, value });

    if (d.facebook) push('facebook', d.facebook);
    if (d.instagram) push('instagram', d.instagram);
    if (d.telegram) push('telegram', d.telegram);
    if (d.google) push('google', d.google);
    if (d.phone) push('vcard', { name: d.customerName || 'Контакт', phone: d.phone });
    if (d.email) push('email', { email: d.email });
    if (d.wifiSsid) push('wifi', { ssid: d.wifiSsid, password: d.wifiPassword || '' });
    if (d.site) push('site', d.site);
    if (d.olx) push('olx', d.olx);
    if (d.youtube) push('youtube', d.youtube);
    if (d.privat24) push('privat24', d.privat24);
    if (d.carPhone) push('carPhone', d.carPhone);
    if (d.promo) push('promo', d.promo);

    return items;
  }

  const onSubmit: SubmitHandler<FormValues> = async (d) => {
    setServerError(null);
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
          template: d.template,
          items: buildItems(d),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult((await res.json()) as OrderResponse);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setServerError(t('errors.submitFailed'));
    }
  };

  /** Значение для превью-QR конкретной строки (null — превью не показываем). */
  function previewFor(row: RowKey): { type: StickerType; value: StickerValue } | null {
    if (row === 'wifi') {
      return values.wifiSsid ? { type: 'wifi', value: { ssid: values.wifiSsid, password: values.wifiPassword || '' } } : null;
    }
    if (row === 'phone') {
      return values.phone ? { type: 'vcard', value: { name: values.customerName || 'Контакт', phone: values.phone } } : null;
    }
    if (row === 'email') {
      return values.email && EMAIL_RE.test(values.email) ? { type: 'email', value: { email: values.email } } : null;
    }
    const v = values[row];
    return v ? { type: PREVIEW_TYPE[row], value: v } : null;
  }

  const atLeastOneError = (errors as Record<string, { message?: string }>).atLeastOne?.message;

  /* --------------------------- Успех --------------------------- */
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
        <button
          type="button"
          className="btn-outline mt-6"
          onClick={() => {
            reset({ template: 'standard' });
            setResult(null);
          }}
        >
          {t('newOrder')}
        </button>
      </div>
    );
  }

  /* --------------------------- Форма --------------------------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
      {/* Наклейки */}
      <section>
        <h2 className="section-title mb-1">{t('sectionStickers')}</h2>
        <p className="mb-4 text-sm text-slate-500">{t('intro')}</p>

        {atLeastOneError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">
            {atLeastOneError}
          </p>
        )}

        <div className="space-y-4">
          {ROWS.map((row) => {
            const preview = previewFor(row);
            return (
              <div
                key={row}
                className="flex items-start gap-4 rounded-xl border border-slate-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  {row === 'wifi' ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="label">{t('fields.wifiSsid')}</label>
                        <input
                          className="input"
                          placeholder={t('placeholders.wifiSsid')}
                          {...register('wifiSsid')}
                        />
                      </div>
                      <div>
                        <label className="label">{t('fields.wifiPassword')}</label>
                        <input
                          className="input"
                          placeholder={t('placeholders.wifiPassword')}
                          {...register('wifiPassword')}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="label">{t(`fields.${row}`)}</label>
                      <input
                        className="input"
                        placeholder={t(`placeholders.${row}`)}
                        {...register(row)}
                      />
                      {(errors as Record<string, { message?: string }>)[row]?.message && (
                        <p className="mt-1 text-xs text-accent">
                          {(errors as Record<string, { message?: string }>)[row]?.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Живое превью QR */}
                <div className="shrink-0 pt-6">
                  {preview ? (
                    <div className="rounded-lg border-2 border-accent/60 p-1">
                      <QrPreview type={preview.type} value={preview.value} size={72} />
                    </div>
                  ) : (
                    <div className="h-[80px] w-[80px] rounded-lg border border-dashed border-slate-200" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Шаблон */}
      <section>
        <h2 className="section-title mb-4">{t('sectionTemplate')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-navy/40 has-[:checked]:border-navy has-[:checked]:bg-navy/5">
            <input type="radio" value="standard" {...register('template')} className="accent-navy" />
            <span className="font-medium text-navy">{t('templateStandard')}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-navy/40 has-[:checked]:border-navy has-[:checked]:bg-navy/5">
            <input type="radio" value="individual" {...register('template')} className="accent-navy" />
            <span className="font-medium text-navy">{t('templateIndividual')}</span>
          </label>
        </div>
      </section>

      {/* Контакты заказчика */}
      <section>
        <h2 className="section-title mb-4">{t('sectionCustomer')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fields.customerName')} placeholder={t('placeholders.customerName')} error={errors.customerName?.message} {...register('customerName')} />
          <Field label={t('fields.customerPhone')} placeholder={t('placeholders.customerPhone')} error={errors.customerPhone?.message} {...register('customerPhone')} />
          <Field label={t('fields.customerCity')} placeholder={t('placeholders.customerCity')} error={errors.customerCity?.message} {...register('customerCity')} />
          <Field label={t('fields.customerNpOffice')} placeholder={t('placeholders.customerNpOffice')} error={errors.customerNpOffice?.message} {...register('customerNpOffice')} />
        </div>
      </section>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-accent">{serverError}</p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-accent w-full text-base disabled:opacity-60">
        {isSubmitting ? t('submitting') : t('pay')}
      </button>
    </form>
  );
}

/** Поле контактов заказчика (label + input + ошибка). forwardRef — чтобы
 *  react-hook-form мог подключить ref через register(). */
const Field = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function Field({ label, error, ...props }, ref) {
  return (
    <div>
      <label className="label">{label}</label>
      <input ref={ref} className="input" {...props} />
      {error && <p className="mt-1 text-xs text-accent">{error}</p>}
    </div>
  );
});
