import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon, type IconName } from '@/components/product/Icon';
import { HeroProducts, ProductMockup } from '@/components/product/ProductMockup';
import { SOLUTIONS, PHYSICAL_PRODUCTS, localized } from '@/lib/products/solutions';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ua = locale === 'ua';
  const lang = ua ? 'ua' : 'en';
  const goals = SOLUTIONS.filter((solution) => solution.key !== 'online');
  const formats = PHYSICAL_PRODUCTS.filter((product) => product.key !== 'vinyl');
  const industries: { icon: IconName; ua: string; en: string }[] = [
    { icon: 'coffee', ua: 'Кав’ярні та ресторани', en: 'Cafés & restaurants' },
    { icon: 'salon', ua: 'Салони та барбершопи', en: 'Salons & barbershops' },
    { icon: 'clinic', ua: 'Клініки та стоматології', en: 'Clinics & dental practices' },
    { icon: 'store', ua: 'Магазини', en: 'Local shops' },
    { icon: 'hotel', ua: 'Готелі', en: 'Hotels & guesthouses' },
    { icon: 'car', ua: 'Автосервіси', en: 'Auto services' },
  ];
  return (
    <div className="product-storefront">
      <section className="product-hero">
        <div className="product-container grid items-center gap-4 py-10 sm:py-14 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:py-16">
          <div className="relative z-10 min-w-0">
            <p className="product-eyebrow"><span />{ua ? 'Для бізнесу, куди приходять люди' : 'For businesses people walk into'}</p>
            <h1 className="product-headline mt-6">{ua ? <>Допоможіть клієнту зробити <em>наступний крок.</em></> : <>Make the next step <em>easy for your customers.</em></>}</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{ua ? 'Відгук, Wi-Fi, меню чи контакт — на готових наліпках, табличках і стендах, які знаходяться саме там, де потрібні.' : 'Reviews, Wi-Fi, menus and contacts. Thoughtful stickers, signs and table stands that put the right action in the right place.'}</p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <a href="#solutions" className="product-button">{ua ? 'Обрати рішення' : 'Find your solution'}<Icon name="arrow" className="h-4 w-4" /></a>
              <Link href="/how-it-works" className="product-button-secondary">{ua ? 'Як це працює' : 'How it works'}</Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500"><Icon name="scan" className="h-4 w-4" />{ua ? 'Клієнт сканує. Ваша справа — поруч.' : 'A quick scan. A useful connection.'}</p>
          </div>
          <div className="product-hero-scene min-w-0">
            <HeroProducts locale={lang} />
            <div className="product-scene-caption"><span>01 / {ua ? 'У вашому просторі' : 'In your space'}</span><span>{ua ? 'На столі. Біля каси. На вході.' : 'Tables. Counters. Doorways.'}</span></div>
          </div>
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white" aria-label={ua ? 'Продумано для щоденного використання' : 'Made for everyday interactions'}>
        <div className="product-container grid gap-5 py-6 sm:grid-cols-3 sm:gap-8">
          <Trust icon="smartphone" title={ua ? 'Звична камера телефона' : 'A familiar phone camera'} text={ua ? 'Для сканування сучасними смартфонами.' : 'Designed for modern smartphone cameras.'} />
          <Trust icon="palette" title={ua ? 'У стилі вашого бізнесу' : 'A design that feels like you'} text={ua ? 'Ваші кольори, напис і формат.' : 'Your colors, message and format.'} />
          <Trust icon="package" title={ua ? 'Фізичний виріб' : 'A physical product'} text={ua ? 'Для вашого простору, а не лише файл.' : 'Made for your space, beyond a digital file.'} />
        </div>
      </section>

      <section id="solutions" className="product-container py-14 sm:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl"><p className="product-kicker">01 / {ua ? 'Почнімо з вашої мети' : 'Start with the outcome'}</p><h2 className="product-section-heading mt-3">{ua ? 'Що має зробити клієнт?' : 'What should your customer do?'}</h2></div>
          <p className="max-w-xs text-sm leading-6 text-slate-600">{ua ? 'Оберіть дію. Потім знайдемо для неї місце у вашому бізнесі.' : 'Choose an action. Then give it a place in your business.'}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {goals.slice(0, 3).map((solution, index) => (
            <Link key={solution.key} href={`/solutions/${solution.key}`} className={`product-flagship group ${index === 0 ? 'product-flagship-dark' : index === 1 ? 'product-flagship-cream' : 'product-flagship-red'}`}>
              <div className="flex items-center justify-between"><Icon name={solution.icon} className="h-7 w-7" /><span className="text-xs opacity-60">0{index + 1}</span></div>
              <div className="my-6 flex h-32 justify-center sm:h-40" aria-hidden="true"><ProductMockup kind={index === 0 ? 'stand' : index === 1 ? 'sticker' : 'sign'} locale={lang} className="h-full w-auto max-w-full" /></div>
              <h3 className="text-xl font-bold tracking-tight">{localized(solution.title, locale)}</h3>
              <p className="mt-3 text-sm leading-6 opacity-80">{localized(solution.description, locale)}</p>
              <span className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-current/15 pt-4 text-sm font-semibold">{ua ? 'Обрати рішення' : 'Explore this solution'}<Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
        <div className="mt-5 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {goals.slice(3).map((solution) => (
            <Link key={solution.key} href={`/solutions/${solution.key}`} className="product-solution-row group">
              <Icon name={solution.icon} className="h-6 w-6 shrink-0 text-navy" /><div className="min-w-0 flex-1"><h3 className="font-semibold text-navy">{localized(solution.title, locale)}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{localized(solution.description, locale)}</p></div><Icon name="arrow" className="h-4 w-4 shrink-0 text-navy transition group-hover:translate-x-1" />
            </Link>
          ))}
          <Link href="/solutions/online" className="product-solution-row group"><Icon name="globe" className="h-6 w-6 shrink-0 text-navy" /><div className="min-w-0 flex-1"><h3 className="font-semibold text-navy">{ua ? 'Сайт, магазин чи застосунок' : 'Website, listings or app'}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{ua ? 'Уже маєте посилання? Приведімо до нього клієнта.' : 'Already have a link? Make it easy to reach.'}</p></div><Icon name="arrow" className="h-4 w-4 shrink-0 text-navy" /></Link>
        </div>
      </section>

      <section id="formats" className="product-format-section py-14 sm:py-20">
        <div className="product-container">
          <div className="max-w-2xl"><p className="product-kicker">02 / {ua ? 'Знайдіть своє місце' : 'Give it a place'}</p><h2 className="product-section-heading mt-3">{ua ? 'Той самий задум. Різні форми.' : 'One idea. Many ways to place it.'}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{ua ? 'Стенд на столику, наліпка на дверях чи картка після зустрічі. Оберіть формат під час налаштування рішення.' : 'A stand on the table, a sticker on the door, a card after a conversation. Choose a format as you set up your solution.'}</p></div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4">
            {formats.map((product) => (
              <article key={product.key} className="min-w-0">
                <div className={`product-material-study ${!product.available ? 'opacity-65' : ''}`}><ProductMockup kind={product.mockup} locale={lang} className="h-auto w-full" /></div>
                <div className="mt-4 flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-navy sm:text-base">{localized(product.title, locale)}</h3>{!product.available && <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{ua ? 'Згодом' : 'Coming later'}</span>}</div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{localized(product.description, locale)}</p>
              </article>
            ))}
            <div className="flex min-w-0 flex-col justify-center border-t border-navy/15 py-5"><p className="font-serif text-2xl leading-tight text-navy sm:text-3xl">{ua ? 'Місце, де вас помітять.' : 'A place to be noticed.'}</p><a href="#solutions" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-navy">{ua ? 'Знайти рішення' : 'Find a solution'}<Icon name="arrow" className="h-4 w-4" /></a></div>
          </div>
        </div>
      </section>

      <section className="product-container py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div><p className="product-kicker">03 / {ua ? 'Від ідеї до вашого столика' : 'From an idea to your counter'}</p><h2 className="product-section-heading mt-3">{ua ? 'Три кроки до готового виробу.' : 'Three steps. Ready for your space.'}</h2><Link href="/how-it-works" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-navy">{ua ? 'Детальніше про замовлення' : 'More about ordering'}<Icon name="arrow" className="h-4 w-4" /></Link></div>
          <ol className="divide-y divide-navy/10 border-t border-navy/10">
            {[
              [ua ? 'Визначте дію клієнта' : 'Choose the customer action', ua ? 'Відгук, підключення до Wi-Fi чи перехід до вашого меню.' : 'A review, a Wi-Fi connection or a visit to your menu.'],
              [ua ? 'Налаштуйте вигляд і формат' : 'Make it yours', ua ? 'Додайте свої дані, оберіть носій, кольори й кількість.' : 'Add your content, choose the format, colors and quantity.'],
              [ua ? 'Отримайте готовий виріб' : 'Receive a ready-to-use product', ua ? 'Узгодимо деталі замовлення, щоб виріб знайшов своє місце у вашому бізнесі.' : 'We’ll confirm the order details so your product fits the space you have in mind.'],
            ].map(([title, description], index) => <li key={title} className="flex gap-5 py-6"><span className="pt-1 font-mono text-xs text-accent">0{index + 1}</span><div><h3 className="text-lg font-bold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div></li>)}
          </ol>
        </div>
      </section>

      <section className="border-y border-navy/10 py-10 sm:py-14"><div className="product-container"><p className="product-kicker">{ua ? 'Для бізнесу, як ваш' : 'For a business like yours'}</p><div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-6">{industries.map((industry) => <div key={industry.icon} className="flex items-start gap-3 text-sm font-medium text-navy"><Icon name={industry.icon} className="h-5 w-5 shrink-0" /><span>{ua ? industry.ua : industry.en}</span></div>)}</div></div></section>
      <section className="product-container py-14 sm:py-20"><div className="product-final-cta"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.15em] text-white/60">{ua ? 'Маленька деталь. Щоденна користь.' : 'A small detail. An everyday connection.'}</p><h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{ua ? 'Дайте клієнту простий привід взаємодіяти.' : 'Give your customers an easy next step.'}</h2></div><a href="#solutions" className="product-button mt-6 shrink-0 sm:mt-0">{ua ? 'Обрати рішення' : 'Find your solution'}<Icon name="arrow" className="h-4 w-4" /></a></div></section>
    </div>
  );
}

function Trust({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <div className="flex items-start gap-3"><Icon name={icon} className="mt-1 h-6 w-6 shrink-0 text-navy" /><div><p className="text-sm font-semibold text-navy">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>;
}
