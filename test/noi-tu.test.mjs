// Kiểm thử tách trò chơi Nối Từ (bước 18): makeNoiTu nằm trong src/ui/noi-tu.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/noi-tu.js xuất makeNoiTu nhận các phụ thuộc đã truyền vào', () => {
  const s = read('src/ui/noi-tu.js');
  assert.ok(s.includes('export function makeNoiTu({ front, cleanT, nbOf, classOf, nbDeckPicker, ntSnd, shuffle, JLoading, MochiMascot, meoFeat })'));
  assert.ok(s.includes('Nối Từ'));
  assert.ok(s.includes('meoFeat.noitu.playPool(deck.list,usedSet,order)'));
  assert.ok(s.includes('const maxN=Math.min(100,playPool.length);'), 'slider dùng maxN phải được khai báo');
});

t('src/ui/index.js gom makeNoiTu', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeNoiTu } from './noi-tu.js';"));
  assert.ok(s.includes('makeNoiTu, makeJlptVocab, makeInkLayer };'));
});

t('legacy: NoiTu lấy từ meoFeat.ui, classOf truyền qua hàm bọc (tránh TDZ), không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const NoiTu=meoFeat.ui.makeNoiTu({front,cleanT,nbOf,classOf:(...args)=>classOf(...args),nbDeckPicker,ntSnd,shuffle,JLoading,MochiMascot,meoFeat});'));
  assert.ok(!legacy.includes('function NoiTu('));
});

console.log(`\n${pass} kiểm thử đạt`);
