const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(name) {
  const filename = path.resolve(__dirname, '..', 'lib/products', name + '.ts');
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = new Module(filename);
  module._compile(compiled, filename);
  return module.exports;
}

test('QR contrast uses relative luminance and distinguishes reversed or equal colors', () => {
  const { qrContrast } = load('quality');
  assert.equal(qrContrast('#000000', '#ffffff').ratio, 21);
  assert.equal(qrContrast('#000000', '#ffffff').darkOnLight, true);
  assert.equal(qrContrast('#FFFFFF', '#000000').darkOnLight, false);
  assert.equal(qrContrast('#ffffff', '#ffffff').ratio, 1);
  assert.equal(qrContrast('#101828', '#ffffff').ratio > 15, true);
  assert.equal(qrContrast('#ffeeee', '#ffffff').ratio < 2, true);
  assert.equal(qrContrast('red', '#ffffff'), null);
});

test('destination summary omits Wi-Fi credentials, full contacts, messages and URL query secrets', () => {
  const { destinationSummary } = load('presentation');
  assert.equal(destinationSummary('wifi', { ssid: 'Guest', password: 'secret-password' }, 'en'), 'Network: Guest');
  assert.equal(destinationSummary('vcard', { name: 'Alex', phone: '+380501234567', email: 'private@example.com' }, 'en'), 'Contact: Alex');
  assert.equal(destinationSummary('sms', { phone: '+380501234567', message: 'private message' }, 'en'), '+380501234567');
  assert.equal(destinationSummary('site', 'https://example.com/menu?token=private#secret', 'en'), 'example.com/menu');
  assert.equal(destinationSummary('site', 'https://user:secret@example.com', 'en'), 'Saved details');
  assert.equal(destinationSummary('site', 'javascript:alert(1)', 'en'), 'Saved details');
  assert.equal(destinationSummary('wifi', { ssid: 'Гості', password: 'secret' }, 'ua'), 'Мережа: Гості');
});

test('business solutions preserve catalog capabilities and expose only implemented physical selections', () => {
  const { SOLUTIONS, PHYSICAL_PRODUCTS, findSolution, solutionForCatalog } = load('solutions');
  const catalogFile = path.resolve(__dirname, '..', 'lib/stickers/catalog.ts');
  const catalog = new Module(catalogFile);
  catalog._compile(ts.transpileModule(fs.readFileSync(catalogFile, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, catalogFile);
  for (const solution of SOLUTIONS) {
    for (const variant of solution.variants) assert.ok(catalog.exports.getSticker(variant.catalogKey), variant.catalogKey);
    assert.ok(PHYSICAL_PRODUCTS.some((item) => item.key === solution.suggestedFormat && item.available));
  }
  for (const key of ['socials','wifi','vcard','email','sms','google','carPhone','site','youtube','olx','app']) assert.ok(solutionForCatalog(key), key);
  assert.equal(solutionForCatalog('site').key, 'online');
  assert.equal(PHYSICAL_PRODUCTS.find((item) => item.key === 'qr_nfc').available, false);
  assert.equal(findSolution('constructor'), undefined);
  assert.equal(findSolution('unknown'), undefined);
});

test('printed calls to action address the visitor and preserve legacy capability messages', () => {
  const { productMessage } = load('presentation');
  assert.equal(productMessage('menu', 'en', 'OUR WEBSITE'), 'VIEW OUR MENU');
  assert.equal(productMessage('documents', 'en', 'OUR WEBSITE'), 'OPEN THE GUIDE');
  assert.equal(productMessage('reviews', 'en', 'RATE US'), 'RATE US');
  assert.equal(productMessage('menu', 'ua', 'НАШ САЙТ'), 'ПЕРЕГЛЯНЬТЕ МЕНЮ');
  assert.equal(productMessage('constructor', 'en', 'OUR WEBSITE'), 'OUR WEBSITE');
});
