import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { isSameOriginRequest, forbiddenOrigin } from '@/lib/admin-origin';
import { readJson } from '@/lib/request-json';
import { prisma } from '@/lib/db';
import { serviceOrigins, validateDestination } from '@/lib/dynamic-qr/destination';

const headers = { 'Cache-Control': 'no-store' };
const updateSchema = z.object({
  targetUrl: z.string().min(1).max(2048).optional(),
  active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (!isSameOriginRequest(request)) return forbiddenOrigin();
  const { id } = await params;
  const parsed = updateSchema.safeParse(await readJson(request).catch(() => null));
  if (!z.string().cuid().safeParse(id).success || !parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers });
  }
  const data = { ...parsed.data };
  if (data.targetUrl !== undefined) {
    try {
      data.targetUrl = validateDestination(data.targetUrl, serviceOrigins(request));
    } catch {
      return NextResponse.json({ error: 'Invalid destination' }, { status: 400, headers });
    }
  }
  try {
    const dynamicQr = await prisma.dynamicQr.update({ where: { id }, data });
    return NextResponse.json({ dynamicQr }, { headers });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Dynamic QR not found' }, { status: 404, headers });
    }
    console.error('Dynamic QR update failed');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503, headers });
  }
}
