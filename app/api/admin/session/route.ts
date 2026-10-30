import { isSameOriginRequest, forbiddenOrigin } from '@/lib/admin-origin';
import { readJson } from '@/lib/request-json';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ADMIN_COOKIE_NAME,
  adminSessionToken,
  isValidAdminPassword,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return forbiddenOrigin();
  const parsed = z.object({ password: z.string().max(1024) }).safeParse(await readJson(request).catch(() => null));
  const password = parsed.success ? parsed.data.password : '';

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = adminSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) return forbiddenOrigin();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
