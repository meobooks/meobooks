// Kiểm thử public/legacy/pomodoro.js (logic Pomodoro tách từ legacy).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../public/legacy/pomodoro.js', import.meta.url), 'utf8');
const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');

const win = {};
const ctx = { window: win, console, Math };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx);
const P = win.meobooksFeatures.pomodoro;

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('remainingSeconds làm tròn và không âm', () => {
  assert.equal(P.remainingSeconds(10000, 0), 10);
  assert.equal(P.remainingSeconds(1500, 0), 2);      // 1.5s -> 2 (Math.round)
  assert.equal(P.remainingSeconds(1000, 1000), 0);
  assert.equal(P.remainingSeconds(1000, 5000), 0);   // đã quá mốc: 0, không âm
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

t('legacy đã nối đúng 3 chỗ và không còn công thức cũ', () => {
  const count = (s) => legacy.split(s).length - 1;
  assert.equal(count('<script src="pomodoro.js"></script>'), 1);
  assert.equal(count('window.meobooksFeatures.pomodoro.remainingSeconds(R.current,Date.now())'), 1);
  assert.equal(count('window.meobooksFeatures.pomodoro.countsAsSession(v)&&a(v)'), 1);
  assert.equal(count('window.meobooksFeatures.pomodoro.documentTitle(u,fmtTime(f))'), 1);
  assert.equal(count('Math.round((R.current-Date.now())/1e3)'), 0);
  assert.equal(count('v>=15&&a(v)'), 0);
});

console.log(`\n${passed} kiểm thử đạt.`);
