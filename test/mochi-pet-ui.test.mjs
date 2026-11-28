// Kiểm thử tách thú cưng ảo Mochi (bước 16): makeMochiPet nằm trong src/ui/mochi-pet.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/mochi-pet.js xuất makeMochiPet nhận các phụ thuộc đã truyền vào', () => {
  const s = read('src/ui/mochi-pet.js');
  assert.ok(s.includes('export function makeMochiPet({ JCard, MochiMascot, SHOP_ITEMS, growOf, ageText, stageOf, meoFeat })'));
  assert.ok(s.includes('Virtual Mochi Pet'));
  assert.ok(s.includes('Tiệm đồ của Mochi'));
  assert.ok(s.includes('meoFeat.mochiPet'));
});

t('src/ui/index.js gom makeMochiPet', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeMochiPet } from './mochi-pet.js';"));
  assert.ok(s.includes('makeMochiPet, makeRmLesson, makeNoiTu, makeJlptVocab, makeInkLayer };'));
});

t('legacy: MochiPet lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const MochiPet=meoFeat.ui.makeMochiPet({JCard,MochiMascot,SHOP_ITEMS,growOf,ageText,stageOf,meoFeat});'));
  assert.ok(!legacy.includes('function MochiPet('));
});

console.log(`\n${pass} kiểm thử đạt`);
