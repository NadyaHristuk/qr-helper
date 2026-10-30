import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CATALOG, getSticker } from '@/lib/stickers/catalog';
import { routing } from '@/i18n/routing';
import { StickerEditor } from '@/components/StickerEditor';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CATALOG.map((s) => ({ locale, type: s.key })),
  );
}

export default async function StickerEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; type: string }>;
  searchParams: Promise<{ goal?: string | string[]; productType?: string | string[] }>;
}) {
  const [{ locale, type }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  if (!getSticker(type)) notFound();
  return <StickerEditor stickerKey={type} initialGoal={typeof query.goal === 'string' ? query.goal : undefined} initialProductType={typeof query.productType === 'string' ? query.productType : undefined} />;
}
