const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');

const projectRoot = path.resolve(__dirname, '..');

// Compile the real handlers and utilities while keeping all database access in
// memory. Each loader has its own cache so auth and persistence mocks cannot
// leak from one test to another.
function createLoader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    const absolute = path.resolve(projectRoot, filename);
    const relative = path.relative(projectRoot, absolute).split(path.sep).join('/');
    if (Object.hasOwn(mocks, relative)) return mocks[relative];
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const module = new Module(absolute);
    module.filename = absolute;
    module.paths = Module._nodeModulePaths(path.dirname(absolute));
    cache.set(absolute, module);
    const nativeRequire = module.require.bind(module);
    module.require = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      const local = name.startsWith('@/')
        ? path.resolve(projectRoot, name.slice(2))
        : name.startsWith('.') ? path.resolve(path.dirname(absolute), name) : null;
      if (local) {
        const candidate = [local, `${local}.ts`, path.join(local, 'index.ts')]
          .find((entry) => fs.existsSync(entry) && fs.statSync(entry).isFile());
        if (candidate?.endsWith('.ts')) return load(candidate);
      }
      return nativeRequire(name);
    };
    module._compile(ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText, absolute);
    return module.exports;
  }
  return load;
}

const origin = 'https://qr-helper.example';
const collectionPath = '/api/admin/dynamic-qr';
const validSlug = 'A1b2C3d4E5f6G7h8';
const originalTarget = 'https://example.com/menu?lang=uk';
const internalId = 'cl9ebq9ff00003b6u4p8c5x1z';

function request(urlPath, { method = 'GET', body, originHeader = origin, headers = {} } = {}) {
  return new NextRequest(`${origin}${urlPath}`, {
    method,
    headers: {
      ...(originHeader === null ? {} : { origin: originHeader }),
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
  });
}

function params(name, value) {
  return { params: Promise.resolve({ [name]: value }) };
}

class KnownRequestError extends Error {
  constructor(message, { code, meta } = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

function harness({ authenticated = true, records = [] } = {}) {
  const stored = new Map(records.map((record) => [record.id, { ...record }]));
  const calls = { findUnique: [], findMany: [], create: [], update: [] };
  const dynamicQr = {
    async findUnique(input) {
      calls.findUnique.push(input);
      return [...stored.values()].find((record) => Object.entries(input.where).every(([key, value]) => record[key] === value)) ?? null;
    },
    async findMany(input) {
      calls.findMany.push(input);
      return [...stored.values()];
    },
    async create(input) {
      calls.create.push(input);
      const record = {
        id: `created-id-${calls.create.length}`,
        active: true,
        createdAt: new Date('2026-10-30T10:00:00.000Z'),
        updatedAt: new Date('2026-10-30T10:00:00.000Z'),
        ...input.data,
      };
      stored.set(record.id, record);
      return record;
    },
    async update(input) {
      calls.update.push(input);
      const previous = stored.get(input.where.id);
      if (!previous) throw new KnownRequestError('Not found', { code: 'P2025' });
      const record = { ...previous, ...input.data };
      stored.set(record.id, record);
      return record;
    },
  };
  const load = createLoader({
    '@/lib/db': { prisma: { dynamicQr } },
    '@/lib/admin-auth': { isAdminAuthenticated: async () => authenticated },
    '@prisma/client': { Prisma: { PrismaClientKnownRequestError: KnownRequestError } },
  });
  return { stored, calls, dynamicQr, load };
}

function record(overrides = {}) {
  return {
    id: internalId,
    slug: validSlug,
    targetUrl: originalTarget,
    active: true,
    createdAt: new Date('2026-10-30T09:00:00.000Z'),
    updatedAt: new Date('2026-10-30T09:00:00.000Z'),
    ...overrides,
  };
}

test('dynamic slugs are URL-safe, fixed length and distinct across repeated generation', () => {
  const { generateSlug, isValidSlug } = createLoader()('lib/dynamic-qr/slug.ts');
  const slugs = new Set();
  for (let i = 0; i < 1_000; i++) {
    const slug = generateSlug();
    assert.match(slug, /^[A-Za-z0-9_-]{16}$/);
    assert.equal(isValidSlug(slug), true);
    slugs.add(slug);
  }
  assert.equal(slugs.size, 1_000);
  for (const invalid of ['', 'short', 'a'.repeat(15), 'a'.repeat(17), 'a'.repeat(15) + '/', 'a'.repeat(15) + ' ', '../' + 'a'.repeat(13), 'é'.repeat(16), 'a'.repeat(16) + '\n']) {
    assert.equal(isValidSlug(invalid), false, invalid);
  }
});

test('destination validation accepts HTTPS destinations and preserves paths and query strings', () => {
  const { validateDestination } = createLoader()('lib/dynamic-qr/destination.ts');
  for (const target of ['https://example.com', 'https://example.com/path?q=1', 'https://example.com/q/external', 'https://example.com/100%25', `${origin}/catalog`]) {
    assert.equal(validateDestination(target, [origin]), new URL(target).href);
  }
});

test('destination validation rejects unsafe schemes, credentials, CR/LF and oversized URLs', () => {
  const { validateDestination } = createLoader()('lib/dynamic-qr/destination.ts');
  for (const target of [
    '', 'example.com', '/relative', '//example.com',
    'http://example.com', 'javascript:alert(1)', 'data:text/html,test',
    'file:///etc/passwd', 'ftp://example.com/file',
    'https://user:pass@example.com', 'https://user@example.com', 'https://@example.com',
    'https://example.com\\path',
    'https://example.com/\r\nLocation: https://evil.example',
    'https://example.com/path\n',
    `https://example.com/${'x'.repeat(2_048)}`,
  ]) {
    assert.throws(() => validateDestination(target, [origin]), Error, target);
  }
});

test('destination validation blocks redirect loops across service aliases', () => {
  const { validateDestination } = createLoader()('lib/dynamic-qr/destination.ts');
  const aliases = [origin, 'https://qr-helper-preview.example', 'https://www.qr-helper.example'];
  for (const alias of aliases) {
    for (const pathname of [
      '/q', '/q/', '/q/test', '/q/test?url=https://example.com', '/q/test#fragment',
      '/catalog/../q/test', '//q/test', '/%71/test', '/%2fq/test', '/a/%252e%252e/q/test',
    ]) {
      assert.throws(() => validateDestination(alias + pathname, aliases), Error, alias + pathname);
    }
  }
  assert.throws(() => validateDestination('https://QR-HELPER.EXAMPLE./q/test', aliases), Error);
});

test('active public redirects use the persisted target, ignore destination query input and never expose the record', async () => {
  const { load, calls } = harness({ records: [record()] });
  const { GET } = load('app/q/[slug]/route.ts');
  const response = await GET(request(`/q/${validSlug}?url=https://evil.example&targetUrl=https://evil.example`), params('slug', validSlug));
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), originalTarget);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(calls.findUnique[0].where, { slug: validSlug });
  assert.equal(await response.text(), '');
});

test('inactive and unknown public slugs return uncached status responses without private fields', async () => {
  for (const [records, expected] of [[[record({ active: false })], 410], [[], 404]]) {
    const { load } = harness({ records });
    const { GET } = load('app/q/[slug]/route.ts');
    const response = await GET(request(`/q/${validSlug}`), params('slug', validSlug));
    assert.equal(response.status, expected);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const body = await response.text();
    assert.equal(body.includes(internalId), false);
    assert.equal(body.includes(originalTarget), false);
  }
});

test('malformed public slugs return 404 before a database lookup', async () => {
  const { load, calls } = harness();
  const { GET } = load('app/q/[slug]/route.ts');
  for (const slug of ['short', 'a'.repeat(200), 'bad/slash']) {
    assert.equal((await GET(request('/q/invalid'), params('slug', slug))).status, 404);
  }
  assert.equal(calls.findUnique.length, 0);
});

test('public redirects fail closed for targets changed outside the validated admin API', async () => {
  for (const targetUrl of ['http://example.com', 'javascript:alert(1)', `${origin}/q/${validSlug}`]) {
    const { load } = harness({ records: [record({ targetUrl })] });
    const { GET } = load('app/q/[slug]/route.ts');
    const response = await GET(request(`/q/${validSlug}`), params('slug', validSlug));
    assert.equal(response.status, 410);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('Next middleware excludes public QR paths while retaining locale routing for pages', () => {
  const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
  const load = createLoader({
    'next-intl/middleware': () => () => new Response(),
    'i18n/routing.ts': { routing: {} },
  });
  const { config } = load('middleware.ts');
  for (const pathname of ['/q', `/q/${validSlug}`, `/q/${validSlug}?url=https://example.com`, '/api/admin/dynamic-qr']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: origin + pathname }), false, pathname);
  }
  for (const pathname of ['/', '/admin', '/catalog', '/uk/admin']) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: origin + pathname }), true, pathname);
  }
});

test('all Dynamic QR admin endpoints require the existing admin session', async () => {
  const { load, calls } = harness({ authenticated: false });
  const collection = load('app/api/admin/dynamic-qr/route.ts');
  const item = load('app/api/admin/dynamic-qr/[id]/route.ts');
  assert.equal((await collection.GET(request(collectionPath))).status, 401);
  assert.equal((await collection.POST(request(collectionPath, { method: 'POST', body: { targetUrl: originalTarget } }))).status, 401);
  assert.equal((await item.PATCH(request(`${collectionPath}/${internalId}`, { method: 'PATCH', body: { active: false } }), params('id', internalId))).status, 401);
  assert.equal(Object.values(calls).flat().length, 0);
});

test('admin collection lists persisted records with no-store', async () => {
  const { load } = harness({ records: [record()] });
  const { GET } = load('app/api/admin/dynamic-qr/route.ts');
  const response = await GET(request(collectionPath));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.dynamicQrs.length, 1);
  assert.equal(body.dynamicQrs[0].slug, validSlug);
  assert.equal(body.dynamicQrs[0].targetUrl, originalTarget);
});

test('admin create persists a server-generated slug and returns the created record', async () => {
  const { load, calls, stored } = harness();
  const { POST } = load('app/api/admin/dynamic-qr/route.ts');
  const response = await POST(request(collectionPath, { method: 'POST', body: { targetUrl: 'https://example.com/new?lang=uk' } }));
  assert.ok(response.status >= 200 && response.status < 300);
  const { dynamicQr } = await response.json();
  assert.match(dynamicQr.slug, /^[A-Za-z0-9_-]{16}$/);
  assert.equal(dynamicQr.targetUrl, 'https://example.com/new?lang=uk');
  assert.equal(dynamicQr.active, true);
  assert.equal(stored.get(dynamicQr.id).slug, dynamicQr.slug);
  assert.equal(calls.create.length, 1);
});

test('admin create rejects unsafe targets, malformed JSON and caller-provided identity fields', async () => {
  const { load, calls } = harness();
  const { POST } = load('app/api/admin/dynamic-qr/route.ts');
  for (const body of [
    { targetUrl: 'http://example.com' },
    { targetUrl: 'https://user:pass@example.com' },
    { targetUrl: `${origin}/q/${validSlug}` },
    { targetUrl: 42 }, {}, null, '{bad-json',
    { targetUrl: originalTarget, slug: validSlug },
    { targetUrl: originalTarget, id: 'client-id' },
    { targetUrl: originalTarget, createdAt: '2020-01-01' },
  ]) {
    const response = await POST(request(collectionPath, { method: 'POST', body }));
    assert.equal(response.status, 400, JSON.stringify(body));
  }
  assert.equal(calls.create.length, 0);
});

test('admin edits persist through future scans while the public slug stays stable', async () => {
  const { load, stored } = harness({ records: [record()] });
  const { PATCH } = load('app/api/admin/dynamic-qr/[id]/route.ts');
  const { GET } = load('app/q/[slug]/route.ts');
  const targetUrl = 'https://example.com/updated?language=uk';
  const response = await PATCH(request(`${collectionPath}/${internalId}`, { method: 'PATCH', body: { targetUrl } }), params('id', internalId));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).dynamicQr.slug, validSlug);
  assert.equal(stored.get(internalId).targetUrl, targetUrl);
  assert.equal(stored.get(internalId).slug, validSlug);
  assert.equal((await GET(request(`/q/${validSlug}`), params('slug', validSlug))).headers.get('location'), targetUrl);

  for (const active of [false, true]) {
    const update = await PATCH(request(`${collectionPath}/${internalId}`, { method: 'PATCH', body: { active } }), params('id', internalId));
    assert.equal(update.status, 200);
    const redirect = await GET(request(`/q/${validSlug}`), params('slug', validSlug));
    assert.equal(redirect.status, active ? 302 : 410);
    assert.equal(stored.get(internalId).slug, validSlug);
  }
});

test('admin PATCH rejects immutable fields and invalid updates without changing storage', async () => {
  const { load, calls, stored } = harness({ records: [record()] });
  const { PATCH } = load('app/api/admin/dynamic-qr/[id]/route.ts');
  for (const body of [
    { slug: 'X'.repeat(16) }, { id: 'changed' }, { createdAt: '2020-01-01' },
    { targetUrl: originalTarget, slug: 'X'.repeat(16) },
    { active: false, id: 'changed' }, { updatedAt: '2020-01-01' },
    { targetUrl: 'javascript:alert(1)' }, { targetUrl: `${origin}/q/${validSlug}` },
    { active: 'false' }, {}, null, '{bad-json',
  ]) {
    const response = await PATCH(request(`${collectionPath}/${internalId}`, { method: 'PATCH', body }), params('id', internalId));
    assert.equal(response.status, 400, JSON.stringify(body));
  }
  assert.equal(calls.update.length, 0);
  assert.equal(stored.get(internalId).slug, validSlug);
  assert.equal(stored.get(internalId).active, true);
  assert.equal(stored.get(internalId).targetUrl, originalTarget);
});

test('admin mutation origin protection rejects cross-site and missing Origin requests', async () => {
  const { load, calls } = harness({ records: [record()] });
  const { POST } = load('app/api/admin/dynamic-qr/route.ts');
  const { PATCH } = load('app/api/admin/dynamic-qr/[id]/route.ts');
  for (const options of [
    { originHeader: 'https://attacker.example' },
    { originHeader: null },
    { headers: { 'sec-fetch-site': 'cross-site' } },
  ]) {
    assert.equal((await POST(request(collectionPath, { ...options, method: 'POST', body: { targetUrl: originalTarget } }))).status, 403);
    assert.equal((await PATCH(request(`${collectionPath}/${internalId}`, { ...options, method: 'PATCH', body: { active: false } }), params('id', internalId))).status, 403);
  }
  assert.equal(calls.create.length, 0);
  assert.equal(calls.update.length, 0);
});

test('shared admin origin guard accepts only this exact request origin', () => {
  const { isSameOriginRequest } = createLoader()('lib/admin-origin.ts');
  for (const headers of [{}, { 'sec-fetch-site': 'same-origin' }, { 'sec-fetch-site': 'none' }]) {
    assert.equal(isSameOriginRequest(request(collectionPath, { headers })), true);
  }
  for (const options of [
    { originHeader: null },
    { originHeader: 'null' },
    { originHeader: 'not-a-url' },
    { originHeader: 'https://attacker.example' },
    { originHeader: 'http://qr-helper.example' },
    { originHeader: `${origin}/` },
    { originHeader: `${origin}/some-path` },
    { originHeader: 'https://user@qr-helper.example' },
    { headers: { 'sec-fetch-site': 'cross-site' } },
    { originHeader: 'https://attacker.example', headers: { 'x-forwarded-host': 'attacker.example', 'x-forwarded-proto': 'https' } },
  ]) {
    assert.equal(isSameOriginRequest(request(collectionPath, options)), false, JSON.stringify(options));
  }
});

test('database failures return uncached 503 responses without leaking stored destinations', async (context) => {
  const logs = [];
  context.mock.method(console, 'error', (...args) => logs.push(args.join(' ')));
  const secretTarget = 'https://private.example/confidential?secret=never-log';
  for (const action of ['redirect', 'list', 'create', 'update']) {
    const { load, dynamicQr } = harness();
    const method = { redirect: 'findUnique', list: 'findMany', create: 'create', update: 'update' }[action];
    dynamicQr[method] = async () => { throw new Error(`Database error includes ${secretTarget}`); };
    let response;
    if (action === 'redirect') {
      response = await load('app/q/[slug]/route.ts').GET(request(`/q/${validSlug}`), params('slug', validSlug));
    } else if (action === 'list') {
      response = await load('app/api/admin/dynamic-qr/route.ts').GET(request(collectionPath));
    } else if (action === 'create') {
      response = await load('app/api/admin/dynamic-qr/route.ts').POST(request(collectionPath, { method: 'POST', body: { targetUrl: secretTarget } }));
    } else {
      response = await load('app/api/admin/dynamic-qr/[id]/route.ts').PATCH(request(`${collectionPath}/${internalId}`, { method: 'PATCH', body: { targetUrl: secretTarget } }), params('id', internalId));
    }
    assert.equal(response.status, 503, action);
    assert.equal(response.headers.get('cache-control'), 'no-store', action);
    assert.equal(response.headers.get('location'), null, action);
    assert.equal((await response.text()).includes(secretTarget), false, action);
  }
  assert.equal(logs.length, 4);
  assert.equal(logs.join('\n').includes(secretTarget), false);
});

test('admin PATCH returns 404 for a missing record', async () => {
  const { load } = harness();
  const { PATCH } = load('app/api/admin/dynamic-qr/[id]/route.ts');
  const missingId = 'cl9ebq9ff00013b6u4p8c5x1z';
  const response = await PATCH(request(`${collectionPath}/${missingId}`, { method: 'PATCH', body: { active: false } }), params('id', missingId));
  assert.equal(response.status, 404);
});

test('creation retries slug uniqueness collisions with a fresh server slug', async () => {
  const attempted = [];
  const slugs = ['A'.repeat(16), 'B'.repeat(16), 'C'.repeat(16)];
  const load = createLoader({
    '@/lib/db': { prisma: { dynamicQr: {
      async create({ data }) {
        attempted.push(data.slug);
        if (attempted.length < 3) throw new KnownRequestError('Collision', { code: 'P2002', meta: { target: ['slug'] } });
        return { id: internalId, ...data };
      },
    } } },
    'lib/dynamic-qr/slug.ts': { generateSlug: () => slugs.shift() },
    '@prisma/client': { Prisma: { PrismaClientKnownRequestError: KnownRequestError } },
  });
  const { createDynamicQr } = load('lib/dynamic-qr/service.ts');
  const created = await createDynamicQr(originalTarget);
  assert.deepEqual(attempted, ['A'.repeat(16), 'B'.repeat(16), 'C'.repeat(16)]);
  assert.equal(created.slug, 'C'.repeat(16));
  assert.equal(created.targetUrl, originalTarget);
});

test('creation does not retry unrelated unique or database failures', async () => {
  for (const error of [
    new KnownRequestError('Different unique field', { code: 'P2002', meta: { target: ['id'] } }),
    new KnownRequestError('Database unavailable', { code: 'P1001' }),
    new Error('Unexpected persistence error'),
  ]) {
    let attempts = 0;
    const load = createLoader({
      '@/lib/db': { prisma: { dynamicQr: { async create() { attempts++; throw error; } } } },
      '@prisma/client': { Prisma: { PrismaClientKnownRequestError: KnownRequestError } },
    });
    const { createDynamicQr } = load('lib/dynamic-qr/service.ts');
    await assert.rejects(() => createDynamicQr(originalTarget), (caught) => caught === error);
    assert.equal(attempts, 1);
  }
});

test('slug collision retries are bounded', async () => {
  let attempts = 0;
  const load = createLoader({
    '@/lib/db': { prisma: { dynamicQr: {
      async create() {
        attempts++;
        throw new KnownRequestError('Collision', { code: 'P2002', meta: { target: ['slug'] } });
      },
    } } },
    '@prisma/client': { Prisma: { PrismaClientKnownRequestError: KnownRequestError } },
  });
  const { createDynamicQr } = load('lib/dynamic-qr/service.ts');
  await assert.rejects(() => createDynamicQr(originalTarget));
  assert.equal(attempts, 5);
});

test('canonical printed origin uses configured HTTPS origin and falls back only for deployment/local context', () => {
  const saved = { APP_URL: process.env.APP_URL, VERCEL: process.env.VERCEL };
  const { canonicalPublicOrigin } = createLoader()('lib/dynamic-qr/destination.ts');
  try {
    delete process.env.APP_URL;
    delete process.env.VERCEL;
    assert.equal(canonicalPublicOrigin(), undefined);
    process.env.VERCEL = '1';
    assert.equal(canonicalPublicOrigin(), 'https://qr-helper-two.vercel.app');
    process.env.APP_URL = 'https://print.example';
    assert.equal(canonicalPublicOrigin(), 'https://print.example');
    for (const invalid of ['http://print.example', 'https://user:pass@print.example', 'https://print.example/path', 'https://print.example?key=1']) {
      process.env.APP_URL = invalid;
      assert.throws(() => canonicalPublicOrigin());
    }
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('origin protection supports Next.js listen-address URLs without trusting forwarded host headers', () => {
  const { isSameOriginRequest } = createLoader()('lib/admin-origin.ts');
  const { serviceOrigins, validateDestination } = createLoader()('lib/dynamic-qr/destination.ts');
  const local = new Request('http://0.0.0.0:3000/api/admin/session', { headers: { host: 'localhost:3000', origin: 'http://localhost:3000' } });
  assert.equal(isSameOriginRequest(local), true);
  const proxy = new Request('https://internal:3000/api/admin/session', { headers: { host: 'public.example', origin: 'https://public.example', 'x-forwarded-host': 'attacker.example' } });
  assert.equal(isSameOriginRequest(proxy), true);
  assert.equal(isSameOriginRequest(new Request('https://internal:3000/api/admin/session', { headers: { host: 'public.example', origin: 'https://attacker.example', 'x-forwarded-host': 'attacker.example' } })), false);
  assert.throws(() => validateDestination('https://public.example/q/test', serviceOrigins(proxy)));
  assert.equal(isSameOriginRequest(new Request('https://internal:3000/api/admin/session', { headers: { host: 'public.example,attacker.example', origin: 'https://public.example' } })), false);
});
