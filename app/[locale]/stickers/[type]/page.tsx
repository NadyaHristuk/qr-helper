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
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  setRequestLocale(locale);
  if (!getSticker(type)) notFound();
  return <StickerEditor stickerKey={type} />;
}
