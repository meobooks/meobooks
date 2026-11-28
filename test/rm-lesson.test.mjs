// Kiểm thử tách bài học lộ trình N2 (bước 17): makeRmLesson nằm trong src/ui/rm-lesson.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/rm-lesson.js xuất makeRmLesson nhận rmNorm, VocabTable, meoFeat', () => {
  const s = read('src/ui/rm-lesson.js');
  assert.ok(s.includes('export function makeRmLesson({ rmNorm, VocabTable, meoFeat })'));
  assert.ok(s.includes('Đánh dấu đã đọc'));
  assert.ok(s.includes('Các cặp bạn đã ghép'));
  assert.ok(s.includes('meoFeat.roadmap.parseVocabLines(l.content)'));
});

t('src/ui/index.js gom makeRmLesson', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeRmLesson } from './rm-lesson.js';"));
  assert.ok(s.includes('makeRmLesson, makeNoiTu, makeJlptVocab };'));
});

t('legacy: RmLesson lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const RmLesson=meoFeat.ui.makeRmLesson({rmNorm,VocabTable,meoFeat});'));
  assert.ok(!legacy.includes('function RmLesson('));
});

console.log(`\n${pass} kiểm thử đạt`);
