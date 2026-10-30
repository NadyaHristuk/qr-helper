import type { ProductType } from '@/lib/stickers/cart';
import type { IconName } from '@/components/product/Icon';

export type Localized = { ua: string; en: string };
export type SolutionVariant = { key: string; catalogKey: string; title: Localized; description: Localized };
export type Solution = {
  key: string;
  icon: IconName;
  title: Localized;
  description: Localized;
  detail: Localized;
  variants: SolutionVariant[];
  suggestedFormat: ProductType;
};

export function localized(value: Localized, locale: string): string {
  return locale === 'ua' ? value.ua : value.en;
}

export const SOLUTIONS: Solution[] = [
  {
    key: 'reviews', icon: 'reviews',
    title: { ua: 'Отримувати відгуки', en: 'Turn visits into reviews' },
    description: { ua: 'Запросіть залишити відгук, поки враження ще свіжі.', en: 'Invite feedback while the experience is still fresh.' },
    detail: { ua: 'На столику, біля каси чи на рецепції — зробіть наступний крок зрозумілим для гостя.', en: 'At the table, counter or reception desk, make the next step easy for your customer.' },
    suggestedFormat: 'stand',
    variants: [
      { key: 'google', catalogKey: 'google', title: { ua: 'Відгук у Google', en: 'Google review' }, description: { ua: 'Посилання на відгуки вашого закладу.', en: 'Link to your business’s Google review page.' } },
      { key: 'email', catalogKey: 'email', title: { ua: 'Відгук на пошту', en: 'Private email feedback' }, description: { ua: 'Відкрити лист із вашою адресою та темою.', en: 'Open an email addressed to your team.' } },
      { key: 'sms', catalogKey: 'sms', title: { ua: 'Зворотний зв’язок SMS', en: 'Feedback by text' }, description: { ua: 'Підготувати SMS на ваш номер.', en: 'Prepare a text message to your number.' } },
    ],
  },
  {
    key: 'wifi', icon: 'wifi',
    title: { ua: 'Підключати до Wi-Fi', en: 'Welcome guests to Wi-Fi' },
    description: { ua: 'Пароль на видному місці. Менше запитань до команди.', en: 'Put connection details within reach, without the back-and-forth.' },
    detail: { ua: 'Для столиків, номерів і зони очікування. Вкажіть назву гостьової мережі та пароль.', en: 'For tables, guest rooms and waiting areas. Add your guest network name and password.' },
    suggestedFormat: 'sticker',
    variants: [{ key: 'wifi', catalogKey: 'wifi', title: { ua: 'Гостьова мережа', en: 'Guest network' }, description: { ua: 'QR містить дані для підключення до мережі.', en: 'A QR code containing the network connection details.' } }],
  },
  {
    key: 'menu', icon: 'menu',
    title: { ua: 'Показувати меню чи прайс', en: 'Put your menu on the table' },
    description: { ua: 'Актуальне меню або перелік послуг — у телефоні клієнта.', en: 'Make your menu or service list easy to open on a phone.' },
    detail: { ua: 'Додайте посилання на вже опубліковане меню, прайс або PDF. Завантаження файлів тут не потрібне.', en: 'Use a link to your published menu, price list or PDF. This flow does not upload or host files.' },
    suggestedFormat: 'stand',
    variants: [{ key: 'menu', catalogKey: 'site', title: { ua: 'Онлайн-меню або прайс', en: 'Published menu or price list' }, description: { ua: 'Перехід за вашим готовим посиланням.', en: 'Open the menu at your existing link.' } }],
  },
  {
    key: 'contacts', icon: 'contacts',
    title: { ua: 'Ділитися контактами', en: 'Stay in their contacts' },
    description: { ua: 'Нехай ваш номер і контакти залишаться під рукою.', en: 'Help customers keep your details for their next visit.' },
    detail: { ua: 'Візитка після консультації або контакти біля входу — оберіть потрібну дію.', en: 'A card after a consultation or contact details by the door. Choose the action that fits.' },
    suggestedFormat: 'business_card',
    variants: [
      { key: 'vcard', catalogKey: 'vcard', title: { ua: 'Зберегти контакт', en: 'Save contact details' }, description: { ua: 'Ім’я, номер, пошта та сайт у контактній картці.', en: 'Name, phone, email and website in a contact card.' } },
      { key: 'phone', catalogKey: 'carPhone', title: { ua: 'Зателефонувати', en: 'Make a call' }, description: { ua: 'Відкрити ваш номер у телефоні.', en: 'Open your number in the phone’s dialler.' } },
      { key: 'email', catalogKey: 'email', title: { ua: 'Написати лист', en: 'Send an email' }, description: { ua: 'Підготувати лист вашій команді.', en: 'Prepare an email to your team.' } },
      { key: 'sms', catalogKey: 'sms', title: { ua: 'Написати SMS', en: 'Send a text' }, description: { ua: 'Відкрити повідомлення на ваш номер.', en: 'Open a text message to your number.' } },
    ],
  },
  {
    key: 'social', icon: 'social',
    title: { ua: 'Запрошувати в соцмережі', en: 'Keep the conversation going' },
    description: { ua: 'Від знайомства у закладі — до вашого профілю.', en: 'Connect an in-person visit with your social profile.' },
    detail: { ua: 'Додайте посилання на сторінку вашого бізнесу. Соцмережа відкриється у браузері або застосунку гостя.', en: 'Add your business profile link. It opens in the guest’s browser or social app.' },
    suggestedFormat: 'transparent',
    variants: [
      { key: 'socials', catalogKey: 'socials', title: { ua: 'Instagram, Facebook та інші', en: 'Instagram, Facebook and more' }, description: { ua: 'Будь-яке HTTPS-посилання на ваш профіль.', en: 'Your profile’s HTTPS link.' } },
      { key: 'youtube', catalogKey: 'youtube', title: { ua: 'YouTube', en: 'YouTube' }, description: { ua: 'Канал або відео про ваш бізнес.', en: 'A channel or video about your business.' } },
    ],
  },
  {
    key: 'location', icon: 'location',
    title: { ua: 'Допомогти знайти вас', en: 'Make your place easy to find' },
    description: { ua: 'Адреса та маршрут для наступного візиту.', en: 'Share your location for the next visit.' },
    detail: { ua: 'Вставте готове посилання на вашу адресу в Google Maps або іншому картографічному сервісі.', en: 'Paste your existing location link from Google Maps or another map service.' },
    suggestedFormat: 'sign',
    variants: [{ key: 'map', catalogKey: 'site', title: { ua: 'Відкрити карту', en: 'Open a map link' }, description: { ua: 'Посилання на адресу у вашому сервісі карт.', en: 'A location link from your map service.' } }],
  },
  {
    key: 'booking', icon: 'booking',
    title: { ua: 'Запрошувати на запис', en: 'Make the next booking easy' },
    description: { ua: 'Запис на послугу без пошуку потрібної сторінки.', en: 'Take customers straight to your existing booking page.' },
    detail: { ua: 'Використайте посилання вашого сервісу запису. Ми відкриваємо сторінку, а бронювання обробляє ваш сервіс.', en: 'Use your booking service’s link. The QR opens the page; your existing service handles appointments.' },
    suggestedFormat: 'sign',
    variants: [{ key: 'booking', catalogKey: 'site', title: { ua: 'Сторінка запису', en: 'Existing booking page' }, description: { ua: 'Ваше готове посилання для бронювання.', en: 'Your published appointment or reservation link.' } }],
  },
  {
    key: 'documents', icon: 'document',
    title: { ua: 'Давати корисну інформацію', en: 'Put useful information in reach' },
    description: { ua: 'Інструкція, пам’ятка чи документ у потрібний момент.', en: 'Share instructions, guides or documents at the right moment.' },
    detail: { ua: 'Посилання на опублікований документ, інструкцію або відео. Зберігання файлів залишається у вашому сервісі.', en: 'Link to a published document, guide or video. Files stay with your existing hosting service.' },
    suggestedFormat: 'poster',
    variants: [{ key: 'document', catalogKey: 'site', title: { ua: 'Документ або інструкція', en: 'Published document or guide' }, description: { ua: 'HTTPS-посилання на готовий матеріал.', en: 'An HTTPS link to the material you already host.' } }],
  },
  {
    key: 'online', icon: 'globe',
    title: { ua: 'Вести до ваших сторінок', en: 'Connect to your online business' },
    description: { ua: 'Сайт, товари чи застосунок — за одним посиланням.', en: 'Bring your website, listings or app link into your space.' },
    detail: { ua: 'Використайте сторінку, яку вже має ваш бізнес.', en: 'Use a destination your business already has.' },
    suggestedFormat: 'sticker',
    variants: [
      { key: 'site', catalogKey: 'site', title: { ua: 'Сайт', en: 'Website' }, description: { ua: 'Головна сторінка або конкретна пропозиція.', en: 'Your homepage or a specific offer.' } },
      { key: 'olx', catalogKey: 'olx', title: { ua: 'Товари на OLX', en: 'OLX listings' }, description: { ua: 'Ваша сторінка чи оголошення.', en: 'Your shop page or a listing.' } },
      { key: 'app', catalogKey: 'app', title: { ua: 'Посилання на застосунок', en: 'App link' }, description: { ua: 'Готове посилання на застосунок вашого бізнесу.', en: 'A published link to your business’s app.' } },
    ],
  },
];

export type PhysicalProduct = {
  key: ProductType;
  mockup: 'sticker' | 'stand' | 'sign' | 'glass' | 'card' | 'poster' | 'qr_nfc';
  title: Localized;
  description: Localized;
  available: boolean;
};

export const PHYSICAL_PRODUCTS: PhysicalProduct[] = [
  { key: 'sticker', mockup: 'sticker', title: { ua: 'Наліпка', en: 'Sticker' }, description: { ua: 'На стіл, двері або пакування.', en: 'For tables, doors and packaging.' }, available: true },
  { key: 'stand', mockup: 'stand', title: { ua: 'Настільний стенд', en: 'Table stand' }, description: { ua: 'Помітний акцент біля гостя.', en: 'An invitation at the table or counter.' }, available: true },
  { key: 'sign', mockup: 'sign', title: { ua: 'Табличка', en: 'Rigid sign' }, description: { ua: 'Для входу, стіни чи рецепції.', en: 'For entrances, walls and reception.' }, available: true },
  { key: 'transparent', mockup: 'glass', title: { ua: 'Наліпка на скло', en: 'Glass sticker' }, description: { ua: 'Для вітрини або скляних дверей.', en: 'For windows and glass doors.' }, available: true },
  { key: 'business_card', mockup: 'card', title: { ua: 'Картка', en: 'Business card' }, description: { ua: 'Контакти, які можна взяти із собою.', en: 'Useful details to take away.' }, available: true },
  { key: 'poster', mockup: 'poster', title: { ua: 'Постер', en: 'Poster' }, description: { ua: 'Інформація у просторі вашого бізнесу.', en: 'A visible invitation in your space.' }, available: true },
  { key: 'vinyl', mockup: 'sticker', title: { ua: 'Вінілова наліпка', en: 'Vinyl sticker' }, description: { ua: 'Матеріал і нанесення узгодимо перед друком.', en: 'Material and application confirmed before production.' }, available: true },
  { key: 'qr_nfc', mockup: 'qr_nfc', title: { ua: 'QR + NFC', en: 'QR + NFC' }, description: { ua: 'Сканування або дотик. Згодом.', en: 'Scan or tap. Coming later.' }, available: false },
];

export function findSolution(key: string): Solution | undefined {
  return SOLUTIONS.find((solution) => solution.key === key);
}

export function solutionForCatalog(key: string): Solution | undefined {
  const preferred: Record<string, string> = { site: 'online', app: 'online', olx: 'online', email: 'contacts', sms: 'contacts', carPhone: 'contacts' };
  const preferredKey = Object.hasOwn(preferred, key) ? preferred[key] : undefined;
  return SOLUTIONS.find((solution) => solution.key === preferredKey) ?? SOLUTIONS.find((solution) => solution.variants.some((variant) => variant.catalogKey === key));
}
