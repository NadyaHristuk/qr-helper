const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const fs = require('node:fs');
const Module = require('node:module');
function load(path) {
  const module = new Module(path);
  module._compile(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, path);
  return module.exports;
}
const { buildPayload, PayloadError } = load('lib/qr/payloads.ts');
const { getSticker, CATALOG } = load('lib/stickers/catalog.ts');
test('payment concept rejects PAN and arbitrary payment payloads', () => {
  for (const value of ['4111111111111111', '4111 1111 1111 1111', 'https://example.com/pay']) {
    assert.throws(() => buildPayload('privat24', value), PayloadError);
  }
  assert.equal(getSticker('privat24').fields.length, 0);
});
test('unknown and inherited catalog keys are not stickers', () => {
  for (const key of ['unknown', 'constructor', '__proto__', 'toString']) assert.equal(getSticker(key), undefined);
  assert.equal(CATALOG.length, 12);
});
test('malformed object fields fail as validation errors', () => {
  for (const [type, value] of [['vcard', { name: 'Test', phone: 42 }], ['wifi', { ssid: 'Test', password: {} }], ['wifi', { ssid: 'Test', security: 'invalid' }], ['sms', null]]) {
    assert.throws(() => buildPayload(type, value), PayloadError);
  }
});
test('URL payloads reject unsafe schemes and credentials', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.com']) assert.throws(() => buildPayload('site', value), PayloadError);
  assert.equal(buildPayload('site', 'example.com'), 'https://example.com/');
});
test('supported QR formats preserve escaping', () => {
  assert.equal(buildPayload('wifi', { ssid: 'Cafe;Guest', password: 'a:b' }), 'WIFI:T:WPA;S:Cafe\\;Guest;P:a\\:b;;');
  assert.equal(buildPayload('carPhone', '+380 50 123 45 67'), 'tel:+380501234567');
  assert.match(buildPayload('vcard', { name: 'First\nLast' }), /FN:First\\nLast/);
});

const { parseOrderItems } = load('lib/orders/items.ts');
test('legacy orders render with production defaults and malformed entries are ignored', () => {
  const parsed = parseOrderItems(JSON.stringify([null, 1, [], {type: 'site', label: 'Legacy'}, {label: {invalid: true}, quantity: -1}]));
  assert.equal(parsed.length, 2);
  assert.deepEqual(parsed[0], {type: 'site', label: 'Legacy', productType: 'sticker', size: 'M', quantity: 1});
  assert.equal(parsed[1].label, undefined);
  assert.deepEqual(parseOrderItems('{broken'), []);
  assert.deepEqual(parseOrderItems('{}'), []);
});
