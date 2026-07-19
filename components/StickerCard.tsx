import { QrPreview } from './QrPreview';
import type { StickerType, StickerValue } from '@/lib/qr/payloads';

/** Карточка вида наклейки на главной: слева QR-превью, справа подпись. */
export function StickerCard({
  title,
  caption,
  demoType,
  demoValue,
}: {
  title: string;
  caption: string;
  demoType: StickerType;
  demoValue: StickerValue;
}) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-navy/40 hover:shadow-md">
      <div className="shrink-0">
        <div className="rounded-lg border-2 border-accent/70 p-1.5">
          <QrPreview type={demoType} value={demoValue} size={84} />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-navy">{title}</h3>
        <p className="mt-0.5 text-sm text-slate-600">{caption}</p>
      </div>
    </li>
  );
}
