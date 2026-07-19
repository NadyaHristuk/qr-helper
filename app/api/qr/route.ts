import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { z } from 'zod';
import {
  buildPayload,
  PayloadError,
  STICKER_TYPES,
  type StickerType,
  type StickerValue,
} from '@/lib/qr/payloads';

/**
 * GET /api/qr?type=<StickerType>&scale=<n>&...поля значения
 *
 * Отдаёт PNG QR-кода наклейки. Форма полей значения зависит от типа:
 *  - wifi:   ssid, password, security?, hidden?
 *  - vcard:  name, company?, phone?, email?, address?, site?, notes?
 *  - email:  value|email, subject?
 *  - sms:    value|phone, message?
 *  - остальные: value
 */

const querySchema = z.object({
  type: z.enum(STICKER_TYPES),
  scale: z.coerce.number().int().min(1).max(20).optional().default(8),
});

/** Собирает StickerValue из query-параметров под конкретный тип наклейки. */
function valueFromParams(type: StickerType, params: URLSearchParams): StickerValue {
  switch (type) {
    case 'wifi': {
      const security = params.get('security');
      return {
        ssid: params.get('ssid') ?? '',
        password: params.get('password') ?? undefined,
        security:
          security === 'WPA' || security === 'WEP' || security === 'nopass'
            ? security
            : undefined,
        hidden: params.get('hidden') === 'true' || undefined,
      };
    }
    case 'vcard':
      return {
        name: params.get('name') ?? '',
        company: params.get('company') ?? undefined,
        phone: params.get('phone') ?? undefined,
        email: params.get('email') ?? undefined,
        address: params.get('address') ?? undefined,
        site: params.get('site') ?? undefined,
        notes: params.get('notes') ?? undefined,
      };
    case 'email':
      return {
        email: params.get('email') ?? params.get('value') ?? '',
        subject: params.get('subject') ?? undefined,
      };
    case 'sms':
      return {
        phone: params.get('phone') ?? params.get('value') ?? '',
        message: params.get('message') ?? undefined,
      };
    default:
      return params.get('value') ?? '';
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const parsed = querySchema.safeParse({
    type: params.get('type'),
    scale: params.get('scale') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Неверные параметры запроса', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const value = valueFromParams(parsed.data.type, params);
    const payload = buildPayload(parsed.data.type, value);

    const png = await QRCode.toBuffer(payload, {
      type: 'png',
      scale: parsed.data.scale,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#101828', light: '#ffffff' },
    });

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    if (err instanceof PayloadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('QR generation failed:', err);
    return NextResponse.json({ error: 'Не удалось сгенерировать QR-код' }, { status: 500 });
  }
}
