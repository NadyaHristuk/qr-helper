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

function ProductArtwork({ kind, locale }: { kind: ProductMockupKind; locale: Locale }): ReactNode {
  const t = text[locale];
  switch (kind) {
    case 'sticker':
      return (
        <>
          <ellipse cx="181" cy="258" rx="103" ry="12" fill={NAVY} opacity=".07" />
          <g transform="rotate(-9 180 145)">
            <circle cx="180" cy="145" r="103" fill="#ded6c7" />
            <circle cx="179" cy="142" r="102" fill="#f6f0e3" stroke="#e5dccb" />
            <circle cx="179" cy="142" r="91" fill="none" stroke={NAVY} strokeWidth=".65" opacity=".5" />
            <text x="179" y="83" textAnchor="middle" fill={NAVY} fontSize="10" fontWeight="600" letterSpacing="1.8">{t.wifi}</text>
            <QrPattern x={136} y={105} size={86} />
            <text x="179" y="218" textAnchor="middle" fill={NAVY} fontSize="8" letterSpacing="1.4">{t.scan}</text>
            <path d="M234 218q-4 19-22 22l22-22Z" fill="#fffdf8" stroke="#ded6c7" strokeWidth=".7" />
          </g>
        </>
      );
    case 'stand':
      return (
        <>
          <ellipse cx="187" cy="261" rx="103" ry="12" fill={NAVY} opacity=".08" />
          <path d="M177 37h52l52 217h-37Z" fill="#cfbfa9" />
          <path d="m214 39 50 215h17L229 37Z" fill="#b6a58c" />
          <path d="M116 35h103l27 216H89Z" fill={NAVY} />
          <path d="M117 38h99l24 208H95Z" fill="none" stroke="#f2ece1" strokeOpacity=".19" />
          <text x="167" y="73" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="17">{t.reviews}</text>
          <text x="167" y="93" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="17">{t.matters}</text>
          <path d="M153 106h28" stroke={RED} strokeWidth="2" />
          <rect x="117" y="121" width="100" height="100" rx="2" fill={PAPER} />
          <QrPattern x={125} y={129} size={84} />
          <text x="167" y="236" textAnchor="middle" fill={PAPER} fontSize="6" letterSpacing="1.1">{t.google}</text>
          <path d="M90 251h156v4H89Z" fill="#11243e" />
        </>
      );
    case 'sign':
      return (
        <>
          <path d="m63 80 242-4 1 162-242 4Z" fill={NAVY} opacity=".08" />
          <g transform="rotate(-4 180 150)">
            <rect x="54" y="68" width="252" height="163" rx="4" fill="#d9cebb" />
            <rect x="52" y="65" width="252" height="163" rx="4" fill="#f7f2e8" stroke="#e1d6c5" />
            {[[63, 76], [293, 76], [63, 217], [293, 217]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#a3967f" />)}
            <QrPattern x={75} y={96} size={99} />
            <path d="M197 100h24" stroke={RED} strokeWidth="2" />
            <text x="195" y="130" fill={NAVY} fontFamily="Georgia, serif" fontSize="19">{locale === 'ua' ? 'Ваше' : 'A warm'}</text>
            <text x="195" y="154" fill={NAVY} fontFamily="Georgia, serif" fontSize="19">{locale === 'ua' ? 'меню.' : 'welcome.'}</text>
            <text x="196" y="184" fill={NAVY} fontSize="6.5" letterSpacing=".8">{t.scan}</text>
          </g>
        </>
      );
    case 'glass':
      return (
        <>
          <ellipse cx="182" cy="264" rx="102" ry="11" fill={NAVY} opacity=".07" />
          <path d="m88 249 39-14h116l37 15-26 9H100Z" fill="#dde5e3" stroke="#bdcecc" />
          <path d="M103 40h158v207H103Z" fill="#fafffe" fillOpacity=".64" stroke="#b4c9c8" strokeWidth="1.5" />
          <path d="M106 42h152v202H106Z" fill="none" stroke="white" strokeWidth="2" />
          <path d="m111 44 40 0-40 89Zm147 158v40h-38Z" fill="white" opacity=".65" />
          <text x="182" y="81" textAnchor="middle" fill={NAVY} fontFamily="Georgia, serif" fontSize="24">{t.welcome}</text>
          <rect x="128" y="102" width="108" height="108" fill={PAPER} fillOpacity=".8" />
          <QrPattern x={138} y={112} size={88} />
          <text x="182" y="229" textAnchor="middle" fill={NAVY} fontSize="6.5" letterSpacing="1.1">{t.scan}</text>
          <path d="M108 250h148" stroke="white" strokeWidth="1.5" />
        </>
      );
    case 'card':
      return (
        <>
          <ellipse cx="180" cy="246" rx="130" ry="13" fill={NAVY} opacity=".06" />
          <g transform="rotate(-9 180 150)">
            <rect x="57" y="94" width="251" height="143" rx="4" fill="#d9d0bd" />
            <rect x="50" y="83" width="251" height="143" rx="4" fill="#efeadf" stroke="#ded5c5" />
            <rect x="47" y="78" width="251" height="143" rx="4" fill={PAPER} stroke="#e4dccb" />
            <path d="M70 103h25" stroke={RED} strokeWidth="2" />
            <text x="69" y="140" fill={NAVY} fontFamily="Georgia, serif" fontSize="21">{t.name}</text>
            <text x="70" y="160" fill={NAVY} fontSize="6" letterSpacing=".6">{t.role}</text>
            <text x="70" y="197" fill={NAVY} fontSize="6.5">qr-helper.com</text>
            <QrPattern x={204} y={112} size={69} />
          </g>
        </>
      );
    case 'poster':
      return (
        <>
          <path d="m118 34 146-6 10 244-146 6Z" fill={NAVY} opacity=".09" />
          <g transform="rotate(-3 180 150)">
            <rect x="102" y="24" width="156" height="244" fill="#e5dccb" />
            <rect x="99" y="21" width="156" height="244" fill={PAPER} stroke="#e6dfd2" />
            <rect x="99" y="21" width="156" height="10" fill={RED} />
            <text x="116" y="64" fill={NAVY} fontSize="6" letterSpacing="1.5">QR HELPER / 01</text>
            <text x="116" y="96" fill={NAVY} fontFamily="Georgia, serif" fontSize="24">{t.open}</text>
            <text x="116" y="123" fill={NAVY} fontFamily="Georgia, serif" fontSize="24">{t.more}</text>
            <QrPattern x={129} y={146} size={95} />
            <text x="177" y="253" textAnchor="middle" fill={NAVY} fontSize="6" letterSpacing="1">{t.scan}</text>
          </g>
        </>
      );
    case 'qr_nfc':
      return (
        <>
          <ellipse cx="180" cy="251" rx="96" ry="11" fill={NAVY} opacity=".07" />
          <g transform="rotate(-8 180 143)">
            <circle cx="181" cy="145" r="101" fill="#11253f" />
            <circle cx="179" cy="141" r="100" fill={NAVY} />
            <circle cx="179" cy="141" r="90" stroke={PAPER} strokeOpacity=".35" fill="none" strokeWidth=".6" />
            <text x="179" y="83" textAnchor="middle" fill={PAPER} fontSize="7" letterSpacing="1.8">QR + NFC</text>
            <rect x="123" y="105" width="88" height="88" rx="2" fill={PAPER} />
            <QrPattern x={131} y={113} size={72} />
            <g transform="translate(224 127)" fill="none" stroke={PAPER} strokeWidth="1.6" strokeLinecap="round">
              <path d="M0 8a10 10 0 0 1 0 14M5 3a17 17 0 0 1 0 24m5-29a24 24 0 0 1 0 34" />
            </g>
            <text x="179" y="217" textAnchor="middle" fill={PAPER} fontSize="6.5" letterSpacing=".8">{t.scan}</text>
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

/** A still life of physical products, drawn with flat inks, paper edges, and acrylic reflections. */
export function HeroProducts({ locale }: { locale: Locale }) {
  const t = text[locale];
  return (
    <svg viewBox="0 0 600 600" width="600" height="600" fill="none" aria-hidden="true" focusable="false" className="hero-products-art">
      <circle cx="320" cy="294" r="233" fill="#efeade" />
      <path d="M37 482 362 409l207 82-308 85Z" fill="#e8e1d3" />
      <path d="m37 482 224 94v7L37 490Z" fill="#ddd4c3" />
      <path d="m261 576 308-85v7l-308 85Z" fill="#d4c9b6" />
      <ellipse cx="312" cy="495" rx="163" ry="23" fill={NAVY} opacity=".06" />

      <g transform="rotate(8 450 295)">
        <path d="m386 398 28-12h107l22 12-25 8H393Z" fill="#d0dcda" stroke="#b8c9c6" />
        <path d="M392 150h141v244H392Z" fill="#fffef9" fillOpacity=".53" stroke="#b1c5c3" strokeWidth="1.4" />
        <path d="M396 154h133v235H396Z" fill="none" stroke="white" strokeWidth="1.5" />
        <path d="M399 158h37l-37 95Zm128 151v77h-29Z" fill="white" opacity=".6" />
        <text x="462" y="194" textAnchor="middle" fill={NAVY} fontFamily="Georgia, serif" fontSize="23">{t.welcome}</text>
        <Wifi x={449} y={211} size={27} />
        <rect x="416" y="254" width="93" height="93" fill={PAPER} fillOpacity=".8" />
        <QrPattern x={426} y={264} size={73} />
        <text x="463" y="372" textAnchor="middle" fill={NAVY} fontSize="6.5" letterSpacing=".9">{t.scan}</text>
        <path d="M394 398h125" stroke="white" strokeWidth="2" />
      </g>

      <g transform="rotate(-8 275 329)">
        <path d="M285 160h76l74 315h-49Z" fill="#b5a58d" />
        <path d="m342 163 70 310h23L361 160Z" fill="#c6b9a4" />
        <path d="M184 161q1-7 8-7h157q7 0 8 7l35 311q1 7-7 7H157q-7 0-6-7Z" fill="#122943" />
        <path d="M181 158q1-7 8-7h157q7 0 8 7l35 310q1 7-7 7H154q-7 0-6-7Z" fill={NAVY} />
        <path d="M190 163h147l34 298H164Z" stroke={PAPER} strokeOpacity=".22" strokeWidth=".8" />
        <text x="266" y="204" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="26">{t.reviews}</text>
        <text x="266" y="235" textAnchor="middle" fill={PAPER} fontFamily="Georgia, serif" fontSize="26">{t.matters}</text>
        <path d="M248 253h36" stroke={RED} strokeWidth="2.5" />
        <rect x="198" y="278" width="136" height="136" rx="2" fill={PAPER} />
        <QrPattern x={210} y={290} size={112} />
        <Stars x={230} y={430} size={10} color="#f7f0df" />
        <text x="266" y="455" textAnchor="middle" fill={PAPER} fontSize="7" letterSpacing="1.5">{t.google}</text>
        <path d="M150 472h237v4H150Z" fill="#10253e" />
      </g>

      <g transform="rotate(11 126 459)">
        <path d="M48 388h158v154H48Z" fill={NAVY} opacity=".07" />
        <path d="M45 381h153a5 5 0 0 1 5 5v133l-22 22H45a5 5 0 0 1-5-5V386a5 5 0 0 1 5-5Z" fill="#f8f0de" stroke="#daceb8" />
        <path d="M49 391h145v132l-10 9H49Z" stroke={NAVY} strokeOpacity=".3" strokeWidth=".6" />
        <text x="121" y="408" textAnchor="middle" fill={NAVY} fontSize="8.5" fontWeight="600" letterSpacing="1.3">{t.wifi}</text>
        <QrPattern x={78} y={424} size={86} />
        <text x="121" y="526" textAnchor="middle" fill={NAVY} fontSize="5.5" letterSpacing=".8">{t.scan}</text>
        <path d="M181 541v-17q0-5 5-5h17Z" fill="#fffdf5" stroke="#d8cbb4" strokeWidth=".8" />
      </g>

      <g transform="rotate(14 439 431)">
        <rect x="384" y="310" width="117" height="239" rx="21" fill={NAVY} opacity=".1" />
        <rect x="377" y="303" width="117" height="239" rx="21" fill="#15283b" />
        <rect x="380" y="306" width="111" height="233" rx="18" fill="#eeeae0" stroke="#a5aaa8" strokeWidth="1.2" />
        <rect x="384" y="310" width="103" height="225" rx="15" fill="#f8f5ef" />
        <path d="M414 310h44v6a6 6 0 0 1-6 6h-32a6 6 0 0 1-6-6Z" fill="#15283b" />
        <path d="M377 350v24m117-24v37" stroke="#727d80" strokeWidth="2" />
        <text x="435.5" y="346" textAnchor="middle" fill={NAVY} fontSize="7.5" fontWeight="500">{locale === 'ua' ? 'Камера' : 'Camera'}</text>
        <rect x="390" y="360" width="91" height="120" rx="3" fill="#e6e0d4" />
        <path d="m399 376 70 8-5 75-70-8Z" fill={NAVY} />
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
