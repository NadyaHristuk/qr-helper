const MAX_URL_LENGTH = 2048;
const DEFAULT_ORIGIN = 'https://qr-helper-two.vercel.app';

export function canonicalPublicOrigin(): string | undefined {
  const raw = process.env.APP_URL ?? (process.env.VERCEL ? DEFAULT_ORIGIN : undefined);
  if (!raw) return undefined;
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('APP_URL must be an HTTPS origin');
  }
  return url.origin;
}

export function serviceOrigins(request: Request): string[] {
  return [
    new URL(request.url).origin,
    DEFAULT_ORIGIN,
    ...(process.env.APP_URL ? [process.env.APP_URL] : []),
    ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
      .filter((host): host is string => Boolean(host)).map((host) => `https://${host}`),
    ...(process.env.DYNAMIC_QR_SERVICE_ORIGINS ?? '').split(',').filter(Boolean),
  ];
}

function hostname(raw: string): string {
  return new URL(raw).hostname.toLowerCase().replace(/\.$/, '');
}

function decodedPath(path: string): string {
  // Reject encoded aliases of our redirect route as well as literal /q paths.
  for (let count = 0; count < 8; count++) {
    const decoded = decodeURIComponent(path.replace(/%(?![0-9a-f]{2})/ig, '%25'));
    if (decoded === path) return new URL(path.replace(/\\/g, '/').replace(/\/+/g, '/'), DEFAULT_ORIGIN).pathname;
    path = decoded;
  }
  throw new Error('Invalid destination');
}

export function validateDestination(raw: string, origins: string[]): string {
  if (!raw || raw.length > MAX_URL_LENGTH || /[\u0000-\u0020\u007f]/.test(raw) || /%0[ad]/i.test(raw) || raw.includes('\\')) {
    throw new Error('Invalid destination');
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Invalid destination');
  }
  if (!/^https:\/\//i.test(raw) || url.protocol !== 'https:' || !url.hostname || url.username || url.password || /^https:\/\/[^/?#]*@/i.test(raw)) {
    throw new Error('Invalid destination');
  }
  const ownHosts = new Set(origins.map(hostname));
  if (ownHosts.has(hostname(url.href)) && /^\/q(?:\/|$)/i.test(decodedPath(url.pathname))) {
    throw new Error('Invalid destination');
  }
  if (url.href.length > MAX_URL_LENGTH) throw new Error('Invalid destination');
  return url.href;
}
