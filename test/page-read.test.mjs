// Kiểm thử tách trang sổ tay dạng đọc (bước 13): makePageRead nằm trong src/ui/page-read.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/page-read.js xuất makePageRead nhận các phụ thuộc đã truyền vào', () => {
  const s = read('src/ui/page-read.js');
  assert.ok(s.includes('export function makePageRead({ PAPER_STYLES, normCols, GRAMMAR_FIELDS, G_PALETTES, InkView, meoFeat })'));
  assert.ok(s.includes('Trang này chưa có nội dung. Bấm Sửa để ghi chép.'));
  assert.ok(s.includes('meoFeat.reader.grammarListOf(p)'));
});

t('src/ui/index.js gom makePageRead', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makePageRead } from './page-read.js';"));
  assert.ok(s.includes('makePageRead, makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson, makeNoiTu };'));
});

t('legacy: PageRead lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const PageRead=meoFeat.ui.makePageRead({PAPER_STYLES,normCols,GRAMMAR_FIELDS,G_PALETTES,InkView,meoFeat});'));
  assert.ok(!legacy.includes('function PageRead('));
});

console.log(`\n${pass} kiểm thử đạt`);
