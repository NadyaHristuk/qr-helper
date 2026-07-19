import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { priceForTemplate } from '@/lib/pricing';
import { buildPayload, PayloadError, STICKER_TYPES } from '@/lib/qr/payloads';

/**
 * POST /api/orders — создать заказ.
 * Тело: {
 *   customer: { name, phone, city, npOffice },
 *   template: 'standard' | 'individual',
 *   items: [{ type: StickerType, value: string | object }]  // минимум 1
 * }
 * Ответ 201: { id, priceKop, status }
 *
 * GET /api/orders — список заказов (для будущей админки), новые сверху.
 */

const itemSchema = z.object({
  type: z.enum(STICKER_TYPES),
  value: z.union([z.string(), z.record(z.string(), z.unknown())]),
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, 'Укажите имя'),
    phone: z.string().trim().min(3, 'Укажите телефон'),
    city: z.string().trim().min(1, 'Укажите город'),
    npOffice: z.string().trim().min(1, 'Укажите отделение Новой Почты'),
  }),
  template: z.enum(['standard', 'individual']),
  items: z.array(itemSchema).min(1, 'Добавьте хотя бы одну наклейку'),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Проверьте заполнение формы', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { customer, template, items } = parsed.data;

  // Проверяем, что из каждой наклейки собирается корректный QR-payload.
  try {
    for (const item of items) {
      buildPayload(item.type, item.value as never);
    }
  } catch (err) {
    if (err instanceof PayloadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const priceKop = priceForTemplate(template);

  const order = await prisma.order.create({
    data: {
      status: 'created',
      template,
      priceKop,
      customerName: customer.name,
      customerPhone: customer.phone,
      city: customer.city,
      npOffice: customer.npOffice,
      itemsJson: JSON.stringify(items),
    },
  });

  return NextResponse.json(
    { id: order.id, priceKop: order.priceKop, status: order.status },
    { status: 201 },
  );
}

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(
    orders.map((o) => ({ ...o, items: JSON.parse(o.itemsJson) })),
  );
}
