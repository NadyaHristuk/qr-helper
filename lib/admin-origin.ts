import { NextResponse } from 'next/server';

// No proxy/forwarded headers: compare the browser's Origin with this request URL.
// Missing Origin is rejected too; API clients must send it explicitly.
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try {
    return new URL(origin).origin === origin && origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function forbiddenOrigin() {
  return NextResponse.json({ error: 'Forbidden origin' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
}
