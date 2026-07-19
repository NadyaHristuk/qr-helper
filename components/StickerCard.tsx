import { Link } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { getSticker } from '@/lib/stickers/catalog';

/** Кликабельная карточка вида наклейки на главной: ведёт в редактор,
 *  слева — реальное превью макета, справа — подпись. */
export function StickerCard({
  stickerKey,
  title,
  caption,
  label,
}: {
  stickerKey: string;
  title: string;
  caption: string;
  label: string;
}) {
  const def = getSticker(stickerKey);
  if (!def) return null;

  return (
    <li>
      <Link
        href={`/stickers/${stickerKey}`}
        className="flex h-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-navy hover:shadow-md"
      >
        <div className="shrink-0">
          <StickerDesign
            type={def.payloadType}
            value={def.demo}
            shape={def.defaultShape}
            colors={{ text: '#d62828', frame: '#1d3557', bg: '#ffffff', icon: '#1d3557', qr: '#101828' }}
            label={label}
            icon={def.icon}
            width={92}
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-navy">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-600">{caption}</p>
        </div>
      </Link>
    </li>
  );
}
