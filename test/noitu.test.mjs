// Kiểm thử src/features/noitu.js (logic Nối từ tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as N from '../src/features/noitu.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('roundSize: kẹp trong [10, min(100, số từ)]', () => {
  assert.equal(N.roundSize(20, 50), 20);
  assert.equal(N.roundSize(5, 50), 10);
  assert.equal(N.roundSize(200, 150), 100);
  assert.equal(N.roundSize(20, 15), 15);
});

t('splitBatches: chia đều, tổng bằng số từ', () => {
  const twenty = Array.from({ length: 20 }, (_, i) => i);
  assert.deepEqual(N.splitBatches(twenty, 10).map((b) => b.length), [10, 10]);
  const twentyFive = Array.from({ length: 25 }, (_, i) => i);
  const sizes = N.splitBatches(twentyFive, 10).map((b) => b.length);
  assert.deepEqual(sizes, [8, 9, 8]);
  assert.equal(sizes.reduce((a, b) => a + b, 0), 25);
});

t('roundScore: công thức điểm và không âm', () => {
  assert.equal(N.roundScore({ n: 10, secs: 20, wrong: 2 }), 114);
  assert.equal(N.roundScore({ n: 10, secs: 500, wrong: 50 }), 0);
});

t('roundXp: 1 mỗi 5 từ, kẹp 1..10', () => {
  assert.equal(N.roundXp(3), 1);
  assert.equal(N.roundXp(10), 2);
  assert.equal(N.roundXp(100), 10);
});

t('playPool: chế độ fresh lọc từ đã dùng', () => {
  const list = [{ v: { id: 'a' } }, { v: { id: 'b' } }];
  assert.deepEqual(N.playPool(list, new Set(['a']), 'fresh'), [{ v: { id: 'b' } }]);
  assert.equal(N.playPool(list, new Set(['a']), 'random'), list);
});

t('usedAfterReset: bỏ các id thuộc bộ', () => {
  assert.deepEqual(N.usedAfterReset(['a', 'b', 'c'], ['b']), ['a', 'c']);
});

t('legacy dùng noitu qua meoFeat', () => {
  const noiTuSrc = readFileSync(new URL('../src/ui/noi-tu.js', import.meta.url), 'utf8');
  assert.equal(noiTuSrc.includes('meoFeat.noitu.roundSize(cnt,playPool.length)'), true);
  assert.equal(noiTuSrc.includes('meoFeat.noitu.splitBatches(picked,BATCH)'), true);
  assert.equal(legacy.includes('const xp=Math.min(10,Math.max(1,Math.floor(ng.n/5)));') || noiTuSrc.includes('const xp=Math.min(10,Math.max(1,Math.floor(ng.n/5)));'), false);
});

console.log(`\n${passed} kiểm thử đạt.`);
