'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { getSticker, DEFAULT_COLORS, type DesignColors, type StickerShape, type TemplateKind } from '@/lib/stickers/catalog';
import { addToCart } from '@/lib/stickers/cart';
import { buildPayload } from '@/lib/qr/payloads';

const SHAPES: StickerShape[] = ['rect', 'circle', 'phone'];
const COLOR_KEYS: (keyof DesignColors)[] = ['text', 'frame', 'bg', 'icon', 'qr'];

export function StickerEditor({ stickerKey }: { stickerKey: string }) {
  const def = getSticker(stickerKey)!;
  const t = useTranslations('editor');
  const th = useTranslations('home');
  const router = useRouter();

  const [data, setData] = useState<Record<string, string>>({});
  const [label, setLabel] = useState<string>(th(`stickers.${stickerKey}.label`));
  const [shape, setShape] = useState<StickerShape>(def.defaultShape);
  const [template, setTemplate] = useState<TemplateKind>('standard');
  const [colors, setColors] = useState<DesignColors>(DEFAULT_COLORS);
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

  const setField = (name: string, v: string) =>
    setData((d) => ({ ...d, [name]: v }));
  const setColor = (k: keyof DesignColors, v: string) =>
    setColors((c) => ({ ...c, [k]: v }));

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
    });
    setAdded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-accent">
        {t('backToStickers')}
      </Link>

      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-navy sm:text-4xl">
          {th(`stickers.${stickerKey}.title`)}
        </h1>
        <p className="mt-2 text-base leading-7 text-slate-600">
          {th(`stickers.${stickerKey}.caption`)}
        </p>
      </div>

      {added && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-green-700">✓ {t('added')}</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-accent" onClick={() => router.push('/order')}>
              {t('goToOrder')}
            </button>
            <Link href="/" className="btn-outline">
              {t('addAnother')}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-5">
          <EditorSection title={t('dataSection')}>
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
            <input
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
            />
          </EditorSection>

          <EditorSection title={t('shapeSection')}>
            <div className="grid gap-2 sm:grid-cols-3">
              {SHAPES.map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => setShape(sh)}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    shape === sh
                      ? 'border-navy bg-navy text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-navy/40 hover:text-navy'
                  }`}
                >
                  {t(`shapes.${sh}`)}
                </button>
              ))}
            </div>
          </EditorSection>

          <EditorSection title={t('templateSection')}>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTemplate('standard')}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  template === 'standard'
                    ? 'border-navy bg-navy/5'
                    : 'border-slate-200 bg-white hover:border-navy/30'
                }`}
              >
                <span className="block font-bold text-navy">{t('templateStandard')}</span>
              </button>
              <button
                type="button"
                onClick={() => setTemplate('individual')}
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  template === 'individual'
                    ? 'border-navy bg-navy/5'
                    : 'border-slate-200 bg-white hover:border-navy/30'
                }`}
              >
                <span className="block font-bold text-navy">{t('templateIndividual')}</span>
              </button>
            </div>

            {template === 'individual' && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {COLOR_KEYS.map((k) => (
                  <label key={k} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    <span className="mb-2 block text-xs font-semibold text-slate-500">{t(`colors.${k}`)}</span>
                    <input
                      type="color"
                      value={colors[k]}
                      onChange={(e) => setColor(k, e.target.value)}
                      className="h-10 w-full cursor-pointer rounded border border-slate-300 bg-white"
                    />
                  </label>
                ))}
              </div>
            )}
          </EditorSection>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="section-title">{t('previewSection')}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPayloadValid ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {isPayloadValid ? 'QR ✓' : 'QR …'}
              </span>
            </div>

            <div className="flex min-h-[390px] items-center justify-center rounded-2xl bg-slate-50 p-4">
              <StickerDesign
                type={def.payloadType}
                value={value}
                shape={shape}
                colors={effectiveColors}
                label={label}
                subtitle={subtitle}
                icon={def.icon}
                width={260}
              />
            </div>

            {!isPayloadValid && (
              <p className="mt-4 text-center text-sm leading-6 text-slate-500">
                {t('fillHint')}
              </p>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!isPayloadValid}
              className="btn-accent mt-5 w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('addToOrder')}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="section-title mb-4">{title}</h2>
      {children}
    </section>
  );
}
