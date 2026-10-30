import type { StickerType, StickerValue } from '@/lib/qr/payloads';

/** Human-readable checkout summary. Credentials and message bodies stay out. */
export function destinationSummary(type: StickerType, value: StickerValue, locale: string): string {
  const ua = locale === 'ua';
  const fallback = ua ? 'Збережені дані' : 'Saved details';
  const short = (text: unknown): string => typeof text !== 'string' ? fallback : text.length > 100 ? `${text.slice(0, 97)}…` : text;
  if (type === 'wifi') {
    return typeof value === 'object' && value && 'ssid' in value
      ? `${ua ? 'Мережа' : 'Network'}: ${short(value.ssid)}`
      : ua ? 'Мережа Wi-Fi' : 'Wi-Fi network';
  }
  if (type === 'vcard') {
    return typeof value === 'object' && value && 'name' in value
      ? `${ua ? 'Контакт' : 'Contact'}: ${short(value.name)}`
      : ua ? 'Контакт' : 'Contact';
  }
  if (type === 'email') {
    return typeof value === 'string' ? short(value) : value && typeof value === 'object' && 'email' in value ? short(value.email ?? '') : fallback;
  }
  if (type === 'sms') {
    return typeof value === 'string' ? short(value) : value && typeof value === 'object' && 'phone' in value ? short(value.phone ?? '') : fallback;
  }
  if (type === 'carPhone') return typeof value === 'string' ? short(value) : fallback;
  if (typeof value !== 'string' || type === 'privat24') return fallback;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return fallback;
    return short(`${url.hostname}${url.pathname === '/' ? '' : url.pathname}`);
  } catch {
    return fallback;
  }
}
