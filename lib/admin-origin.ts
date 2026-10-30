import { NextResponse } from 'next/server';
import { requestOrigin } from './request-origin';

// Compare the browser's Origin with the addressed request origin.
// Missing Origin is rejected too; API clients must send it explicitly.
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try {
    return new URL(origin).origin === origin && origin === requestOrigin(request);
  } catch {
    return false;
  }
}

export function forbiddenOrigin() {
  return NextResponse.json({ error: 'Forbidden origin' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
}
