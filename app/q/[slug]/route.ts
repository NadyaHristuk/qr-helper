import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidSlug } from '@/lib/dynamic-qr/slug';
import { serviceOrigins, validateDestination } from '@/lib/dynamic-qr/destination';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isValidSlug(slug)) return new NextResponse(null, { status: 404, headers });

  try {
    const qr = await prisma.dynamicQr.findUnique({ where: { slug } });
    if (!qr) return new NextResponse(null, { status: 404, headers });
    if (!qr.active) return new NextResponse(null, { status: 410, headers });

    let destination: string;
    try {
      destination = validateDestination(qr.targetUrl, serviceOrigins(request));
    } catch {
      // Fail closed if a record was altered outside the validated admin API.
      return new NextResponse(null, { status: 410, headers });
    }
    return new NextResponse(null, { status: 302, headers: { ...headers, Location: destination } });
  } catch {
    // Do not log Prisma errors: they can include destination values.
    console.error('Dynamic QR lookup failed');
    return new NextResponse(null, { status: 503, headers });
  }
}
