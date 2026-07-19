'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { buildPayload, PayloadError, type StickerType, type StickerValue } from '@/lib/qr/payloads';

/**
 * Живое превью наклейки с настоящим QR-кодом. Генерит data-URL прямо в
 * браузере через пакет `qrcode` (тот же payload-формат, что и на бэкенде).
 */
export function QrPreview({
  type,
  value,
  size = 128,
  className = '',
}: {
  type: StickerType;
  value: StickerValue;
  size?: number;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // Строку значения сериализуем для зависимости useEffect.
  const valueKey = typeof value === 'string' ? value : JSON.stringify(value);

  useEffect(() => {
    let cancelled = false;
    try {
      const payload = buildPayload(type, value);
      QRCode.toDataURL(payload, {
        margin: 2,
        scale: 8,
        errorCorrectionLevel: 'M',
        color: { dark: '#101828', light: '#ffffff' },
      })
        .then((url) => {
          if (!cancelled) {
            setDataUrl(url);
            setError(false);
          }
        })
        .catch(() => !cancelled && setError(true));
    } catch (err) {
      // Пустое/некорректное значение — просто не показываем код.
      if (err instanceof PayloadError) setError(true);
      else throw err;
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, valueKey]);

  if (error || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-300 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg width="40%" height="40%" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm0 4h3v4h-2v-2h-1v-2zm-5-4h3v3h-2v-1h-1v-2zm0 5h2v3h-2v-3z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="QR"
      width={size}
      height={size}
      className={`rounded-lg ${className}`}
    />
  );
}
