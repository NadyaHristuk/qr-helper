import { randomBytes } from 'node:crypto';

// 96 random bits, exposed separately from the internal database ID.
export function generateSlug(): string {
  return randomBytes(12).toString('base64url');
}

export function isValidSlug(value: string): boolean {
  return value.length === 16 && /^[A-Za-z0-9_-]{16}$/.test(value);
}
