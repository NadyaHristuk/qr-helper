import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { isSameOriginRequest, forbiddenOrigin } from '@/lib/admin-origin';
import { readJson } from '@/lib/request-json';
import { prisma } from '@/lib/db';
import { createDynamicQr } from '@/lib/dynamic-qr/service';
import { serviceOrigins, validateDestination } from '@/lib/dynamic-qr/destination';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
const createSchema = z.object({ targetUrl: z.string().min(1).max(2048) }).strict();

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const cursor = request.nextUrl.searchParams.get('cursor');
  if (cursor && !z.string().cuid().safeParse(cursor).success) {
    return NextResponse.json({ error: 'Invalid cursor' }, { status: 400, headers });
  }
  try {
    const records = await prisma.dynamicQr.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 101,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const dynamicQrs = records.slice(0, 100);
    return NextResponse.json({ dynamicQrs, nextCursor: records.length > 100 ? dynamicQrs[99].id : null }, { headers });
  } catch {
    console.error('Dynamic QR list failed');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503, headers });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (!isSameOriginRequest(request)) return forbiddenOrigin();
  const parsed = createSchema.safeParse(await readJson(request).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers });

  let targetUrl: string;
  try {
    targetUrl = validateDestination(parsed.data.targetUrl, serviceOrigins(request));
  } catch {
    return NextResponse.json({ error: 'Invalid destination' }, { status: 400, headers });
  }
  try {
    const dynamicQr = await createDynamicQr(targetUrl);
    return NextResponse.json({ dynamicQr }, { status: 201, headers });
  } catch {
    console.error('Dynamic QR creation failed');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503, headers });
  }
}
