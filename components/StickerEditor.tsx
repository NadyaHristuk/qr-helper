'use client';

import { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { Icon } from './product/Icon';
import { getSticker, DEFAULT_COLORS, type StickerDef, type DesignColors, type StickerShape, type TemplateKind } from '@/lib/stickers/catalog';
import { addToCart, type ProductType, type StickerSize } from '@/lib/stickers/cart';
import { buildPayload } from '@/lib/qr/payloads';
import { findSolution, solutionForCatalog, PHYSICAL_PRODUCTS, localized } from '@/lib/products/solutions';
import { qrContrast } from '@/lib/products/quality';
import { productMessage } from '@/lib/products/presentation';

const SHAPES: StickerShape[] = ['rect', 'circle', 'phone'];
const COLOR_KEYS: (keyof DesignColors)[] = ['text', 'frame', 'bg', 'icon', 'qr'];
const SIZES: StickerSize[] = ['S', 'M', 'L'];

type EditorProps = { stickerKey: string; initialGoal?: string; initialProductType?: string };

export function StickerEditor({ stickerKey, initialGoal, initialProductType }: EditorProps) {
  const def = getSticker(stickerKey);
  if (!def) notFound();
  return <ConfiguredStickerEditor key={`${stickerKey}:${initialGoal ?? ''}:${initialProductType ?? ''}`} stickerKey={stickerKey} def={def} initialGoal={initialGoal} initialProductType={initialProductType} />;
}

function ConfiguredStickerEditor({ stickerKey, def, initialGoal, initialProductType }: EditorProps & { def: StickerDef }) {
  const t = useTranslations('editor');
  const th = useTranslations('home');
  const locale = useLocale();
  const ua = locale === 'ua';
  const router = useRouter();
  const requestedGoal = initialGoal ? findSolution(initialGoal) : undefined;
  const goal = requestedGoal?.variants.some((variant) => variant.catalogKey === stickerKey)
    ? requestedGoal : solutionForCatalog(stickerKey);
  const interaction = goal?.variants.find((variant) => variant.catalogKey === stickerKey);
  const [data, setData] = useState<Record<string, string>>({});
  const [label, setLabel] = useState(() => productMessage(goal?.key, locale, th(`stickers.${stickerKey}.label`)));
  const [shape, setShape] = useState<StickerShape>(def.defaultShape);
  const [template, setTemplate] = useState<TemplateKind>('standard');
  const [colors, setColors] = useState<DesignColors>(DEFAULT_COLORS);
  const [productType, setProductType] = useState<ProductType>(() =>
    PHYSICAL_PRODUCTS.find((product) => product.key === initialProductType && product.available)?.key ?? 'sticker');
  const [size, setSize] = useState<StickerSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const value = def.buildValue(data);
  const subtitle = def.subtitle?.(data);
  const effectiveColors = template === 'individual' ? colors : DEFAULT_COLORS;
  const selectedProduct = PHYSICAL_PRODUCTS.find((product) => product.key === productType)!;
  const contrast = qrContrast(effectiveColors.qr, effectiveColors.bg);
  const contrastWarning = contrast && (contrast.ratio < 4.5 || !contrast.darkOnLight);
  const isPayloadValid = useMemo(() => {
    try { buildPayload(def.payloadType, value); return true; }
    catch { return false; }
  }, [def.payloadType, value]);
  const setField = (name: string, next: string) => setData((current) => ({ ...current, [name]: next }));
  const setColor = (key: keyof DesignColors, next: string) => setColors((current) => ({ ...current, [key]: next }));

  function handleAdd() {
    if (!isPayloadValid) return;
    addToCart({
      key: def.key,
      ...(goal ? { businessGoal: goal.key } : {}),
      payloadType: def.payloadType, value, label, subtitle, icon: goal?.icon ?? 'scan',
      shape, template, colors: effectiveColors, productType, size, quantity,
    });
    setAdded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="product-editor mx-auto max-w-6xl px-4 py-7 sm:py-12">
      <Link href="/#solutions" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-accent">
        <Icon name="arrow" className="h-4 w-4 rotate-180" />{ua ? 'Усі рішення' : 'All solutions'}
      </Link>
      <div className="mt-4 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{ua ? 'Налаштуйте свій виріб' : 'Make it yours'}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-navy sm:text-4xl">{goal ? localized(goal.title, locale) : th(`stickers.${stickerKey}.title`)}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{goal ? localized(goal.description, locale) : ua ? 'Цей варіант наразі недоступний для замовлення.' : 'This option is currently unavailable to order.'}</p>
      </div>
      {added && (
        <div role="status" className="mt-6 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-semibold text-green-800"><Icon name="check" className="h-5 w-5 shrink-0" />{t('added')}</p>
          <div className="grid gap-2 min-[420px]:flex min-[420px]:flex-wrap">
            <button type="button" className="btn-accent" onClick={() => router.push('/order')}>{t('goToOrder')}</button>
            <Link href="/#solutions" className="btn-outline">{t('addAnother')}</Link>
          </div>
        </div>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <EditorSection number="01" title={ua ? 'Дія клієнта' : 'Customer action'}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy"><Icon name={goal?.icon ?? 'scan'} className="h-6 w-6" /></span>
              <div className="min-w-0">
                <p className="font-bold text-navy">{interaction ? localized(interaction.title, locale) : th(`stickers.${stickerKey}.title`)}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{interaction ? localized(interaction.description, locale) : ua ? 'Оплата стане доступною після підключення платіжного сервісу.' : 'Payments will be available after a payment service is connected.'}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{ua ? 'Дані записуються у виріб. Якщо вони зміняться, знадобиться новий друк.' : 'The QR contains these details or this link. Changing the encoded content requires a new print.'}</p>
          </EditorSection>
          <EditorSection number="02" title={ua ? 'Посилання та дані' : 'Destination and details'}>
            {def.payloadType === 'privat24' && <p role="status" className="text-sm leading-6 text-slate-600">{ua ? 'Цей спосіб оплати ще недоступний. Не вводьте реквізити картки.' : 'This payment option is not available yet. Do not enter card details.'}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              {def.fields.map((field) => {
                const password = field.name === 'password';
                const fieldId = `editor-${field.name}`;
                return <div key={field.name} className={def.fields.length === 1 ? 'sm:col-span-2' : ''}>
                  <label htmlFor={fieldId} className="label">{t(`fields.${field.name}`)}</label>
                  <input id={fieldId} className="input" type={password ? showPassword ? 'text' : 'password' : field.kind === 'url' ? 'url' : field.kind === 'email' ? 'email' : field.kind === 'tel' ? 'tel' : 'text'}
                    autoComplete={password ? 'off' : undefined}
                    inputMode={field.kind === 'tel' ? 'tel' : field.kind === 'email' ? 'email' : field.kind === 'url' ? 'url' : undefined}
                    value={data[field.name] ?? ''} onChange={(event) => setField(field.name, event.target.value)} />
                  {password && <button type="button" aria-controls={fieldId} aria-pressed={showPassword} className="mt-1 min-h-11 text-sm font-semibold text-navy" onClick={() => setShowPassword((current) => !current)}>{showPassword ? ua ? 'Приховати пароль' : 'Hide password' : ua ? 'Показати пароль' : 'Show password'}</button>}
                </div>;
              })}
            </div>
            {def.fields.some((field) => field.kind === 'url') && <p className="mt-3 text-xs leading-5 text-slate-500">{ua ? 'Додайте чинне посилання, яке вже доступне вашим клієнтам.' : 'Use an existing published link that your customers can open.'}</p>}
          </EditorSection>
          <EditorSection number="03" title={ua ? 'Дизайн' : 'Design'}>
            <label htmlFor="editor-label" className="label">{ua ? 'Напис на виробі' : 'Text on your product'}</label>
            <input id="editor-label" className="input" value={label} onChange={(event) => setLabel(event.target.value)} maxLength={40} />
            <fieldset className="mt-5">
              <legend className="label">{ua ? 'Форма макета' : 'Artwork shape'}</legend>
              <div className="grid gap-2 min-[360px]:grid-cols-3">
                {SHAPES.map((option) => <button key={option} type="button" aria-pressed={shape === option} onClick={() => setShape(option)} className={`min-h-11 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${shape === option ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-navy/40'}`}>{t(`shapes.${option}`)}</button>)}
              </div>
            </fieldset>
            <fieldset className="mt-5">
              <legend className="label">{t('templateSection')}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['standard', 'individual'] as TemplateKind[]).map((option) => <button key={option} type="button" aria-pressed={template === option} onClick={() => setTemplate(option)} className={`min-h-11 rounded-xl border-2 p-4 text-left font-semibold transition ${template === option ? 'border-navy bg-navy/5 text-navy' : 'border-slate-200 bg-white text-slate-600 hover:border-navy/30'}`}>{option === 'standard' ? t('templateStandard') : t('templateIndividual')}</button>)}
              </div>
            </fieldset>
            {template === 'individual' && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COLOR_KEYS.map((key) => <label key={key} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                <span className="mb-2 block break-words text-xs font-semibold">{t(`colors.${key}`)}</span>
                <input type="color" value={colors[key]} onChange={(event) => setColor(key, event.target.value)} className="h-11 w-full cursor-pointer rounded border border-slate-300 bg-white" />
              </label>)}
            </div>}
          </EditorSection>
          <EditorSection number="04" title={ua ? 'Фізичний формат' : 'Physical format'}>
            <fieldset>
              <legend className="sr-only">{ua ? 'Оберіть формат виробу' : 'Choose a product format'}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PHYSICAL_PRODUCTS.map((product) => <label key={product.key} className={`relative flex min-h-16 items-start gap-3 rounded-xl border-2 p-3 ${!product.available ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400' : productType === product.key ? 'cursor-pointer border-navy bg-navy/5 text-navy' : 'cursor-pointer border-slate-200 text-slate-600 hover:border-navy/40'}`}>
                  <input type="radio" name="productType" value={product.key} checked={productType === product.key} disabled={!product.available} onChange={() => setProductType(product.key)} className="mt-1 h-4 w-4 shrink-0 accent-[#1d3557]" />
                  <span className="min-w-0"><span className="block text-sm font-bold">{localized(product.title, locale)}</span><span className="mt-1 block text-xs leading-5">{product.available ? localized(product.description, locale) : ua ? 'Згодом' : 'Coming later'}</span></span>
                </label>)}
              </div>
            </fieldset>
          </EditorSection>
          <EditorSection number="05" title={ua ? 'Розмір і кількість' : 'Size and quantity'}>
            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset>
                <legend className="label">{ua ? 'Розмір' : 'Size'}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((option) => <button key={option} type="button" aria-pressed={size === option} onClick={() => setSize(option)} className={`min-h-11 rounded-xl border-2 px-3 py-2.5 text-sm font-bold ${size === option ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{option}</button>)}
                </div>
              </fieldset>
              <div><label htmlFor="editor-quantity" className="label">{ua ? 'Кількість' : 'Quantity'}</label><input id="editor-quantity" className="input" type="number" min={1} max={999} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(999, Math.floor(Number(event.target.value)) || 1)))} /></div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{ua ? 'Точні розміри в сантиметрах, матеріал і вартість узгодимо перед виготовленням.' : 'Exact dimensions, materials and price are confirmed before production.'}</p>
          </EditorSection>
        </div>
        <aside className="min-w-0 lg:sticky lg:top-24" aria-label={ua ? 'Попередній перегляд виробу' : 'Product preview'}>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/40 sm:p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-navy">{t('previewSection')}</h2><span className="text-xs font-medium text-slate-500">{ua ? 'Ваш макет' : 'Your artwork'}</span></div>
            <div className="mt-4 flex min-h-[310px] items-center justify-center overflow-hidden rounded-xl bg-[#f0ede8] p-5 sm:min-h-[350px]">
              <StickerDesign type={def.payloadType} value={value} shape={shape} colors={effectiveColors} label={label} subtitle={subtitle} icon={def.icon} visualIcon={goal?.icon ?? 'scan'} width={235} />
            </div>
            <p className="mt-4 text-sm font-bold text-navy">{localized(selectedProduct.title, locale)} · {size} · ×{quantity}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{ua ? 'Макет друкованої частини. Вигляд носія та масштаб можуть відрізнятися.' : 'Printed artwork preview. Product construction and scale may vary.'}</p>
            <div className={`mt-5 rounded-xl border p-3 ${contrastWarning ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`} aria-live="polite">
              <h3 className="flex items-center gap-2 text-sm font-bold text-navy"><Icon name="scan" className="h-4 w-4" />{ua ? 'Контраст QR' : 'QR contrast'}{contrast ? ` · ${contrast.ratio.toFixed(1)}:1` : ''}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{contrastWarning ? ua ? 'Спробуйте темніший код на світлому фоні: такий макет може бути складно відсканувати.' : 'Try a darker code on a light background: this design may be difficult to scan.' : ua ? 'Розрахунок за кольорами екрана. Перед використанням перевірте готовий виріб камерою телефона.' : 'Calculated from screen colors. Test the finished product with a phone camera before use.'}</p>
            </div>
            {!isPayloadValid && <p className="mt-4 text-center text-sm leading-6 text-slate-500">{def.payloadType === 'privat24' ? ua ? 'Замовлення цього варіанта ще недоступне.' : 'This option cannot be ordered yet.' : t('fillHint')}</p>}
            <button type="button" onClick={handleAdd} disabled={!isPayloadValid} className="btn-accent mt-5 w-full py-3 disabled:cursor-not-allowed disabled:opacity-50">{t('addToOrder')}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditorSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-navy"><span className="text-xs font-bold tracking-wider text-accent">{number}</span>{title}</h2>{children}</section>;
}
