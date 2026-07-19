'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { buildPayload, type StickerType, type StickerValue } from '@/lib/qr/payloads';
import type { DesignColors, StickerShape } from '@/lib/stickers/catalog';

export interface StickerDesignProps {
  type: StickerType;
  value: StickerValue;
  shape: StickerShape;
  colors: DesignColors;
  label: string;
  subtitle?: string;
  icon: string;
  /** Ширина в пикселях (высота — по пропорции формы). */
  width?: number;
  className?: string;
}

/** Разбивает надпись максимум на 2 строки по ~maxChars символов. */
function wrapLabel(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > maxChars) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > 2) {
    return [lines[0], lines.slice(1).join(' ')];
  }
  return lines;
}

/** Живой макет наклейки (SVG): форма + цвета + надпись + значок + QR. */
export function StickerDesign({
  type,
  value,
  shape,
  colors,
  label,
  subtitle,
  icon,
  width = 260,
  className = '',
}: StickerDesignProps) {
  const [qr, setQr] = useState<string | null>(null);

  const valueKey = typeof value === 'string' ? value : JSON.stringify(value);

  useEffect(() => {
    let cancelled = false;
    let payload = '';
    try {
      payload = buildPayload(type, value);
    } catch {
      setQr(null);
      return;
    }
    QRCode.toDataURL(payload, {
      margin: 1,
      scale: 8,
      errorCorrectionLevel: 'M',
      color: { dark: colors.qr, light: colors.bg },
    })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, valueKey, colors.qr, colors.bg]);

  const geom = SHAPES[shape];
  const lines = wrapLabel(label, geom.maxChars);
  const height = width * (geom.h / geom.w);

  return (
    <svg
      viewBox={`0 0 ${geom.w} ${geom.h}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={label}
    >
      {geom.frame(colors)}

      {/* Значок */}
      <text
        x={geom.w / 2}
        y={geom.iconY}
        textAnchor="middle"
        fontSize={geom.iconSize}
      >
        {icon}
      </text>

      {/* Надпись (1–2 строки) */}
      <text
        x={geom.w / 2}
        y={geom.labelY}
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize={geom.labelSize}
        fill={colors.text}
      >
        {lines.map((ln, i) => (
          <tspan key={i} x={geom.w / 2} dy={i === 0 ? 0 : geom.labelSize * 1.1}>
            {ln}
          </tspan>
        ))}
      </text>

      {/* QR */}
      {qr ? (
        <image
          href={qr}
          x={(geom.w - geom.qr) / 2}
          y={geom.qrY}
          width={geom.qr}
          height={geom.qr}
        />
      ) : (
        <rect
          x={(geom.w - geom.qr) / 2}
          y={geom.qrY}
          width={geom.qr}
          height={geom.qr}
          rx={8}
          fill="none"
          stroke={colors.frame}
          strokeOpacity={0.25}
          strokeDasharray="6 6"
        />
      )}

      {/* Подпись под QR */}
      {subtitle ? (
        <text
          x={geom.w / 2}
          y={geom.subY}
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fontSize={geom.subSize}
          fill={colors.frame}
        >
          {subtitle}
        </text>
      ) : null}
    </svg>
  );
}

interface Geom {
  w: number;
  h: number;
  maxChars: number;
  iconY: number;
  iconSize: number;
  labelY: number;
  labelSize: number;
  qr: number;
  qrY: number;
  subY: number;
  subSize: number;
  frame: (c: DesignColors) => React.ReactNode;
}

const SHAPES: Record<StickerShape, Geom> = {
  rect: {
    w: 300,
    h: 380,
    maxChars: 14,
    iconY: 58,
    iconSize: 34,
    labelY: 98,
    labelSize: 24,
    qr: 150,
    qrY: 140,
    subY: 336,
    subSize: 20,
    frame: (c) => (
      <rect
        x={6}
        y={6}
        width={288}
        height={368}
        rx={22}
        fill={c.bg}
        stroke={c.frame}
        strokeWidth={6}
      />
    ),
  },
  circle: {
    w: 340,
    h: 340,
    maxChars: 14,
    iconY: 74,
    iconSize: 30,
    labelY: 108,
    labelSize: 22,
    qr: 140,
    qrY: 140,
    subY: 300,
    subSize: 18,
    frame: (c) => (
      <circle cx={170} cy={170} r={164} fill={c.bg} stroke={c.frame} strokeWidth={6} />
    ),
  },
  phone: {
    w: 250,
    h: 430,
    maxChars: 12,
    iconY: 100,
    iconSize: 28,
    labelY: 134,
    labelSize: 20,
    qr: 130,
    qrY: 172,
    subY: 340,
    subSize: 16,
    frame: (c) => (
      <>
        <rect
          x={10}
          y={10}
          width={230}
          height={410}
          rx={36}
          fill={c.bg}
          stroke={c.frame}
          strokeWidth={6}
        />
        <rect x={100} y={28} width={50} height={8} rx={4} fill={c.frame} />
        <circle cx={125} cy={400} r={12} fill="none" stroke={c.frame} strokeWidth={3} />
      </>
    ),
  },
};
