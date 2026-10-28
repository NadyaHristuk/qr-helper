import { Link } from '@/i18n/navigation';
import { StickerDesign } from './StickerDesign';
import { getSticker } from '@/lib/stickers/catalog';

export function StickerCard({
  stickerKey,
  title,
  caption,
  label,
  featured = false,
}: {
  stickerKey: string;
  title: string;
  caption: string;
  label: string;
  featured?: boolean;
}) {
  const def = getSticker(stickerKey);
  if (!def) return null;

  if (featured) {
    return (
      <Link
        href={`/stickers/${stickerKey}`}
        className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-lg"
      >
        <StickerDesign
          type={def.payloadType}
          value={def.demo}
          shape={def.defaultShape}
          colors={{ text: '#d62828', frame: '#1d3557', bg: '#ffffff', icon: '#1d3557', qr: '#101828' }}
          label={label}
          icon={def.icon}
          width={190}
        />
        <div className="mt-4">
          <h3 className="font-bold text-navy">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{caption}</p>
        </div>
      </Link>
    );
  }

  return (
    <li>
      <Link
        href={`/stickers/${stickerKey}`}
        className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-navy/40 hover:shadow-lg sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="flex shrink-0 justify-center rounded-xl bg-slate-50 p-3 sm:block sm:bg-transparent sm:p-0">
          <StickerDesign
            type={def.payloadType}
            value={def.demo}
            shape={def.defaultShape}
            colors={{ text: '#d62828', frame: '#1d3557', bg: '#ffffff', icon: '#1d3557', qr: '#101828' }}
            label={label}
            icon={def.icon}
            width={96}
          />
        </div>
        <div className="mt-4 min-w-0 sm:mt-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-navy">{title}</h3>
            <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-accent">→</span>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{caption}</p>
        </div>
      </Link>
    </li>
  );
}
