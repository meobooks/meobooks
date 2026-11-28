// Kiểm thử tách lớp viết tay trên trang (bước 20): makeInkLayer nằm trong src/ui/ink-layer.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/ink-layer.js xuất makeInkLayer nhận INK_COLORS và drawStroke', () => {
  const s = read('src/ui/ink-layer.js');
  assert.ok(s.includes('export function makeInkLayer({ INK_COLORS, drawStroke })'));
  assert.ok(s.includes('Viết tay bằng bút / Pencil'));
  assert.ok(s.includes('Hỗ trợ Apple Pencil'));
});

t('src/ui/index.js gom makeInkLayer', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeInkLayer } from './ink-layer.js';"));
  assert.ok(s.includes('makeInkLayer, makeBanTu, makeYtListening, makeApp, makeNbDeckPicker };'));
});

t('legacy: InkLayer lấy từ meoFeat.ui, drawStroke truyền qua hàm bọc, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const InkLayer=meoFeat.ui.makeInkLayer({INK_COLORS,drawStroke:(...args)=>drawStroke(...args)});'));
  assert.ok(!legacy.includes('function InkLayer('));
});

console.log(`\n${pass} kiểm thử đạt`);
