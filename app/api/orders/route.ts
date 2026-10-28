import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { priceForTemplate } from '@/lib/pricing';
import { buildPayload, PayloadError, STICKER_TYPES } from '@/lib/qr/payloads';

const itemSchema = z.object({
  type: z.enum(STICKER_TYPES),
  value: z.union([z.string().max(2000), z.record(z.string(), z.unknown())]),
  label: z.string().trim().max(80).optional(),
  subtitle: z.string().trim().max(120).optional(),
  icon: z.string().max(16).optional(),
  shape: z.enum(['rect', 'circle', 'phone']).optional(),
  template: z.enum(['standard', 'individual']).optional(),
  colors: z.record(z.string(), z.string()).optional(),
  productType: z.enum(['sticker', 'vinyl', 'transparent', 'sign', 'stand', 'poster', 'business_card', 'qr_nfc']).default('sticker'),
  size: z.enum(['S', 'M', 'L']).default('M'),
  quantity: z.number().int().min(1).max(999).default(1),
});

const phoneSchema = z
  .string()
  .trim()
  .min(10, 'Укажите телефон')
  .max(24, 'Слишком длинный номер телефона')
  .refine((value) => /^\+?[\d\s().-]{10,24}$/.test(value), 'Проверьте формат телефона');

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1, 'Укажите имя').max(120),
    phone: phoneSchema,
    city: z.string().trim().min(1, 'Укажите город').max(120),
    npOffice: z.string().trim().min(1, 'Укажите отделение Новой Почты').max(120),
    note: z.string().trim().max(500).optional().default(''),
  }),
  template: z.enum(['standard', 'individual']),
  deliveryMethod: z.enum(['nova_poshta', 'pickup', 'courier']).default('nova_poshta'),
  paymentMethod: z.enum(['manager', 'online']).default('manager'),
  items: z.array(itemSchema).min(1, 'Добавьте хотя бы одну наклейку').max(50, 'Слишком много позиций в одном заказе'),
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
    return NextResponse.json({ error: 'Проверьте заполнение формы', details: parsed.error.flatten() }, { status: 400 });
  }

  const { customer, template, deliveryMethod, paymentMethod, items } = parsed.data;

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
      customerNote: customer.note,
      deliveryMethod,
      paymentMethod,
      itemsJson: JSON.stringify(items),
    },
  });

  return NextResponse.json({ id: order.id, priceKop: order.priceKop, status: order.status }, { status: 201 });
}
