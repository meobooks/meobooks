// Kiểm thử tách đồng hồ Pomodoro (bước 8): makePomodoroWidget nằm trong src/ui/pomodoro-widget.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/pomodoro-widget.js xuất makePomodoroWidget nhận fmtTime và meoFeat', () => {
  const s = read('src/ui/pomodoro-widget.js');
  assert.ok(s.includes('export function makePomodoroWidget({ fmtTime, meoFeat })'));
  assert.ok(s.includes('Xong 1 phiên tập trung = +5 XP'));
  assert.ok(s.includes('meoFeat.pomodoro.countsAsSession(v)'));
});

t('src/ui/index.js gom makePomodoroWidget', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makePomodoroWidget } from './pomodoro-widget.js';"));
  assert.ok(s.includes('makePomodoroWidget };'));
});

t('legacy: PomodoroWidget lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const PomodoroWidget=meoFeat.ui.makePomodoroWidget({fmtTime,meoFeat});'));
  assert.ok(!legacy.includes('function PomodoroWidget('));
});

console.log(`\n${pass} kiểm thử đạt`);
