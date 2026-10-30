import { isSameOriginRequest, forbiddenOrigin } from '@/lib/admin-origin';
import { readJson } from '@/lib/request-json';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

const STATUS_VALUES = [
  'created',
  'confirmed',
  'in_production',
  'ready',
  'shipped',
  'completed',
  'cancelled',
] as const;

const updateSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(STATUS_VALUES),
});

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ orders }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSameOriginRequest(request)) return forbiddenOrigin();

  const parsed = updateSchema.safeParse(await readJson(request).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ order }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    throw error;
  }
}
