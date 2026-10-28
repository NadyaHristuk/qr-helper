import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'qr-helper-admin';

function adminSecret(): string {
  return process.env.ADMIN_PASSWORD ?? '';
}

function tokenFor(secret: string): string {
  return createHash('sha256').update(`qr-helper:${secret}`).digest('hex');
}

export function isValidAdminPassword(password: string): boolean {
  const expected = adminSecret();
  if (!expected || !password) return false;

  const a = Buffer.from(tokenFor(password));
  const b = Buffer.from(tokenFor(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = adminSecret();
  if (!secret) return false;

  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === tokenFor(secret);
}

export function adminSessionToken(): string | null {
  const secret = adminSecret();
  return secret ? tokenFor(secret) : null;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
