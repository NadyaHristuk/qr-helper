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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm font-medium text-navy hover:text-accent">
        {t('backToStickers')}
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold text-navy sm:text-3xl">
        {th(`stickers.${stickerKey}.title`)}
      </h1>
      <p className="mt-1 text-slate-600">{th(`stickers.${stickerKey}.caption`)}</p>

      {added && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-700">✓ {t('added')}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="btn-accent" onClick={() => router.push('/order')}>
              {t('goToOrder')}
            </button>
            <Link href="/" className="btn-outline">
              {t('addAnother')}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <section>
            <h2 className="section-title mb-3">{t('dataSection')}</h2>
            <div className="space-y-3">
              {def.fields.map((f) => (
                <div key={f.name}>
                  <label className="label">{t(`fields.${f.name}`)}</label>
                  <input
                    className="input"
                    type={f.kind === 'password' ? 'text' : f.kind === 'url' ? 'url' : f.kind === 'email' ? 'email' : f.kind === 'tel' ? 'tel' : 'text'}
                    value={data[f.name] ?? ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <label className="label">{t('labelField')}</label>
            <input
              className="input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
            />
          </section>

          <section>
            <h2 className="section-title mb-3">{t('shapeSection')}</h2>
            <div className="flex flex-wrap gap-2">
              {SHAPES.map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => setShape(sh)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                    shape === sh
                      ? 'border-navy bg-navy/5 text-navy'
                      : 'border-slate-200 text-slate-600 hover:border-navy/40'
                  }`}
                >
                  {t(`shapes.${sh}`)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="section-title mb-3">{t('templateSection')}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTemplate('standard')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                  template === 'standard' ? 'border-navy bg-navy/5 text-navy' : 'border-slate-200 text-slate-600 hover:border-navy/40'
                }`}
              >
                {t('templateStandard')}
              </button>
              <button
                type="button"
                onClick={() => setTemplate('individual')}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                  template === 'individual' ? 'border-navy bg-navy/5 text-navy' : 'border-slate-200 text-slate-600 hover:border-navy/40'
                }`}
              >
                {t('templateIndividual')}
              </button>
            </div>

            {template === 'individual' && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COLOR_KEYS.map((k) => (
                  <label key={k} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="color"
                      value={colors[k]}
                      onChange={(e) => setColor(k, e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-slate-300"
                    />
                    {t(`colors.${k}`)}
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <div>
          <h2 className="section-title mb-3">{t('previewSection')}</h2>
          <div className="sticky top-24 flex flex-col items-center rounded-2xl bg-slate-50 p-6">
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
            {!isPayloadValid && (
              <p className="mt-4 text-center text-sm text-slate-500">
                {t('fillHint')}
              </p>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!isPayloadValid}
              className="btn-accent mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('addToOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
