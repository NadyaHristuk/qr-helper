'use client';

import { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { getSticker, DEFAULT_COLORS, type StickerDef, type DesignColors, type StickerShape, type TemplateKind } from '@/lib/stickers/catalog';
import { addToCart, type ProductType, type StickerSize } from '@/lib/stickers/cart';
import { buildPayload } from '@/lib/qr/payloads';

const SHAPES: StickerShape[] = ['rect', 'circle', 'phone'];
const COLOR_KEYS: (keyof DesignColors)[] = ['text', 'frame', 'bg', 'icon', 'qr'];
const PRODUCT_TYPES: ProductType[] = ['sticker', 'vinyl', 'transparent', 'sign', 'stand', 'poster', 'business_card', 'qr_nfc'];
const SIZES: StickerSize[] = ['S', 'M', 'L'];

const PRODUCT_LABELS: Record<ProductType, [string, string]> = {
  sticker: ['Звичайна наліпка', 'Standard sticker'],
  vinyl: ['Вінілова / вологостійка', 'Vinyl / water-resistant'],
  transparent: ['Прозора на скло', 'Transparent glass sticker'],
  sign: ['Табличка', 'Rigid sign'],
  stand: ['Настільний стенд', 'Table stand'],
  poster: ['Постер', 'Poster'],
  business_card: ['Візитка з QR', 'QR business card'],
  qr_nfc: ['QR + NFC', 'QR + NFC'],
};

export function StickerEditor({ stickerKey }: { stickerKey: string }) {
  const def = getSticker(stickerKey);
  if (!def) notFound();
  return <ConfiguredStickerEditor key={stickerKey} stickerKey={stickerKey} def={def} />;
}

function ConfiguredStickerEditor({ stickerKey, def }: { stickerKey: string; def: StickerDef }) {
  const t = useTranslations('editor');
  const th = useTranslations('home');
  const locale = useLocale();
  const ua = locale === 'ua';
  const router = useRouter();

  const [data, setData] = useState<Record<string, string>>({});
  const [label, setLabel] = useState<string>(th(`stickers.${stickerKey}.label`));
  const [shape, setShape] = useState<StickerShape>(def.defaultShape);
  const [template, setTemplate] = useState<TemplateKind>('standard');
  const [colors, setColors] = useState<DesignColors>(DEFAULT_COLORS);
  const [productType, setProductType] = useState<ProductType>('sticker');
  const [size, setSize] = useState<StickerSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const value = def.buildValue(data);
  const subtitle = def.subtitle?.(data);
  const effectiveColors = template === 'individual' ? colors : DEFAULT_COLORS;

  const isPayloadValid = useMemo(() => {
    try {
      buildPayload(def.payloadType, value);
      return true;
    } catch {
      return false;
    }
  }, [def.payloadType, value]);

  const setField = (name: string, v: string) => setData((d) => ({ ...d, [name]: v }));
  const setColor = (k: keyof DesignColors, v: string) => setColors((c) => ({ ...c, [k]: v }));

  function handleAdd() {
    if (!isPayloadValid) return;

    addToCart({
      key: def.key,
      payloadType: def.payloadType,
      value,
      label,
      subtitle,
      icon: def.icon,
      shape,
      template,
      colors: effectiveColors,
      productType,
      size,
      quantity,
    });
    setAdded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-10">
      <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-accent">{t('backToStickers')}</Link>

      <div className="mt-4 max-w-3xl">
        <h1 className="text-2xl font-black tracking-tight text-navy min-[360px]:text-3xl sm:text-4xl">{th(`stickers.${stickerKey}.title`)}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 min-[360px]:text-base min-[360px]:leading-7">{th(`stickers.${stickerKey}.caption`)}</p>
      </div>

      {added && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-green-700">✓ {t('added')}</p>
          <div className="grid gap-2 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:gap-3">
            <button className="btn-accent w-full min-[420px]:w-auto" onClick={() => router.push('/order')}>{t('goToOrder')}</button>
            <Link href="/" className="btn-outline w-full min-[420px]:w-auto">{t('addAnother')}</Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-8">
        <div className="space-y-4 sm:space-y-5">
          <EditorSection title={t('dataSection')}>
            {def.payloadType === 'privat24' && <p role="status" className="text-sm leading-6 text-slate-600">{ua ? 'Концепт для обговорення. Платіжний QR буде доступний після інтеграції з платіжним сервісом. Не вводьте реквізити картки.' : 'Concept for discussion. Payment QR requires a merchant integration. Do not enter card details.'}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {def.fields.map((f) => (
                <div key={f.name} className={def.fields.length === 1 ? 'sm:col-span-2' : ''}>
                  <label className="label">{t(`fields.${f.name}`)}</label>
                  <input
                    className="input"
                    type={f.kind === 'password' ? 'text' : f.kind === 'url' ? 'url' : f.kind === 'email' ? 'email' : f.kind === 'tel' ? 'tel' : 'text'}
                    inputMode={f.kind === 'tel' ? 'tel' : f.kind === 'email' ? 'email' : f.kind === 'url' ? 'url' : undefined}
                    value={data[f.name] ?? ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </EditorSection>

          <EditorSection title={t('labelField')}>
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} />
          </EditorSection>

          <EditorSection title={t('shapeSection')}>
            <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
              {SHAPES.map((sh) => (
                <button key={sh} type="button" onClick={() => setShape(sh)} className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition sm:px-4 ${shape === sh ? 'border-navy bg-navy text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-navy/40 hover:text-navy'}`}>
                  {t(`shapes.${sh}`)}
                </button>
              ))}
            </div>
          </EditorSection>

          <EditorSection title={t('templateSection')}>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['standard', 'individual'] as TemplateKind[]).map((value) => (
                <button key={value} type="button" onClick={() => setTemplate(value)} className={`rounded-2xl border-2 p-4 text-left transition ${template === value ? 'border-navy bg-navy/5' : 'border-slate-200 bg-white hover:border-navy/30'}`}>
                  <span className="block font-bold text-navy">{value === 'standard' ? t('templateStandard') : t('templateIndividual')}</span>
                </button>
              ))}
            </div>

            {template === 'individual' && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {COLOR_KEYS.map((k) => (
                  <label key={k} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    <span className="mb-2 block break-words text-xs font-semibold text-slate-500">{t(`colors.${k}`)}</span>
                    <input type="color" value={colors[k]} onChange={(e) => setColor(k, e.target.value)} className="h-11 w-full cursor-pointer rounded border border-slate-300 bg-white" />
                  </label>
                ))}
              </div>
            )}
          </EditorSection>

          <EditorSection title={ua ? 'Носій та тираж' : 'Product and quantity'}>
            <div className="grid gap-4">
              <div>
                <label className="label">{ua ? 'Тип виробу' : 'Product type'}</label>
                <select className="input" value={productType} onChange={(e) => setProductType(e.target.value as ProductType)}>
                  {PRODUCT_TYPES.map((type) => <option key={type} value={type}>{PRODUCT_LABELS[type][ua ? 0 : 1]}</option>)}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{ua ? 'Розмір' : 'Size'}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SIZES.map((value) => (
                      <button key={value} type="button" onClick={() => setSize(value)} className={`rounded-xl border-2 px-3 py-2.5 text-sm font-bold ${size === value ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{value}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">{ua ? 'Кількість' : 'Quantity'}</label>
                  <input className="input" type="number" min={1} max={999} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(999, Math.floor(Number(e.target.value)) || 1)))} />
                </div>
              </div>
              <p className="text-xs leading-5 text-slate-500">{ua ? 'Розміри та ціни поки демонстраційні — Юра зможе затвердити реальні варіанти після перегляду концепту.' : 'Sizes and pricing are demo options until the real product range is approved.'}</p>
            </div>
          </EditorSection>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="section-title min-w-0">{t('previewSection')}</h2>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${isPayloadValid ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{isPayloadValid ? 'QR ✓' : 'QR …'}</span>
            </div>

            <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-3 min-[360px]:min-h-[340px] sm:min-h-[390px] sm:p-4">
              <StickerDesign type={def.payloadType} value={value} shape={shape} colors={effectiveColors} label={label} subtitle={subtitle} icon={def.icon} width={260} />
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
              {PRODUCT_LABELS[productType][ua ? 0 : 1]} · {size} · ×{quantity}
            </div>

            {!isPayloadValid && <p className="mt-4 text-center text-sm leading-6 text-slate-500">{t('fillHint')}</p>}
            <button type="button" onClick={handleAdd} disabled={!isPayloadValid} className="btn-accent mt-5 w-full py-3 disabled:cursor-not-allowed disabled:opacity-50">{t('addToOrder')}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="section-title mb-4">{title}</h2>
      {children}
    </section>
  );
}
