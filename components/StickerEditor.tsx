'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { Icon } from './product/Icon';
import { ProductMockup } from './product/ProductMockup';
import { getSticker, DEFAULT_COLORS, type StickerDef, type DesignColors, type StickerShape, type TemplateKind } from '@/lib/stickers/catalog';
import { addToCart, type ProductType, type StickerSize } from '@/lib/stickers/cart';
import { buildPayload } from '@/lib/qr/payloads';
import { findSolution, solutionForCatalog, PHYSICAL_PRODUCTS, localized } from '@/lib/products/solutions';
import { qrContrast } from '@/lib/products/quality';
import { productMessage } from '@/lib/products/presentation';
import styles from './StickerEditor.module.css';

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
  const previewRef = useRef<HTMLElement>(null);
  const [previewFits, setPreviewFits] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const updateFit = () => setPreviewFits(
      window.matchMedia('(min-width: 1024px)').matches && preview.offsetHeight <= window.innerHeight - 104,
    );
    const observer = new ResizeObserver(updateFit);
    observer.observe(preview);
    window.addEventListener('resize', updateFit);
    updateFit();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateFit);
    };
  }, []);

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
    <div className={`product-editor ${styles.editor}`}>
      <Link href="/#solutions" className={styles.backLink}>
        <Icon name="arrow" className="h-4 w-4 rotate-180" />{ua ? 'Усі рішення' : 'All solutions'}
      </Link>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{ua ? 'Налаштуйте свій виріб' : 'Make it yours'}</p>
        <h1>{goal ? localized(goal.title, locale) : th(`stickers.${stickerKey}.title`)}</h1>
        <p className={styles.description}>{goal ? localized(goal.description, locale) : ua ? 'Цей варіант наразі недоступний для замовлення.' : 'This option is currently unavailable to order.'}</p>
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
      <div className={styles.layout}>
        <aside ref={previewRef} data-preview-fits={previewFits} className={styles.preview} aria-label={ua ? 'Попередній перегляд виробу' : 'Product preview'}>
          <div className={styles.previewHeading}><h2>{t('previewSection')}</h2><span>{ua ? 'Ваш макет' : 'Your artwork'}</span></div>
          <div className={styles.artwork}>
            <StickerDesign type={def.payloadType} value={value} shape={shape} colors={effectiveColors} label={label} subtitle={subtitle} icon={def.icon} visualIcon={goal?.icon ?? 'scan'} width={272} />
          </div>
          <div className={styles.attributes} aria-label={ua ? 'Обрані параметри' : 'Selected options'}>
            <span>{localized(selectedProduct.title, locale)}</span><span>{size}</span><span>×{quantity}</span><span>{template === 'standard' ? t('templateStandard') : t('templateIndividual')}</span>
          </div>
          <p className={styles.previewNote}>{ua ? 'Макет друкованої частини. Вигляд носія та масштаб можуть відрізнятися.' : 'Printed artwork preview. Product construction and scale may vary.'}</p>
          <div className={`${styles.quality} ${contrastWarning ? styles.qualityWarning : ''}`} aria-live="polite">
            <h3><Icon name={contrastWarning ? 'scan' : 'check'} className="h-4 w-4 shrink-0" /><span>{contrastWarning ? ua ? 'Поліпшіть контраст' : 'Improve contrast' : ua ? 'Добрий контраст' : 'Good contrast'}</span>{contrast && <span className={styles.ratio}>{contrast.ratio.toFixed(1)}:1</span>}</h3>
            <p>{contrastWarning ? ua ? 'Спробуйте темніший код на світлому фоні: такий макет може бути складно відсканувати.' : 'Try a darker code on a light background: this design may be difficult to scan.' : ua ? 'Розрахунок за кольорами екрана. Перед використанням перевірте готовий виріб камерою телефона.' : 'Calculated from screen colors. Test the finished product with a phone camera before use.'}</p>
          </div>
          <div className={styles.desktopAction}>
            {!isPayloadValid && <p className={styles.fillHint}>{def.payloadType === 'privat24' ? ua ? 'Замовлення цього варіанта ще недоступне.' : 'This option cannot be ordered yet.' : t('fillHint')}</p>}
            <button type="button" onClick={handleAdd} disabled={!isPayloadValid} className={`btn-accent ${styles.addButton}`}>{t('addToOrder')}<Icon name="arrow" className="h-4 w-4" /></button>
          </div>
        </aside>
        <div className={styles.sections}>
          <EditorSection number="01" title={ua ? 'Дія клієнта' : 'Customer action'}>
            <div className={styles.context}>
              <span className={styles.contextIcon}><Icon name={goal?.icon ?? 'scan'} className="h-6 w-6" /></span>
              <div className="min-w-0">
                <p className="font-bold text-navy">{interaction ? localized(interaction.title, locale) : th(`stickers.${stickerKey}.title`)}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{interaction ? localized(interaction.description, locale) : ua ? 'Оплата стане доступною після підключення платіжного сервісу.' : 'Payments will be available after a payment service is connected.'}</p>
              </div>
            </div>
            <p className={styles.sectionNote}>{ua ? 'Дані записуються у виріб. Якщо вони зміняться, знадобиться новий друк.' : 'The QR contains these details or this link. Changing the encoded content requires a new print.'}</p>
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
            <fieldset className={styles.fieldGroup}>
              <legend className="label">{ua ? 'Форма макета' : 'Artwork shape'}</legend>
              <div className={styles.shapeChoices}>
                {SHAPES.map((option) => <button key={option} type="button" aria-pressed={shape === option} onClick={() => setShape(option)} className={styles.shapeChoice}><ShapeIcon shape={option} /><span>{t(`shapes.${option}`)}</span></button>)}
              </div>
            </fieldset>
            <fieldset className={styles.fieldGroup}>
              <legend className="label">{t('templateSection')}</legend>
              <div className={styles.templateChoices}>
                {(['standard', 'individual'] as TemplateKind[]).map((option) => <button key={option} type="button" aria-pressed={template === option} onClick={() => setTemplate(option)} className={styles.templateChoice}><Icon name={option === 'standard' ? 'check' : 'palette'} className="h-4 w-4 shrink-0" />{option === 'standard' ? t('templateStandard') : t('templateIndividual')}</button>)}
              </div>
            </fieldset>
            {template === 'individual' && <div className={styles.colorChoices}>
              {COLOR_KEYS.map((key) => <label key={key} className={styles.colorChoice}>
                <span className={styles.colorSwatch} style={{ backgroundColor: colors[key] }} />
                <span><span className={styles.colorLabel}>{t(`colors.${key}`)}</span><span className={styles.colorValue}>{colors[key]}</span></span>
                <input type="color" value={colors[key]} onChange={(event) => setColor(key, event.target.value)} />
              </label>)}
            </div>}
          </EditorSection>
          <EditorSection number="04" title={ua ? 'Фізичний формат' : 'Physical format'}>
            <fieldset>
              <legend className="sr-only">{ua ? 'Оберіть формат виробу' : 'Choose a product format'}</legend>
              <div className={styles.productChoices}>
                {PHYSICAL_PRODUCTS.map((product) => <label key={product.key} className={styles.productChoice} data-selected={productType === product.key} data-unavailable={!product.available}>
                  <input type="radio" name="productType" value={product.key} checked={productType === product.key} disabled={!product.available} onChange={() => setProductType(product.key)} />
                  <span className={styles.productImage}><ProductMockup kind={product.mockup} locale={ua ? 'ua' : 'en'} /></span>
                  <span className={styles.productName}>{localized(product.title, locale)}</span>
                  <span className={styles.productDescription}>{product.available ? localized(product.description, locale) : ua ? 'Згодом' : 'Coming later'}</span>
                  {productType === product.key && <span className={styles.productCheck}><Icon name="check" className="h-3 w-3" /></span>}
                </label>)}
              </div>
            </fieldset>
          </EditorSection>
          <EditorSection number="05" title={ua ? 'Розмір і кількість' : 'Size and quantity'}>
            <div className={styles.sizeQuantity}>
              <fieldset>
                <legend className="label">{ua ? 'Розмір' : 'Size'}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((option) => <button key={option} type="button" aria-pressed={size === option} onClick={() => setSize(option)} className={styles.sizeChoice}>{option}</button>)}
                </div>
              </fieldset>
              <div><label htmlFor="editor-quantity" className="label">{ua ? 'Кількість' : 'Quantity'}</label><input id="editor-quantity" className="input" type="number" min={1} max={999} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(999, Math.floor(Number(event.target.value)) || 1)))} /></div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{ua ? 'Точні розміри в сантиметрах, матеріал і вартість узгодимо перед виготовленням.' : 'Exact dimensions, materials and price are confirmed before production.'}</p>
          </EditorSection>
        </div>
        <div className={styles.mobileAction}>
          {!isPayloadValid && <p className={styles.fillHint}>{def.payloadType === 'privat24' ? ua ? 'Замовлення цього варіанта ще недоступне.' : 'This option cannot be ordered yet.' : t('fillHint')}</p>}
          <button type="button" onClick={handleAdd} disabled={!isPayloadValid} className={`btn-accent ${styles.addButton}`}>{t('addToOrder')}<Icon name="arrow" className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

function EditorSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className={styles.section}><h2 className={styles.sectionHeading}><span>{number}</span>{title}</h2>{children}</section>;
}

function ShapeIcon({ shape }: { shape: StickerShape }) {
  return <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
    {shape === 'circle' ? <circle cx="14" cy="14" r="10" /> : shape === 'phone' ? <><rect x="7" y="2" width="14" height="24" rx="3" /><path d="M11 5h6m-4 18h2" /></> : <rect x="5" y="2" width="18" height="24" rx="2" />}
  </svg>;
}
