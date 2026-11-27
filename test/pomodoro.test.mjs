// Kiểm thử src/features/pomodoro.js và cách legacy nối vào nó.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as P from '../src/features/pomodoro.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app/App.jsx', import.meta.url), 'utf8');

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('remainingSeconds làm tròn và không âm', () => {
  assert.equal(P.remainingSeconds(10000, 0), 10);
  assert.equal(P.remainingSeconds(1500, 0), 2);
  assert.equal(P.remainingSeconds(1000, 1000), 0);
  assert.equal(P.remainingSeconds(1000, 5000), 0);
});

t('countsAsSession ngưỡng 15 phút', () => {
  assert.equal(P.MIN_SESSION_MINUTES, 15);
  assert.equal(P.countsAsSession(25), true);
  assert.equal(P.countsAsSession(15), true);
  assert.equal(P.countsAsSession(14), false);
  assert.equal(P.countsAsSession(5), false);
});

t('documentTitle theo trạng thái chạy', () => {
  assert.equal(P.documentTitle(true, '24:59'), '24:59 – meobooks');
  assert.equal(P.documentTitle(false, '25:00'), 'meobooks');
});

t('legacy gọi đúng 3 chỗ qua meoFeat, không còn thẻ script cũ', () => {
  const count = (s) => legacy.split(s).length - 1;
  assert.equal(count('meoFeat.pomodoro.remainingSeconds(R.current,Date.now())'), 1);
  assert.equal(count('meoFeat.pomodoro.countsAsSession(v)&&a(v)'), 1);
  assert.equal(count('meoFeat.pomodoro.documentTitle(u,fmtTime(f))'), 1);
  assert.equal(count('src="pomodoro.js"'), 0);
});

t('App.jsx gắn pomodoro lên window trước khi iframe chạy', () => {
  assert.ok(app.includes("import * as pomodoro from '../features/pomodoro.js';"));
  assert.ok(app.includes('window.meobooksFeatures = { pomodoro, mochiPet };'));
});

console.log(`\n${passed} kiểm thử đạt.`);
