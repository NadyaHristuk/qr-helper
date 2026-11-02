import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/product/Icon';
import { ProductMockup } from '@/components/product/ProductMockup';
import { HeroEnvironment } from '@/components/product/HeroEnvironment';
import { SOLUTIONS, PHYSICAL_PRODUCTS, localized } from '@/lib/products/solutions';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ua = locale === 'ua';
  const lang = ua ? 'ua' : 'en';
  const goals = SOLUTIONS.filter((solution) => solution.key !== 'online');
  const formats = PHYSICAL_PRODUCTS.filter((product) => product.key !== 'vinyl');
  const industries: { icon: IconName; ua: string; en: string; detailUa: string; detailEn: string }[] = [
    { icon: 'coffee', ua: 'Кав’ярні та ресторани', en: 'Cafés & restaurants', detailUa: 'Меню, Wi-Fi та відгуки', detailEn: 'Menus, Wi-Fi & reviews' },
    { icon: 'salon', ua: 'Салони та барбершопи', en: 'Salons & barbershops', detailUa: 'Запис і контакт після візиту', detailEn: 'Bookings & staying in touch' },
    { icon: 'clinic', ua: 'Клініки та стоматології', en: 'Clinics & dental practices', detailUa: 'Контакти та корисна інформація', detailEn: 'Contacts & useful information' },
    { icon: 'store', ua: 'Магазини', en: 'Local shops', detailUa: 'Відгуки та онлайн-вітрина', detailEn: 'Reviews & your online store' },
    { icon: 'hotel', ua: 'Готелі', en: 'Hotels & guesthouses', detailUa: 'Wi-Fi та інформація для гостей', detailEn: 'Wi-Fi & guest information' },
    { icon: 'car', ua: 'Автосервіси', en: 'Auto services', detailUa: 'Запис, контакт і відгук', detailEn: 'Bookings, contacts & reviews' },
  ];
  return (
    <div className="product-storefront">
      <section className="product-hero">
        <div className="product-container product-hero-layout">
          <div className="relative z-10 min-w-0">
            <p className="product-eyebrow"><span />{ua ? 'Для бізнесу, куди приходять люди' : 'For businesses people walk into'}</p>
            <h1 className="product-headline">{ua ? <>QR-рішення, що спрощують <em>роботу бізнесу.</em></> : <>QR solutions that make <em>everyday business easier.</em></>}</h1>
            <p className="product-hero-description">{ua ? 'Wi-Fi, меню, відгуки чи контакти — готові QR-вироби для щоденних потреб вашого бізнесу.' : 'Wi-Fi, menus, reviews and contacts — ready-to-use QR products for everyday business needs.'}</p>
            <div className="product-hero-actions">
              <a href="#solutions" className="product-button">{ua ? 'Обрати рішення' : 'Choose a solution'}<Icon name="arrow" className="h-4 w-4" /></a>
              <a href="#how-it-works" className="product-button-secondary">{ua ? 'Як це працює' : 'How it works'}</a>
            </div>
            <p className="product-hero-support"><Icon name="scan" className="h-4 w-4" />{ua ? 'Оберіть рішення, додайте свої дані — готовий QR на виробі.' : 'Choose a solution, add your details — your QR, ready on a product.'}</p>
          </div>
          <div className="product-hero-scene min-w-0">
            <HeroEnvironment
              locale={lang}
              image={{
                src: '/images/hero/cafe-review-stand.webp',
                alt: ua
                  ? 'Згенерована візуалізація QR-стенду для відгуків у кав’ярні'
                  : 'AI-generated visualization of a café review QR stand',
                objectPosition: { desktop: '50% 50%', mobile: '46% 51%' },
              }}
              overlay={
                <div className="product-hero-photo-badge" aria-hidden="true">
                  <span className="product-hero-photo-icon"><Icon name="scan" className="h-5 w-5" /></span>
                  <span className="product-hero-photo-copy">
                    <strong>{ua ? 'Зручно з першого сканування' : 'Easy from the first scan'}</strong>
                    <span>{ua ? 'Відгуки · Wi-Fi · Меню' : 'Reviews · Wi-Fi · Menus'}</span>
                  </span>
                </div>
              }
            />
            <div className="product-scene-caption"><span>{ua ? 'Згенерована візуалізація' : 'AI-generated visual'}</span><span>{ua ? 'Приклад QR-виробу в інтер’єрі' : 'Example QR product in a café'}</span></div>
          </div>
        </div>
        <div className="product-container product-hero-scroll">
          <a href="#solutions" className="product-scroll-cue">
            <span>{ua ? 'Переглянути рішення' : 'Explore solutions'}</span>
            <Icon name="arrow" className="h-4 w-4 rotate-90" />
          </a>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white" aria-label={ua ? 'Продумано для щоденного використання' : 'Made for everyday interactions'}>
        <div className="product-container product-trust-strip">
          <Trust icon="smartphone" title={ua ? 'Звична камера телефона' : 'A familiar phone camera'} text={ua ? 'Для сканування сучасними смартфонами.' : 'Designed for modern smartphone cameras.'} />
          <Trust icon="palette" title={ua ? 'У стилі вашого бізнесу' : 'A design that feels like you'} text={ua ? 'Ваші кольори, напис і формат.' : 'Your colors, message and format.'} />
          <Trust icon="package" title={ua ? 'Фізичний виріб' : 'A physical product'} text={ua ? 'Для вашого простору, а не лише файл.' : 'Made for your space, beyond a digital file.'} />
        </div>
      </section>

      <section id="solutions" className="product-container product-section">
        <div className="product-section-intro">
          <div className="max-w-xl"><p className="product-kicker">{ua ? 'Рішення для вашого бізнесу' : 'Solutions for your business'}</p><h2 className="product-section-heading">{ua ? 'Що потрібно вашому бізнесу?' : 'What does your business need?'}</h2></div>
          <p className="product-section-description">{ua ? 'Wi-Fi, меню, відгуки чи контакти — оберіть, що хочете спростити.' : 'Wi-Fi, menus, reviews or contacts — choose what you want to make easier.'}</p>
        </div>
        <div className="product-flagship-grid">
          {goals.slice(0, 3).map((solution, index) => (
            <Link key={solution.key} href={`/solutions/${solution.key}`} className={`product-flagship group ${index === 0 ? 'product-flagship-dark' : index === 1 ? 'product-flagship-cream' : 'product-flagship-red'}`}>
              <Icon name={solution.icon} className="h-7 w-7" />
              <div className="product-flagship-art" aria-hidden="true"><ProductMockup kind={index === 0 ? 'stand' : index === 1 ? 'sticker' : 'sign'} locale={lang} className="h-full w-auto max-w-full" /></div>
              <h3 className="product-card-heading">{localized(solution.title, locale)}</h3>
              <p className="product-card-description">{localized(solution.description, locale)}</p>
              <span className="product-card-link">{ua ? 'Обрати рішення' : 'Explore this solution'}<Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
        <h3 className="product-secondary-heading">{ua ? 'Інші рішення' : 'More solutions'}</h3>
        <div className="product-secondary-grid">
          {goals.slice(3).map((solution) => (
            <Link key={solution.key} href={`/solutions/${solution.key}`} className="product-solution-row group">
              <Icon name={solution.icon} className="h-6 w-6 shrink-0 text-navy" /><div className="min-w-0 flex-1"><h4 className="font-semibold text-navy">{localized(solution.title, locale)}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{localized(solution.description, locale)}</p></div><Icon name="arrow" className="h-4 w-4 shrink-0 text-navy transition group-hover:translate-x-1" />
            </Link>
          ))}
          <Link href="/solutions/online" className="product-solution-row group"><Icon name="globe" className="h-6 w-6 shrink-0 text-navy" /><div className="min-w-0 flex-1"><h4 className="font-semibold text-navy">{ua ? 'Сайт, магазин чи застосунок' : 'Website, listings or app'}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{ua ? 'Уже маєте посилання? Приведімо до нього клієнта.' : 'Already have a link? Make it easy to reach.'}</p></div><Icon name="arrow" className="h-4 w-4 shrink-0 text-navy" /></Link>
        </div>
      </section>

      <section id="formats" className="product-format-section product-section">
        <div className="product-container">
          <div className="max-w-2xl"><p className="product-kicker">{ua ? 'Фізичні формати' : 'Physical formats'}</p><h2 className="product-section-heading">{ua ? 'Де це буде розміщено?' : 'Where will you place it?'}</h2><p className="product-format-description">{ua ? 'Той самий задум. Різні форми. Стенд на столику, наліпка на дверях чи картка після зустрічі — оберіть носій для свого рішення.' : 'One idea, many forms. A stand on the table, a sticker on the door or a card after a conversation. Choose a format for your solution.'}</p></div>
          <div className="product-format-grid">
            {formats.map((product) => (
              <article key={product.key} className="min-w-0">
                <div className={`product-material-study ${!product.available ? 'opacity-65' : ''}`}><ProductMockup kind={product.mockup} locale={lang} className="h-auto w-full" /></div>
                <div className="product-format-title"><h3 className="product-format-heading">{localized(product.title, locale)}</h3>{!product.available && <span className="text-xs font-semibold text-slate-500">{ua ? 'Згодом' : 'Coming later'}</span>}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{localized(product.description, locale)}</p>
              </article>
            ))}
            <div className="product-format-invitation"><p className="font-serif text-2xl leading-tight text-navy sm:text-3xl">{ua ? 'Місце, де вас помітять.' : 'A place to be noticed.'}</p><a href="#solutions" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-navy">{ua ? 'Знайти рішення' : 'Find a solution'}<Icon name="arrow" className="h-4 w-4" /></a></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="product-container product-section">
        <div className="product-process-grid">
          <div><p className="product-kicker">{ua ? 'Як це працює' : 'How it works'}</p><h2 className="product-section-heading">{ua ? 'Три кроки до готового виробу.' : 'Three steps to your finished product.'}</h2><Link href="/how-it-works" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-navy">{ua ? 'Детальніше про замовлення' : 'More about ordering'}<Icon name="arrow" className="h-4 w-4" /></Link></div>
          <ol className="divide-y divide-navy/10 border-t border-navy/10">
            {[
              [ua ? 'Оберіть рішення для бізнесу' : 'Choose a business solution', ua ? 'Wi-Fi, меню, відгуки, контакти чи інше посилання.' : 'Wi-Fi, menus, reviews, contacts or another link.'],
              [ua ? 'Додайте дані й оберіть вигляд' : 'Add your details and choose a design', ua ? 'Перегляньте макет, оберіть готове оформлення, формат і кількість.' : 'Preview your design, choose a format and quantity.'],
              [ua ? 'Отримайте готовий виріб' : 'Get your finished product', ua ? 'Оформіть замовлення — і отримайте надрукований QR-виріб для свого бізнесу.' : 'Place your order and receive a printed QR product for your business.'],
            ].map(([title, description], index) => <li key={title} className="flex gap-4 py-6"><span aria-hidden="true" className="product-step-number">{index + 1}</span><div><h3 className="text-lg font-bold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="product-industries">
        <div className="product-container">
          <div className="product-industry-intro">
            <h2 className="product-section-heading">{ua ? 'Для бізнесу, як ваш' : 'For a business like yours'}</h2>
            <p>{ua ? 'Рішення для місць, де клієнти взаємодіють з вашим бізнесом наживо.' : 'Thoughtful solutions for places where customers connect with your business in person.'}</p>
          </div>
          <div className="product-industry-grid">
            {industries.map((industry) => (
              <div key={industry.icon} className="product-industry">
                <Icon name={industry.icon} className="h-6 w-6 shrink-0" />
                <h3>{ua ? industry.ua : industry.en}</h3>
                <p>{ua ? industry.detailUa : industry.detailEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="product-container product-closing-section"><div className="product-final-cta"><div className="max-w-2xl"><p className="product-cta-kicker">{ua ? 'Менше рутини. Більше зручності.' : 'Less back-and-forth. More convenience.'}</p><h2>{ua ? 'Спрощуйте щоденні справи свого бізнесу.' : 'Make everyday business easier.'}</h2></div><a href="#solutions" className="product-button shrink-0">{ua ? 'Обрати рішення' : 'Choose a solution'}<Icon name="arrow" className="h-4 w-4" /></a></div></section>
    </div>
  );
}

function Trust({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <div className="product-trust-item"><Icon name={icon} className="h-6 w-6 shrink-0 text-navy" /><div><p className="text-sm font-semibold text-navy">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div></div>;
}
