/**
 * Сборка payload-строк для QR-кодов всех видов наклеек (docs/spec.md).
 *
 * Каждая наклейка — это просто свой формат содержимого QR:
 * URL, tel:, mailto:, sms:, WIFI:, vCard 3.0 или произвольный текст.
 */

/** Все виды наклеек из спецификации. */
export const STICKER_TYPES = [
  'facebook',
  'instagram',
  'telegram',
  'google',
  'vcard',
  'email',
  'sms',
  'wifi',
  'site',
  'olx',
  'youtube',
  'privat24',
  'carPhone',
  'promo',
] as const;

export type StickerType = (typeof STICKER_TYPES)[number];

/** Wi-Fi: имя сети + пароль (пустой пароль = открытая сеть). */
export interface WifiValue {
  ssid: string;
  password?: string;
  /** По умолчанию WPA; nopass — открытая сеть. */
  security?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

/** Визитка (vCard 3.0). Обязательно только имя. */
export interface VCardValue {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  site?: string;
  notes?: string;
}

/** Отзыв на email: адрес + необязательная тема письма. */
export interface EmailValue {
  email: string;
  subject?: string;
}

/** SMS: номер + необязательный текст сообщения. */
export interface SmsValue {
  phone: string;
  message?: string;
}

export type StickerValue = string | WifiValue | VCardValue | EmailValue | SmsValue;

/** Ошибка сборки payload (неверная форма значения) — маппится на HTTP 400. */
export class PayloadError extends Error {}

/* ------------------------------------------------------------------ */
/* Хелперы                                                             */
/* ------------------------------------------------------------------ */

/** Виды наклеек, значение которых — просто ссылка. */
const URL_TYPES: ReadonlySet<StickerType> = new Set([
  'facebook',
  'instagram',
  'telegram',
  'google',
  'site',
  'olx',
  'youtube',
]);

function expectString(value: StickerValue, type: StickerType): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new PayloadError(`Для наклейки «${type}» ожидается непустая строка`);
  }
  return value.trim();
}

/** Добавляет https://, если схема не указана. */
export function normalizeUrl(raw: string): string {
  const url = raw.trim();
  // уже есть схема вида "https:", "tel:", "viber:" и т.п.
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  return `https://${url}`;
}

/** Убирает из номера всё, кроме цифр и ведущего «+». */
function normalizePhone(raw: string): string {
  const phone = raw.trim().replace(/(?!^\+)[^\d]/g, '');
  if (!/^\+?\d{3,15}$/.test(phone)) {
    throw new PayloadError(`Неверный номер телефона: «${raw}»`);
  }
  return phone;
}

/** Экранирование спецсимволов в WIFI:-формате: \ ; , : " */
function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1');
}

/** Экранирование текстовых значений vCard 3.0: \ ; , и переводы строк. */
function escapeVCard(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/([,;])/g, '\\$1')
    .replace(/\r?\n/g, '\\n');
}

/* ------------------------------------------------------------------ */
/* Сборщики форматов                                                   */
/* ------------------------------------------------------------------ */

function buildMailto(value: StickerValue): string {
  let email: string;
  let subject: string | undefined;
  if (typeof value === 'string') {
    email = value.trim();
  } else if ('email' in value && typeof value.email === 'string') {
    email = value.email.trim();
    subject = 'subject' in value && typeof value.subject === 'string' ? value.subject : undefined;
  } else {
    throw new PayloadError('Для наклейки «email» ожидается адрес (и необязательная тема)');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PayloadError(`Неверный email: «${email}»`);
  }
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

function buildSms(value: StickerValue): string {
  let phone: string;
  let message: string | undefined;
  if (typeof value === 'string') {
    phone = value;
  } else if ('phone' in value && typeof value.phone === 'string') {
    phone = value.phone;
    message = 'message' in value && typeof value.message === 'string' ? value.message : undefined;
  } else {
    throw new PayloadError('Для наклейки «sms» ожидается номер (и необязательный текст)');
  }
  const normalized = normalizePhone(phone);
  return message ? `sms:${normalized}?body=${encodeURIComponent(message)}` : `sms:${normalized}`;
}

function buildWifi(value: StickerValue): string {
  if (typeof value === 'string' || !('ssid' in value) || typeof value.ssid !== 'string' || value.ssid.trim() === '') {
    throw new PayloadError('Для наклейки «wifi» ожидается { ssid, password }');
  }
  const password = 'password' in value && typeof value.password === 'string' ? value.password : '';
  const security = value.security ?? (password ? 'WPA' : 'nopass');
  const parts = [`WIFI:T:${security}`, `S:${escapeWifi(value.ssid.trim())}`];
  if (security !== 'nopass') parts.push(`P:${escapeWifi(password)}`);
  if (value.hidden) parts.push('H:true');
  return `${parts.join(';')};;`;
}

function buildVCard(value: StickerValue): string {
  if (typeof value === 'string' || !('name' in value) || typeof value.name !== 'string' || value.name.trim() === '') {
    throw new PayloadError('Для наклейки «vcard» обязательно поле name');
  }
  const v = value as VCardValue;
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escapeVCard(v.name.trim())};;;;`, `FN:${escapeVCard(v.name.trim())}`];
  if (v.company) lines.push(`ORG:${escapeVCard(v.company)}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(v.phone.trim())}`);
  if (v.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(v.email.trim())}`);
  if (v.address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(v.address)};;;;`);
  if (v.site) lines.push(`URL:${escapeVCard(normalizeUrl(v.site))}`);
  if (v.notes) lines.push(`NOTE:${escapeVCard(v.notes)}`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Приват24: в форме заказа — номер карты, но может быть и платёжная ссылка.
 * Номер карты кодируем как есть (текстом), всё остальное — как URL.
 */
function buildPrivat24(value: StickerValue): string {
  const raw = expectString(value, 'privat24');
  const digits = raw.replace(/[\s-]/g, '');
  if (/^\d{16}$/.test(digits)) return digits;
  return normalizeUrl(raw);
}

/* ------------------------------------------------------------------ */
/* Публичное API                                                       */
/* ------------------------------------------------------------------ */

/**
 * Собирает строку-payload для QR-кода наклейки.
 * @throws PayloadError если значение не подходит по форме.
 */
export function buildPayload(type: StickerType, value: StickerValue): string {
  if (URL_TYPES.has(type)) return normalizeUrl(expectString(value, type));

  switch (type) {
    case 'carPhone':
      return `tel:${normalizePhone(expectString(value, type))}`;
    case 'email':
      return buildMailto(value);
    case 'sms':
      return buildSms(value);
    case 'wifi':
      return buildWifi(value);
    case 'vcard':
      return buildVCard(value);
    case 'privat24':
      return buildPrivat24(value);
    case 'promo':
      // Промокод — просто текст как есть.
      return expectString(value, type);
    default:
      throw new PayloadError(`Неизвестный тип наклейки: «${type}»`);
  }
}
