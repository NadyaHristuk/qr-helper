import type { StickerType, StickerValue } from '@/lib/qr/payloads';

/** Форма наклейки (раздел 5 спецификации). */
export type StickerShape = 'rect' | 'circle' | 'phone';

/** Режим шаблона (раздел 6): стандартный или индивидуальный (+100 грн). */
export type TemplateKind = 'standard' | 'individual';

/** Цвета элементов наклейки (конструктор индивидуального шаблона). */
export interface DesignColors {
  text: string;
  frame: string;
  bg: string;
  icon: string;
  qr: string;
}

/** Дефолтные цвета из примечаний к шаблону (аркуш 11): фон белый, текст
 *  красный, рамка/значок синие, код чёрный. */
export const DEFAULT_COLORS: DesignColors = {
  text: '#d62828',
  frame: '#1d3557',
  bg: '#ffffff',
  icon: '#1d3557',
  qr: '#101828',
};

export interface FieldDef {
  /** Имя поля и одновременно ключ в editor.fields.* для подписи. */
  name: string;
  kind: 'text' | 'url' | 'tel' | 'email' | 'password';
}

type Data = Record<string, string>;

export interface StickerDef {
  /** Ключ маршрута: /stickers/<key> и ключ в home.stickers.<key>. */
  key: string;
  /** Тип payload для QR (см. lib/qr/payloads). */
  payloadType: StickerType;
  /** Эмодзи-значок для макета. */
  icon: string;
  defaultShape: StickerShape;
  /** Поля, которые заполняет пользователь в редакторе. */
  fields: FieldDef[];
  /** Собирает значение payload из данных формы. */
  buildValue: (d: Data) => StickerValue;
  /** Подпись под QR на макете (номер, имя и т.п.), если нужна. */
  subtitle?: (d: Data) => string;
  /** Демо-значение для превью на главной. */
  demo: StickerValue;
}

const s = (d: Data, k: string) => (d[k] ?? '').trim();

export const CATALOG: StickerDef[] = [
  {
    key: 'socials',
    payloadType: 'facebook',
    icon: '🔗',
    defaultShape: 'rect',
    fields: [{ name: 'value', kind: 'url' }],
    buildValue: (d) => s(d, 'value'),
    demo: 'https://facebook.com/qr.pomichnyk',
  },
  {
    key: 'wifi',
    payloadType: 'wifi',
    icon: '📶',
    defaultShape: 'rect',
    fields: [
      { name: 'ssid', kind: 'text' },
      { name: 'password', kind: 'text' },
    ],
    buildValue: (d) => ({ ssid: s(d, 'ssid'), password: s(d, 'password') }),
    subtitle: (d) => s(d, 'ssid'),
    demo: { ssid: 'Cafe_Guest', password: 'welcome2024' },
  },
  {
    key: 'vcard',
    payloadType: 'vcard',
    icon: '👤',
    defaultShape: 'phone',
    fields: [
      { name: 'name', kind: 'text' },
      { name: 'phone', kind: 'tel' },
      { name: 'email', kind: 'email' },
      { name: 'site', kind: 'url' },
    ],
    buildValue: (d) => ({
      name: s(d, 'name'),
      phone: s(d, 'phone'),
      email: s(d, 'email'),
      site: s(d, 'site'),
    }),
    subtitle: (d) => s(d, 'name'),
    demo: { name: 'QR Помічник', phone: '+380501234567', email: 'hello@zaklad.ua' },
  },
  {
    key: 'email',
    payloadType: 'email',
    icon: '✉️',
    defaultShape: 'rect',
    fields: [
      { name: 'email', kind: 'email' },
      { name: 'subject', kind: 'text' },
    ],
    buildValue: (d) => ({ email: s(d, 'email'), subject: s(d, 'subject') }),
    subtitle: (d) => s(d, 'email'),
    demo: { email: 'hello@zaklad.ua', subject: 'Відгук' },
  },
  {
    key: 'sms',
    payloadType: 'sms',
    icon: '💬',
    defaultShape: 'rect',
    fields: [
      { name: 'phone', kind: 'tel' },
      { name: 'message', kind: 'text' },
    ],
    buildValue: (d) => ({ phone: s(d, 'phone'), message: s(d, 'message') }),
    subtitle: (d) => s(d, 'phone'),
    demo: { phone: '+380501234567', message: 'Відгук:' },
  },
  {
    key: 'google',
    payloadType: 'google',
    icon: '⭐',
    defaultShape: 'circle',
    fields: [{ name: 'value', kind: 'url' }],
    buildValue: (d) => s(d, 'value'),
    demo: 'https://g.page/vash-zaklad/review',
  },
  {
    key: 'privat24',
    payloadType: 'privat24',
    icon: '💳',
    defaultShape: 'rect',
    fields: [],
    buildValue: () => '',
    demo: '',
  },
  {
    key: 'carPhone',
    payloadType: 'carPhone',
    icon: '📞',
    defaultShape: 'rect',
    fields: [{ name: 'phone', kind: 'tel' }],
    buildValue: (d) => s(d, 'phone'),
    subtitle: (d) => s(d, 'phone'),
    demo: '+380501234567',
  },
  {
    key: 'site',
    payloadType: 'site',
    icon: '🌐',
    defaultShape: 'rect',
    fields: [{ name: 'value', kind: 'url' }],
    buildValue: (d) => s(d, 'value'),
    demo: 'https://vash-sait.ua',
  },
  {
    key: 'youtube',
    payloadType: 'youtube',
    icon: '▶️',
    defaultShape: 'rect',
    fields: [{ name: 'value', kind: 'url' }],
    buildValue: (d) => s(d, 'value'),
    demo: 'https://youtube.com/@vash-kanal',
  },
  {
    key: 'olx',
    payloadType: 'olx',
    icon: '🛒',
    defaultShape: 'rect',
    fields: [{ name: 'value', kind: 'url' }],
    buildValue: (d) => s(d, 'value'),
    demo: 'https://www.olx.ua/list/user/abcd1234/',
  },
  {
    key: 'app',
    payloadType: 'site',
    icon: '📲',
    defaultShape: 'rect',
    fields: [{ name: 'value', kind: 'url' }],
    buildValue: (d) => s(d, 'value'),
    demo: 'https://qr-pomichnyk.ua/app',
  },
];

export const CATALOG_BY_KEY: Record<string, StickerDef> = Object.fromEntries(
  CATALOG.map((d) => [d.key, d]),
);

export function getSticker(key: string): StickerDef | undefined {
  return Object.hasOwn(CATALOG_BY_KEY, key) ? CATALOG_BY_KEY[key] : undefined;
}
