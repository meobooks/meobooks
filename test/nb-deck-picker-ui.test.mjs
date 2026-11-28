// Kiểm thử tách bộ chọn sổ/bộ thẻ (bước 24): makeNbDeckPicker nằm trong src/ui/nb-deck-picker.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const t = (name, fn) => { try { fn(); console.log('ok -', name); } catch (e) { console.error('FAIL -', name, e.message); process.exitCode = 1; } };
const mod = readFileSync('src/ui/nb-deck-picker.js', 'utf8');
const legacy = readFileSync('public/legacy/index.html', 'utf8');
const idx = readFileSync('src/ui/index.js', 'utf8');

t('src/ui/nb-deck-picker.js xuất makeNbDeckPicker nhận cleanT', () => {
  assert.ok(mod.includes('export function makeNbDeckPicker({ cleanT })'));
  assert.ok(mod.includes('return function nbDeckPicker(o){'));
});

t('src/ui/index.js gom makeNbDeckPicker', () => {
  assert.ok(idx.includes("import { makeNbDeckPicker } from './nb-deck-picker.js';"));
  assert.ok(idx.includes('makeApp, makeNbDeckPicker };'));
});

t('legacy dùng makeNbDeckPicker thay cho function cũ, trước mọi chỗ dùng', () => {
  assert.ok(legacy.includes('const nbDeckPicker=meoFeat.ui.makeNbDeckPicker({cleanT});'));
  assert.ok(!legacy.includes('function nbDeckPicker('));
  const decl = legacy.indexOf('const nbDeckPicker=meoFeat.ui.makeNbDeckPicker');
  assert.ok(decl < legacy.indexOf('const BanTu=meoFeat.ui.makeBanTu'), 'phải khai báo trước BanTu');
  assert.ok(decl < legacy.indexOf('const NoiTu=meoFeat.ui.makeNoiTu'), 'phải khai báo trước NoiTu');
});
