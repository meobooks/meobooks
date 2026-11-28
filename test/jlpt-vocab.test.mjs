// Kiểm thử tách Kho Từ Vựng Thống Nhất (bước 19): makeJlptVocab nằm trong src/ui/jlpt-vocab.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/jlpt-vocab.js xuất makeJlptVocab với đầy đủ phụ thuộc', () => {
  const s = read('src/ui/jlpt-vocab.js');
  assert.ok(s.includes('export function makeJlptVocab({ front, cleanT, nbOf, classOf, classBadge, CL_BG, STATUS_LABEL, speak, langOfWord, withNb, EMPTY_V, WORD_TYPES, JCard, JLoading, meoFeat })'));
  assert.ok(s.includes('Kho Từ Vựng Thống Nhất'));
  assert.ok(s.includes('meoFeat.vocabList.filterVocab'));
  assert.ok(s.includes('meoFeat.bulkVocab.parseBulkLines'));
});

t('src/ui/index.js gom makeJlptVocab', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeJlptVocab } from './jlpt-vocab.js';"));
  assert.ok(s.includes('makeJlptVocab, makeInkLayer, makeBanTu, makeYtListening, makeApp, makeNbDeckPicker };'));
});

t('legacy: JlptVocab lấy từ meoFeat.ui; langOfWord và classOf truyền qua hàm bọc, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const JlptVocab=meoFeat.ui.makeJlptVocab({front,cleanT,nbOf,classOf,classBadge,CL_BG,STATUS_LABEL,speak,langOfWord:(...args)=>langOfWord(...args),withNb,EMPTY_V,WORD_TYPES,JCard,JLoading,meoFeat});'));
  assert.ok(!legacy.includes('function JlptVocab('));
});

console.log(`\n${pass} kiểm thử đạt`);
