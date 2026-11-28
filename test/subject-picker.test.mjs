// Kiểm thử tách màn chọn môn học (bước 9): makeSubjectPicker nằm trong src/ui/subject-picker.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/subject-picker.js xuất makeSubjectPicker nhận lvlInfo và SUBJECT_COLORS', () => {
  const s = read('src/ui/subject-picker.js');
  assert.ok(s.includes('export function makeSubjectPicker({ lvlInfo, SUBJECT_COLORS })'));
  assert.ok(s.includes('Chọn môn học 🌸'));
  assert.ok(s.includes('Cần giữ lại ít nhất một môn học.'));
});

t('src/ui/index.js gom makeSubjectPicker', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeSubjectPicker } from './subject-picker.js';"));
  assert.ok(s.includes('makeSubjectPicker, VocabTable, InteractiveSentenceCard };'));
});

t('legacy: SubjectPicker lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const SubjectPicker=meoFeat.ui.makeSubjectPicker({lvlInfo,SUBJECT_COLORS});'));
  assert.ok(!legacy.includes('function SubjectPicker('));
});

console.log(`\n${pass} kiểm thử đạt`);
