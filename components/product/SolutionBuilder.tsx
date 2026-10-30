'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from './Icon';
import { ProductMockup } from './ProductMockup';
import { PHYSICAL_PRODUCTS, localized, type Solution } from '@/lib/products/solutions';

export function SolutionBuilder({ solution, locale }: { solution: Solution; locale: string }) {
  const ua = locale === 'ua';
  const [variant, setVariant] = useState(solution.variants[0]);
  const [product, setProduct] = useState(solution.suggestedFormat);
  const selected = PHYSICAL_PRODUCTS.find((item) => item.key === product)!;
  return (
    <div className="product-storefront pb-14">
      <div className="border-b border-navy/10 bg-[#f7f5ef]"><div className="product-container py-8 sm:py-12">
        <Link href="/#solutions" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-slate-600"><Icon name="arrowLeft" className="h-4 w-4" />{ua ? 'Усі рішення' : 'All solutions'}</Link>
        <div className="mt-5 flex items-start gap-4"><Icon name={solution.icon} className="mt-1 h-8 w-8 shrink-0 text-navy" /><div className="min-w-0 max-w-2xl"><p className="product-kicker">{ua ? 'Ваше рішення' : 'Your solution'}</p><h1 className="product-section-heading mt-2">{localized(solution.title, locale)}</h1><p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{localized(solution.detail, locale)}</p></div></div>
      </div></div>
      <div className="product-container mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="min-w-0">
          <section aria-labelledby="interaction-heading"><p className="product-kicker">01 / {ua ? 'Дія' : 'Interaction'}</p><h2 id="interaction-heading" className="mt-2 text-xl font-bold text-navy">{ua ? 'Що відкриється після сканування?' : 'What should happen after the scan?'}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{solution.variants.map((item) => <button key={item.key} type="button" className="product-choice" aria-pressed={variant.key === item.key} onClick={() => setVariant(item)}><span className="flex w-full items-center justify-between gap-2 font-semibold"><span>{localized(item.title, locale)}</span>{variant.key === item.key && <Icon name="check" className="h-5 w-5 shrink-0" />}</span><span className="mt-2 text-xs leading-6 text-slate-600">{localized(item.description, locale)}</span></button>)}</div>
          </section>
          <section aria-labelledby="format-heading" className="mt-10"><p className="product-kicker">02 / {ua ? 'Формат' : 'Format'}</p><h2 id="format-heading" className="mt-2 text-xl font-bold text-navy">{ua ? 'Де клієнт побачить запрошення?' : 'Where will your customer see it?'}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{ua ? 'Вибір можна змінити в редакторі.' : 'You can change this in the editor.'}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{PHYSICAL_PRODUCTS.map((item) => <button key={item.key} type="button" aria-pressed={product === item.key} disabled={!item.available} onClick={() => setProduct(item.key)} className="product-choice !p-3"><ProductMockup kind={item.mockup} locale={ua ? 'ua' : 'en'} className="h-auto w-full" /><span className="mt-1 text-sm font-semibold">{localized(item.title, locale)}</span>{!item.available && <span className="mt-1 text-[10px] uppercase tracking-wide">{ua ? 'Згодом' : 'Coming later'}</span>}</button>)}</div>
          </section>
        </div>
        <aside className="min-w-0 rounded-lg bg-navy p-5 text-white lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-white/60">{ua ? 'Ваш вибір' : 'Your selection'}</p>
          <ProductMockup kind={selected.mockup} locale={ua ? 'ua' : 'en'} className="my-2 h-auto w-full" />
          <h2 className="text-xl font-semibold">{localized(solution.title, locale)}</h2><p className="mt-3 text-sm text-white/80">{localized(variant.title, locale)} · {localized(selected.title, locale)}</p>
          <p className="mt-4 text-xs leading-6 text-white/65">{ua ? 'Далі додамо ваші дані, оберемо оформлення, розмір і кількість.' : 'Next, add your content and choose the design, size and quantity.'}</p>
          <Link href={`/stickers/${variant.catalogKey}?goal=${solution.key}&productType=${product}`} className="product-button mt-5 w-full">{ua ? 'Налаштувати виріб' : 'Customize product'}<Icon name="arrow" className="h-4 w-4" /></Link>
          <p className="mt-4 text-xs leading-5 text-white/60">{ua ? 'Демонстраційна ціна — 1 грн за замовлення. Деталі виготовлення узгоджуємо перед підтвердженням.' : 'Demo price: UAH 1 per order. Production details are agreed before confirmation.'}</p>
        </aside>
      </div>
    </div>
  );
}
