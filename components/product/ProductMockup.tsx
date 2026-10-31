import type { ReactNode } from 'react';

export type ProductMockupKind = 'sticker' | 'stand' | 'sign' | 'glass' | 'card' | 'poster' | 'qr_nfc';
export type ProductKind = ProductMockupKind;
type Locale = 'ua' | 'en';

const NAVY = '#1d3557';
const RED = '#d62828';
const PAPER = '#fffdf7';

// An intentionally decorative pattern: product illustrations never replace a customer's QR.
const QR_PATTERN = Array.from({ length: 21 }, (_, y) =>
  Array.from({ length: 21 }, (_, x) => {
    const finder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    return !finder && ((x * 17 + y * 23 + x * y * 3) % 11 < 6)
      ? `M${x} ${y}h1v1h-1Z`
      : '';
  }).join(''),
).join('');

function QrPattern({ x, y, size, color = NAVY }: { x: number; y: number; size: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 21})`} fill={color} shapeRendering="crispEdges">
      <path d={QR_PATTERN} />
      {[['0', '0'], ['14', '0'], ['0', '14']].map(([left, top]) => (
        <g key={`${left}-${top}`} transform={`translate(${left} ${top})`}>
          <path d="M0 0h7v7H0Zm1 1v5h5V1Z" fillRule="evenodd" />
          <path d="M2 2h3v3H2Z" />
        </g>
      ))}
    </g>
  );
}

function Stars({ x, y, size = 9, color = RED }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 10})`} fill={color}>
      {[0, 15, 30, 45, 60].map((offset) => (
        <path key={offset} transform={`translate(${offset} 0)`} d="m5 0 1.5 3.3 3.5.5-2.5 2.5.6 3.5L5 8.1 1.9 9.8l.6-3.5L0 3.8l3.5-.5Z" />
      ))}
    </g>
  );
}

function Wifi({ x, y, size = 24, color = NAVY }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`} stroke={color} strokeWidth="1.7" fill="none" strokeLinecap="round">
      <path d="M3 7.5a15 15 0 0 1 18 0M6 11a10 10 0 0 1 12 0m-9 3.5a5 5 0 0 1 6 0" />
      <circle cx="12" cy="18" r="1" fill={color} stroke="none" />
    </g>
  );
}

const text = {
  ua: { reviews: 'Ваша думка', matters: 'має значення.', scan: 'ВІДСКАНУЙТЕ QR', google: 'ВІДГУКИ В GOOGLE', wifi: 'ТУТ Є WI-FI', connect: 'Підключайтесь.', welcome: 'Вітаємо.', menu: 'Меню поруч.', name: 'Олександра', role: 'ЗАЛИШАЙМОСЬ НА ЗВ’ЯЗКУ', open: 'Відкрийте', more: 'трохи більше.', hello: 'ПРИЄМНО ПОЗНАЙОМИТИСЬ' },
  en: { reviews: 'Your opinion', matters: 'means a lot.', scan: 'SCAN THE QR CODE', google: 'REVIEWS ON GOOGLE', wifi: 'WI-FI IS HERE', connect: 'Make yourself at home.', welcome: 'Welcome.', menu: 'A menu to enjoy.', name: 'Alexandra', role: 'LET’S STAY CONNECTED', open: 'A little scan.', more: 'So much more.', hello: 'NICE TO MEET YOU' },
};

function GroundShadow({ x, y, width, depth = 10 }: { x: number; y: number; width: number; depth?: number }) {
  return (
    <g fill={NAVY}>
      <ellipse cx={x} cy={y} rx={width} ry={depth} opacity=".025" />
      <ellipse cx={x} cy={y} rx={width * .84} ry={depth * .7} opacity=".04" />
      <ellipse cx={x} cy={y} rx={width * .62} ry={depth * .36} opacity=".055" />
    </g>
  );
}

function Mount({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + .6} cy={y + .9} r="3.3" fill={NAVY} opacity=".12" />
      <circle cx={x} cy={y} r="2.8" fill="#bec2bc" stroke="#8d9794" strokeWidth=".6" />
      <path d={`M${x - 1.4} ${y - .7}h2.8`} stroke="white" strokeWidth=".8" strokeLinecap="round" />
    </g>
  );
}

function ProductArtwork({ kind, locale }: { kind: ProductMockupKind; locale: Locale }): ReactNode {
  const t = text[locale];
  switch (kind) {
    case 'sticker':
      return (
        <>
          <GroundShadow x={184} y={258} width={105} />
          <g transform="rotate(-11 180 145)">
            <circle cx="182" cy="146" r="101" fill="#d8cdb9" />
            <circle cx="180" cy="142" r="101" fill="#eee5d5" stroke="#d5c9b4" strokeWidth=".7" />
            <path d="M180 42a100 100 0 0 1 89 146l-54 48A100 100 0 1 1 180 42Z" fill="#faf5e9" stroke="#e1d7c4" strokeWidth=".7" />
            <path d="M98 104a89 89 0 0 1 138-27" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".8" />
            <circle cx="180" cy="142" r="87" fill="none" stroke={NAVY} strokeWidth=".6" opacity=".35" />
            <Wifi x={168} y={65} size={24} />
            <text x="180" y="101" textAnchor="middle" fill={NAVY} fontSize="9" fontWeight="600" letterSpacing="1.5">{t.wifi}</text>
            <QrPattern x={141} y={116} size={78} />
            <text x="177" y="214" textAnchor="middle" fill={NAVY} fontSize="6.5" letterSpacing="1.1">{t.scan}</text>
            <path d="m215 236 54-48c-16 2-36 18-43 30Z" fill={NAVY} opacity=".13" />
            <path d="M215 236c9-17 8-37 20-44 10-6 21-5 34-4-17 10-37 29-54 48Z" fill="#fffdf5" stroke="#d6cbb7" strokeWidth=".8" />
            <path d="M237 194c8-3 17-4 26-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </>
      );
    case 'stand':
      return (
        <>
          <GroundShadow x={186} y={265} width={105} depth={12} />
          <path d="m99 250 37-13h122l26 15-31 10H97Z" fill="#dae4e0" fillOpacity=".72" stroke="#bdcfcb" />
          <path d="m215 36 53 214h-24L196 40Z" fill="#dce8e5" fillOpacity=".52" stroke="#b2c8c6" strokeWidth="1.2" />
          <path d="m219 40 46 204" stroke="white" strokeWidth="2.5" opacity=".85" />
          <path d="M113 34h111l25 217H87Z" fill="#a8c0bd" stroke="#a4bebb" strokeWidth="1.5" />
          <path d="M113 35h108l25 213H89Z" fill={NAVY} />
          <path d="M117 40h99l24 203H94Z" fill="none" stroke="#fffdf7" strokeOpacity=".22" strokeWidth=".8" />
          <path d="m114 36-24 211m133-210 24 211" stroke="white" strokeWidth="1.5" opacity=".65" />
          <text x="167" y="74" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="18">{t.reviews}</text>
          <text x="167" y="95" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="18">{t.matters}</text>
          <path d="M153 109h28" stroke={RED} strokeWidth="2" />
          <rect x="119" y="123" width="96" height="96" rx="1" fill={PAPER} />
          <QrPattern x={127} y={131} size={80} />
          <Stars x={143} y={229} size={7} color="#f8edcf" />
          <path d="M90 249h156v3H89Z" fill="#102740" />
          <path d="M99 255h154" stroke="white" strokeWidth="1.3" opacity=".9" />
          <path d="m107 260 141-1" stroke="#9fb8b4" strokeWidth=".7" />
        </>
      );
    case 'sign':
      return (
        <>
          <GroundShadow x={183} y={253} width={124} depth={10} />
          <g transform="rotate(-5 180 150)">
            <rect x="58" y="72" width="252" height="163" rx="5" fill={NAVY} opacity=".06" />
            <rect x="54" y="68" width="252" height="163" rx="4" fill="#c2bba9" />
            <rect x="51" y="64" width="252" height="163" rx="4" fill="#f6f0e5" stroke="#e0d7c5" />
            <path d="M56 66h242M53 69v152" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M56 226h243" stroke="#bfb7a6" strokeWidth=".6" />
            {[[63, 76], [291, 76], [63, 215], [291, 215]].map(([x, y]) => <Mount key={`${x}-${y}`} x={x} y={y} />)}
            <QrPattern x={76} y={97} size={97} />
            <path d="M195 101h24" stroke={RED} strokeWidth="2" />
            <text x="194" y="132" fill={NAVY} fontFamily="Georgia, serif" fontSize="21">{locale === 'ua' ? 'Ваше' : 'Our'}</text>
            <text x="194" y="157" fill={NAVY} fontFamily="Georgia, serif" fontSize="21">{locale === 'ua' ? 'меню.' : 'menu.'}</text>
            <text x="195" y="185" fill={NAVY} fontSize="6" letterSpacing=".65">{t.scan}</text>
          </g>
        </>
      );
    case 'glass':
      return (
        <>
          <GroundShadow x={183} y={273} width={96} depth={8} />
          <path d="m92 34 166-8 4 238-166 9Z" fill="#b4c9c6" fillOpacity=".38" />
          <path d="m89 31 166-8 4 238-166 9Z" fill="#f8ffff" fillOpacity=".48" stroke="#b2c7c4" strokeWidth="1.2" />
          <path d="m94 35 156-8 4 229-156 8Z" fill="none" stroke="white" strokeWidth="1.5" opacity=".85" />
          <path d="m101 38 57-3-56 99Zm142 121 2 89-51 3Z" fill="white" opacity=".55" />
          <path d="m117 91 111-5 2 119-111 5Z" fill={PAPER} fillOpacity=".28" stroke="white" strokeWidth=".8" />
          <text x="174" y="115" textAnchor="middle" fill={NAVY} fontFamily="Georgia, serif" fontSize="17">{t.welcome}</text>
          <QrPattern x={143} y={129} size={64} />
          <text x="175" y="222" textAnchor="middle" fill={NAVY} fontSize="6" letterSpacing=".8">{t.scan}</text>
          <path d="m246 143 14-1 .4 38-14 1" stroke="#a4b6b2" strokeWidth="4" strokeLinejoin="round" />
          <path d="m248 142 12-.5.3 36" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m95 266 163-9" stroke="#9db6b2" strokeWidth="1" />
        </>
      );
    case 'card':
      return (
        <>
          <GroundShadow x={183} y={250} width={133} depth={11} />
          <g transform="rotate(-10 180 150)">
            <rect x="58" y="94" width="251" height="143" rx="4" fill="#cec3ad" />
            <rect x="55" y="89" width="251" height="143" rx="4" fill="#e6ddca" stroke="#d4c9b5" />
            <rect x="51" y="84" width="251" height="143" rx="4" fill="#f5efe3" stroke="#ded4c2" />
            <rect x="47" y="78" width="251" height="143" rx="4" fill={PAPER} stroke="#e0d8c9" />
            <path d="M52 80h241M49 84v131" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M70 104h25" stroke={RED} strokeWidth="2" />
            <text x="69" y="141" fill={NAVY} fontFamily="Georgia, serif" fontSize="21">{t.name}</text>
            <text x="70" y="162" fill={NAVY} fontSize="6" letterSpacing=".6">{t.role}</text>
            <text x="70" y="198" fill={NAVY} fontSize="6.5">qr-helper.com</text>
            <QrPattern x={204} y={113} size={69} />
            <path d="M55 224h244m-241 5h241" stroke="#b5aa94" strokeWidth=".5" opacity=".7" />
          </g>
        </>
      );
    case 'poster':
      return (
        <>
          <GroundShadow x={183} y={279} width={79} depth={7} />
          <g transform="rotate(-4 180 150)">
            <path d="M107 28h151v235l-20 10H107Z" fill={NAVY} opacity=".07" />
            <path d="M101 23h153v222q0 18-14 23H101Z" fill="#ddd4c2" />
            <path d="M98 20h153v224q-11-3-14 20H98Z" fill={PAPER} stroke="#ded7c9" strokeWidth=".7" />
            <path d="M98 20h153v10H98Z" fill={RED} />
            <path d="M100 33v228" stroke="white" strokeWidth="1.5" />
            <text x="115" y="65" fill={NAVY} fontSize="6" letterSpacing="1.5">QR HELPER / 01</text>
            <text x="115" y="96" fill={NAVY} fontFamily="Georgia, serif" fontSize={locale === 'ua' ? 21 : 24}>{t.open}</text>
            <text x="115" y="124" fill={NAVY} fontFamily="Georgia, serif" fontSize={locale === 'ua' ? 21 : 24}>{t.more}</text>
            <QrPattern x={128} y={147} size={94} />
            <path d="M237 264c3-22 8-23 14-20l-14 20Z" fill="#eee5d5" stroke="#d9cfbe" strokeWidth=".7" />
            <path d="m149 17 51-2 2 13-53 2Z" fill="#e5ddcb" fillOpacity=".7" />
          </g>
        </>
      );
    case 'qr_nfc':
      return (
        <>
          <GroundShadow x={182} y={255} width={98} />
          <g transform="rotate(-8 180 143)">
            <circle cx="182" cy="149" r="101" fill="#0e233c" />
            <circle cx="180" cy="143" r="101" fill={NAVY} stroke="#122943" />
            <path d="M88 109a98 98 0 0 1 166-34" stroke="#8095ab" strokeWidth="1.5" strokeLinecap="round" opacity=".65" />
            <circle cx="180" cy="143" r="90" stroke={PAPER} strokeOpacity=".3" fill="none" strokeWidth=".6" />
            <text x="180" y="84" textAnchor="middle" fill={PAPER} fontSize="7" letterSpacing="1.8">QR + NFC</text>
            <rect x="124" y="107" width="88" height="88" rx="2" fill={PAPER} />
            <QrPattern x={132} y={115} size={72} />
            <g transform="translate(225 129)" fill="none" stroke={PAPER} strokeWidth="1.6" strokeLinecap="round">
              <path d="M0 8a10 10 0 0 1 0 14M5 3a17 17 0 0 1 0 24m5-29a24 24 0 0 1 0 34" />
            </g>
            <text x="180" y="218" textAnchor="middle" fill={PAPER} fontSize="6.5" letterSpacing=".8">{t.scan}</text>
          </g>
        </>
      );
  }
}

/** Decorative material studies; the real, usable code is rendered by StickerDesign. */
export function ProductMockup({ kind, locale = 'ua', className }: { kind: ProductMockupKind; locale?: Locale; className?: string }) {
  return (
    <svg viewBox="0 0 360 300" width="360" height="300" fill="none" aria-hidden="true" focusable="false" className={className}>
      <ProductArtwork kind={kind} locale={locale} />
    </svg>
  );
}

/** An editorial still life: printed acrylic, a mounted plate, a peeled sticker, and a phone. */
export function HeroProducts({ locale }: { locale: Locale }) {
  const t = text[locale];
  return (
    <svg viewBox="0 0 600 600" width="600" height="600" fill="none" aria-hidden="true" focusable="false" className="hero-products-art">
      <circle cx="322" cy="283" r="234" fill="#eee9dd" />
      <path d="M102 433c70-79 220-108 380-46" stroke="#dfd7c7" strokeWidth=".8" />
      <path d="M34 479 359 407l210 82-307 88Z" fill="#e9e1d2" />
      <path d="m34 479 228 98v8L34 487Z" fill="#ddd2bf" />
      <path d="m262 577 307-88v8l-307 88Z" fill="#d2c5ae" />
      <path d="m35 479 227 95 305-85" stroke="#f9f4e8" strokeWidth="1.6" />
      <GroundShadow x={318} y={498} width={186} depth={25} />

      <g transform="rotate(8 451 228)">
        <rect x="340" y="128" width="211" height="183" rx="5" fill={NAVY} opacity=".06" />
        <rect x="336" y="122" width="211" height="183" rx="5" fill="#bcb4a3" />
        <rect x="332" y="118" width="211" height="183" rx="5" fill="#fbf7ee" stroke="#d8cebc" />
        <path d="M338 120h199m-203 4v171" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {[[344, 130], [531, 130], [344, 289], [531, 289]].map(([x, y]) => <Mount key={`${x}-${y}`} x={x} y={y} />)}
        <path d="M355 148h25" stroke={RED} strokeWidth="2" />
        <text x="354" y="178" fill={NAVY} fontFamily="Georgia, serif" fontSize="26">{t.menu}</text>
        <text x="355" y="199" fill={NAVY} fontSize="7" letterSpacing="1">{t.scan}</text>
        <QrPattern x={438} y={212} size={65} />
        <path d="M355 227h61m-61 11h48m-48 11h54m-54 11h39" stroke="#a5a79a" strokeWidth="1.2" opacity=".65" />
      </g>

      <g transform="rotate(-8 275 329)">
        <path d="m152 473 42-17h199l39 23-43 13H151Z" fill="#dce6df" fillOpacity=".8" stroke="#baccc6" />
        <path d="m332 157 79 316h-33l-74-309Z" fill="#c9dcd5" fillOpacity=".5" stroke="#afc6be" strokeWidth="1.4" />
        <path d="m339 164 70 302" stroke="white" strokeWidth="3" opacity=".85" />
        <path d="M184 155h163q8 0 9 8l36 309q1 7-7 7H156q-8 0-7-8l27-308q1-8 8-8Z" fill="#9db8af" />
        <path d="M181 151h163q8 0 9 8l35 309q1 7-7 7H153q-8 0-7-8l27-308q1-8 8-8Z" fill={NAVY} />
        <path d="M188 163h147l34 298H162Z" stroke={PAPER} strokeOpacity=".21" strokeWidth=".8" />
        <path d="m180 155-29 309m200-305 35 309" stroke="#f9fffa" strokeWidth="1.6" strokeOpacity=".72" />
        <path d="m183 161 7 0-22 293h-8Z" fill="white" fillOpacity=".045" />
        <text x="266" y="204" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="26">{t.reviews}</text>
        <text x="266" y="235" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="26">{t.matters}</text>
        <path d="M248 253h36" stroke={RED} strokeWidth="2.5" />
        <rect x="198" y="278" width="136" height="136" rx="2" fill={PAPER} />
        <QrPattern x={210} y={290} size={112} />
        <Stars x={230} y={429} size={10} color="#f8edce" />
        <text x="266" y="454" textAnchor="middle" fill={PAPER} fontSize="7" letterSpacing="1.5">{t.google}</text>
        <path d="M150 472h237v4H150Z" fill="#10253e" />
        <path d="M158 483h228" stroke="white" strokeWidth="1.7" strokeOpacity=".9" />
        <path d="m166 489 216-1" stroke="#adc3b9" strokeWidth=".8" />
      </g>

      <g transform="rotate(11 124 461)">
        <path d="M48 391h153v150H48Z" fill={NAVY} opacity=".045" />
        <path d="M44 385h153a5 5 0 0 1 5 5v131l-24 23H44a5 5 0 0 1-5-5V390a5 5 0 0 1 5-5Z" fill="#ded2bb" />
        <path d="M43 381h153a5 5 0 0 1 5 5v130l-25 25H43a5 5 0 0 1-5-5V386a5 5 0 0 1 5-5Z" fill="#f8f0df" stroke="#d7c9ae" />
        <path d="M45 385h148" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M48 392h143v124l-16 16H48Z" stroke={NAVY} strokeOpacity=".27" strokeWidth=".6" />
        <Wifi x={111} y={398} size={20} />
        <text x="121" y="434" textAnchor="middle" fill={NAVY} fontSize="8" fontWeight="600" letterSpacing="1.2">{t.wifi}</text>
        <QrPattern x={87} y={448} size={68} />
        <path d="m176 541 25-25c-10 0-20 4-25 16Z" fill={NAVY} opacity=".14" />
        <path d="M176 541c4-13-4-22 4-26 6-3 13-1 21 1-9 7-17 16-25 25Z" fill="#fffef7" stroke="#d4c6ad" strokeWidth=".8" />
      </g>

      <g transform="rotate(14 439 431)">
        <rect x="385" y="312" width="118" height="240" rx="21" fill={NAVY} opacity=".06" />
        <rect x="381" y="308" width="118" height="240" rx="21" fill={NAVY} opacity=".06" />
        <rect x="377" y="303" width="117" height="239" rx="21" fill="#15283b" />
        <rect x="380" y="306" width="111" height="233" rx="18" fill="#ece7dc" stroke="#a3aaa6" strokeWidth="1.2" />
        <rect x="384" y="310" width="103" height="225" rx="15" fill="#f9f6ef" />
        <path d="M414 310h44v6a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6Z" fill="#15283b" />
        <circle cx="450" cy="314" r="1.5" fill="#83938f" />
        <path d="M377 350v24m117-24v37" stroke="#727d80" strokeWidth="2" />
        <path d="M383 324v189" stroke="white" strokeWidth="1" opacity=".8" />
        <text x="435.5" y="346" textAnchor="middle" fill={NAVY} fontSize="7.5" fontWeight="500">{locale === 'ua' ? 'Камера' : 'Camera'}</text>
        <rect x="390" y="360" width="91" height="120" rx="3" fill="#e6dfd1" />
        <path d="m397 375 73 7-5 80-73-8Z" fill={NAVY} />
        <path d="m400 378 4 0-4 73-4-.5Z" fill="white" opacity=".15" />
        <rect x="407" y="392" width="54" height="54" rx="1" fill={PAPER} />
        <QrPattern x={413} y={398} size={42} />
        <path d="M399 401v-11h11m40 0h11v11m0 40v11h-11m-40 0h-11v-11" stroke={RED} strokeWidth="2" strokeLinecap="round" />
        <path d="M402 421h56" stroke={RED} strokeWidth=".8" opacity=".7" />
        <circle cx="435.5" cy="505" r="17" stroke={NAVY} strokeWidth="1.1" />
        <circle cx="435.5" cy="505" r="13" fill={PAPER} stroke="#e4ded1" />
        <rect x="424" y="528" width="24" height="2" rx="1" fill={NAVY} />
      </g>
    </svg>
  );
}
