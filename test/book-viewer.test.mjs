// Kiểm thử tách sách lật trang 3D (bước 14): makeBookViewer nằm trong src/ui/book-viewer.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/book-viewer.js xuất makeBookViewer nhận PageRead và meoFeat', () => {
  const s = read('src/ui/book-viewer.js');
  assert.ok(s.includes('export function makeBookViewer({ PageRead, meoFeat })'));
  assert.ok(s.includes('bấm ‹ › hoặc phím mũi tên để lật'));
  assert.ok(s.includes('meoFeat.reader.startLeafIndex(leaves,startId)'));
});

t('src/ui/index.js gom makeBookViewer', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeBookViewer } from './book-viewer.js';"));
  assert.ok(s.includes('makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson, makeNoiTu, makeJlptVocab, makeInkLayer, makeBanTu, makeYtListening };'));
});

t('legacy: BookViewer lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const BookViewer=meoFeat.ui.makeBookViewer({PageRead,meoFeat});'));
  assert.ok(!legacy.includes('function BookViewer('));
});

console.log(`\n${pass} kiểm thử đạt`);
