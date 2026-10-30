import { readJson, invalidJson } from '@/lib/request-json';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { z } from 'zod';
import {
  buildPayload,
  PayloadError,
  STICKER_TYPES,
  type StickerValue,
} from '@/lib/qr/payloads';

/**
 * POST /api/qr
 * Body: { type: StickerType, value: StickerValue, scale?: number }
 *
 * Sensitive QR values must not be sent in query parameters.
 */
const bodySchema = z.object({
  type: z.enum(STICKER_TYPES),
  value: z.union([z.string().max(2000), z.record(z.string(), z.unknown())]),
  scale: z.number().int().min(1).max(20).optional().default(8),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return invalidJson();
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Неверные параметры запроса', details: parsed.error.flatten() },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const payload = buildPayload(
      parsed.data.type,
      parsed.data.value as StickerValue,
    );

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
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    if (err instanceof PayloadError) {
      return NextResponse.json({ error: err.message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    console.error('QR generation failed:', err);
    return NextResponse.json(
      { error: 'Не удалось сгенерировать QR-код' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
