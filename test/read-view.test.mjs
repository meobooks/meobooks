// Kiểm thử tách màn chế độ đọc (bước 5): makeReadView nằm trong src/ui/read-view.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/read-view.js xuất makeReadView nhận cleanT và PageRead', () => {
  const s = read('src/ui/read-view.js');
  assert.ok(s.includes('export function makeReadView({ cleanT, PageRead })'));
  assert.ok(s.includes('Chế độ đọc'));
  assert.ok(s.includes('Đồng bộ vào Kho Từ Vựng'));
});

t('src/ui/index.js gom makeReadView', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeReadView } from './read-view.js';"));
  assert.ok(s.includes('makeReadView, makeNbEditModal, makeN2Roadmap, makePomodoroWidget, makeSubjectPicker };'));
});

t('legacy: ReadView lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const ReadView=meoFeat.ui.makeReadView({cleanT,PageRead});'));
  assert.ok(!legacy.includes('function ReadView('));
});

console.log(`\n${pass} kiểm thử đạt`);
