import { useLocale, useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { StickerCard } from '@/components/StickerCard';
import { CATALOG } from '@/lib/stickers/catalog';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const th = useTranslations('howItWorks');
  const te = useTranslations('editor');
  const locale = useLocale();
  const isUa = locale === 'ua';

  const conceptIdeas = isUa
    ? [
        ['🍽️', 'Меню / прайс', 'QR на меню, каталог, прайс або PDF.'],
        ['📍', 'Адреса / маршрут', 'Відкрити Google Maps або інший маршрут до закладу.'],
        ['💬', 'Месенджери', 'Telegram, WhatsApp, Viber або Messenger одним скануванням.'],
        ['📅', 'Запис / бронювання', 'Перехід на форму запису, календар або CRM.'],
        ['🎁', 'Акція / промокод', 'Знижка, купон, спеціальна пропозиція або промосторінка.'],
        ['📄', 'Інструкція / документ', 'PDF, інструкція, сертифікат, відео або документація.'],
        ['⭐', 'Розширені відгуки', 'Google, Facebook, TripAdvisor або власна форма.'],
        ['🔁', 'Динамічний QR', 'Змінювати посилання після друку без заміни наліпки.'],
      ]
    : [
        ['🍽️', 'Menu / price list', 'QR to a menu, catalog, price list or PDF.'],
        ['📍', 'Location / directions', 'Open Google Maps or another route to the business.'],
        ['💬', 'Messengers', 'Telegram, WhatsApp, Viber or Messenger from one scan.'],
        ['📅', 'Booking / appointments', 'Open a booking form, calendar or CRM.'],
        ['🎁', 'Promo / coupon', 'Discount, coupon, special offer or promo landing page.'],
        ['📄', 'Instruction / document', 'PDF, manual, certificate, video or documentation.'],
        ['⭐', 'Extended reviews', 'Google, Facebook, TripAdvisor or a custom form.'],
        ['🔁', 'Dynamic QR', 'Change the destination after printing without replacing the sticker.'],
      ];

  const productIdeas = isUa
    ? [
        ['🏷️', 'Звичайна наліпка', 'Базовий варіант для приміщення.'],
        ['💧', 'Вінілова / вологостійка', 'Для вулиці, авто, дверей і місць з вологою.'],
        ['🪟', 'Прозора на скло', 'Для вітрин, вікон і скляних дверей.'],
        ['🪧', 'Табличка', 'Жорсткий носій для стіни, дверей або рецепції.'],
        ['🧍', 'Настільний стенд', 'Для каси, бару, столу, салону або ресепшену.'],
        ['🖼️', 'Постер', 'Великий формат для вітрини або точки продажу.'],
        ['💳', 'Візитка з QR', 'Контакти, соцмережі або портфоліо в кишеньковому форматі.'],
        ['📲', 'QR + NFC', 'Сканування камерою або дотиком смартфона.'],
      ]
    : [
        ['🏷️', 'Standard sticker', 'Basic indoor option.'],
        ['💧', 'Vinyl / water-resistant', 'For outdoor use, cars, doors and humid areas.'],
        ['🪟', 'Transparent glass sticker', 'For windows, showcases and glass doors.'],
        ['🪧', 'Rigid sign', 'For walls, doors or reception areas.'],
        ['🧍', 'Table stand', 'For counters, bars, tables, salons or reception desks.'],
        ['🖼️', 'Poster', 'Large format for windows or points of sale.'],
        ['💳', 'QR business card', 'Contacts, social links or portfolio in pocket format.'],
        ['📲', 'QR + NFC', 'Scan with the camera or tap with a smartphone.'],
      ];

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-3 py-10 sm:px-4 sm:py-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-10 md:py-20">
          <div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight text-navy min-[360px]:text-4xl sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 min-[360px]:text-base min-[360px]:leading-7 sm:text-lg">
              {t('intro')}
            </p>
            <div className="mt-6 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap">
              <a href="#kinds" className="btn-accent w-full min-[420px]:w-auto">
                {tc('customize')} →
              </a>
              <Link href="/how-it-works" className="btn-outline w-full min-[420px]:w-auto">
                {th('title')}
              </Link>
            </div>
            <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
              <ValuePoint icon="📶" text={th('step3Items.wifi')} />
              <ValuePoint icon="⭐" text={th('step3Items.google')} />
              <ValuePoint icon="👤" text={th('step3Items.contacts')} />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-3 -top-4 h-24 w-24 rounded-full bg-red-100 blur-2xl sm:-left-6 sm:-top-6 sm:h-28 sm:w-28" />
            <div className="absolute -bottom-6 -right-3 h-28 w-28 rounded-full bg-blue-100 blur-2xl sm:-bottom-10 sm:-right-6 sm:h-32 sm:w-32" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70 sm:p-5">
              <div className="rounded-2xl bg-slate-50 p-3 sm:p-5">
                <StickerCard
                  stickerKey="wifi"
                  title={t('stickers.wifi.title')}
                  caption={t('stickers.wifi.caption')}
                  label={t('stickers.wifi.label')}
                  featured
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-navy min-[360px]:text-3xl">{th('title')}</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-3">
          <Step number="1" title={tc('customize')} text={t('kindsHint')} />
          <Step number="2" title={te('dataSection')} text={te('fillHint')} />
          <Step number="3" title={tc('orderCta')} text={t('ctaHint')} />
        </div>
      </section>

      <section id="kinds" className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black text-navy min-[360px]:text-3xl">{t('kindsTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">{t('kindsHint')}</p>
          </div>
          <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG.map((s) => (
              <StickerCard
                key={s.key}
                stickerKey={s.key}
                title={t(`stickers.${s.key}.title`)}
                caption={t(`stickers.${s.key}.caption`)}
                label={t(`stickers.${s.key}.label`)}
              />
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            {isUa ? 'Для обговорення з Юрою' : 'For discussion with Yura'}
          </span>
          <h2 className="mt-3 text-2xl font-black text-navy min-[360px]:text-3xl">
            {isUa ? 'Нові сценарії, які можна додати' : 'New use cases we can add'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            {isUa
              ? 'Старі 12 варіантів залишаються. Ці картки — додаткові ідеї, щоб обрати майбутній склад продукту.'
              : 'The original 12 options remain. These cards are additional ideas for deciding the future product scope.'}
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {conceptIdeas.map(([icon, title, text]) => (
            <ConceptCard key={title} icon={icon} title={title} text={text} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {isUa ? 'Розширення асортименту' : 'Product range ideas'}
            </span>
            <h2 className="mt-3 text-2xl font-black text-navy min-[360px]:text-3xl">
              {isUa ? 'Не тільки наліпки' : 'More than stickers'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              {isUa
                ? 'Один і той самий QR можна продавати на різних носіях. Юра зможе вибрати, що реально виготовляти на старті.'
                : 'The same QR can be sold on different physical formats. Yura can choose which ones make sense for launch.'}
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productIdeas.map(([icon, title, text]) => (
              <ConceptCard key={title} icon={icon} title={title} text={text} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 py-10 sm:px-4 sm:py-14">
        <div className="overflow-hidden rounded-3xl bg-navy px-4 py-8 text-center text-white sm:px-10 sm:py-12">
          <p className="mx-auto max-w-2xl text-lg font-semibold leading-7 sm:text-xl sm:leading-8">{t('ctaHint')}</p>
          <div className="mt-6 grid gap-3 min-[420px]:flex min-[420px]:flex-wrap min-[420px]:justify-center">
            <a href="#kinds" className="inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 font-semibold text-navy transition hover:bg-slate-100 min-[420px]:w-auto sm:px-6">
              {tc('customize')}
            </a>
            <Link href="/order" className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10 min-[420px]:w-auto sm:px-6">
              {tc('orderCta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValuePoint({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-5 text-slate-600 shadow-sm">
      <span aria-hidden className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{number}</div>
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function ConceptCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl" aria-hidden>
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}
