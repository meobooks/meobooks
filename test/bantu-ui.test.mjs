// Kiểm thử tách component BanTu (bước 21): makeBanTu nằm trong src/ui/bantu.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const t = (name, fn) => { try { fn(); console.log('ok -', name); } catch (e) { console.error('FAIL -', name, e.message); process.exitCode = 1; } };
const mod = readFileSync('src/ui/bantu.js', 'utf8');
const legacy = readFileSync('public/legacy/index.html', 'utf8');
const idx = readFileSync('src/ui/index.js', 'utf8');

t('src/ui/bantu.js xuất makeBanTu với đầy đủ dependency', () => {
  assert.ok(mod.includes('export function makeBanTu({ JLoading, btOf, btProg, btIc, BT_ICONS, cleanT, nbOf, nbDeckPicker, classOf, front, shuffle })'));
  assert.ok(mod.includes('return function BanTu({jl,theme:a'));
});

t('src/ui/index.js gom makeBanTu', () => {
  assert.ok(idx.includes("import { makeBanTu } from './bantu.js';"));
  assert.ok(idx.includes('makeInkLayer, makeBanTu, makeYtListening };'));
});

t('legacy dùng makeBanTu thay cho function BanTu cũ', () => {
  assert.ok(legacy.includes('const BanTu=meoFeat.ui.makeBanTu({JLoading,btOf,btProg,btIc,BT_ICONS,cleanT,nbOf,nbDeckPicker,classOf:(...args)=>classOf(...args),front,shuffle});'));
  assert.ok(!legacy.includes('function BanTu('));
});

t('classOf được bọc arrow vì khai báo sau lời gọi (tránh TDZ)', () => {
  assert.ok(legacy.indexOf('const BanTu=meoFeat.ui.makeBanTu') < legacy.indexOf('const classOf=meoFeat.vocab.classOf;'));
});
