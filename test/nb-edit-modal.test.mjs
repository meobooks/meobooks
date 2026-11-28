// Kiểm thử tách hộp thoại tùy chỉnh sổ tay (bước 6): makeNbEditModal nằm trong src/ui/nb-edit-modal.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/nb-edit-modal.js xuất makeNbEditModal nhận NB_COLORS và cleanT', () => {
  const s = read('src/ui/nb-edit-modal.js');
  assert.ok(s.includes('export function makeNbEditModal({ NB_COLORS, cleanT })'));
  assert.ok(s.includes('Tùy chỉnh sổ tay'));
  assert.ok(s.includes('Xóa sổ "'));
});

t('src/ui/index.js gom makeNbEditModal', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeNbEditModal } from './nb-edit-modal.js';"));
  assert.ok(s.includes('makeNbEditModal, makeN2Roadmap, makePomodoroWidget };'));
});

t('legacy: NbEditModal lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const NbEditModal=meoFeat.ui.makeNbEditModal({NB_COLORS,cleanT});'));
  assert.ok(!legacy.includes('function NbEditModal('));
});

console.log(`\n${pass} kiểm thử đạt`);
