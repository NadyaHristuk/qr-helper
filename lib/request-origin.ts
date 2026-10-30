// Next.js may build request.url from the listen address (e.g. 0.0.0.0),
// while Host contains the authority actually addressed by the browser.
// Forwarded host headers are intentionally ignored.
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get('host');
  if (!host) return url.origin;
  if (/[\s/\\@,?#]/.test(host)) throw new Error('Invalid Host');
  return new URL(`${url.protocol}//${host}`).origin;
}
