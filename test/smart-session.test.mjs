// Kiểm thử src/features/smart-session.js (thuật toán buổi học JLPT tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '../src/features/smart-session.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

t('FULL_STEPS đúng thứ tự 5 bước', () => {
  assert.deepEqual(S.FULL_STEPS, ['jp_to_vi', 'vi_to_jp', 'type_reading', 'type_meaning', 'type_word']);
});

t('shuffleArr: giữ nguyên phần tử, không sửa mảng gốc', () => {
  const src = [1, 2, 3, 4, 5];
  const out = S.shuffleArr(src, () => 0.3);
  assert.deepEqual(src, [1, 2, 3, 4, 5]);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
});

t('makeInitialQueue: giới hạn maxCount và tạo đủ trường trạng thái', () => {
  const words = Array.from({ length: 20 }, (_, i) => ({ id: 'w' + i }));
  const q = S.makeInitialQueue(words, {}, 12, () => 0.5);
  assert.equal(q.length, 12);
  assert.deepEqual(q[0], { vocabId: q[0].vocabId, attempt: 1, stage: 'full', steps: S.FULL_STEPS, si: 0, failedThisPass: false, testsPassedInAttempt2: 0 });
});

t('makeInitialQueue: từ tough được ưu tiên trước known', () => {
  const words = [{ id: 'known1', status: 'mastered' }, { id: 'tough1' }, { id: 'learn1' }];
  const vs = { tough1: { ok: 0, bad: 3, streak: 0 }, known1: { ok: 9, bad: 0, streak: 9 } };
  const q = S.makeInitialQueue(words, { vs, srs: {} }, 3, () => 0.5);
  assert.equal(q[0].vocabId, 'tough1');
  assert.equal(q[q.length - 1].vocabId, 'known1');
});

t('buildPlan: mỗi bước còn lại xuất hiện đúng một lần', () => {
  const queue = [
    { steps: [1, 2, 3, 4, 5], si: 0 },
    { steps: [1, 2, 3, 4, 5], si: 2 },
    { steps: [1, 2], si: 0 },
  ];
  const plan = S.buildPlan(queue, 2, () => 0.9);
  const count = (i) => plan.filter((x) => x === i).length;
  assert.equal(count(0), 5);
  assert.equal(count(1), 3);
  assert.equal(count(2), 2);
  assert.equal(plan.length, 10);
});

t('buildPlan: lượt chia theo size, không trộn lẫn giữa các lượt', () => {
  const queue = Array.from({ length: 4 }, () => ({ steps: [1, 2], si: 0 }));
  const plan = S.buildPlan(queue, 2, () => 0.2);
  assert.equal(plan.slice(0, 4).every((x) => x === 0 || x === 1), true);
  assert.equal(plan.slice(4).every((x) => x === 2 || x === 3), true);
});

t('legacy: dùng module thay vì định nghĩa lại', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('const buildPlan=meoFeat.smartSession.buildPlan'));
  assert.ok(legacy.includes('meoFeat.smartSession.makeInitialQueue('));
  assert.ok(!legacy.includes('const buildPlan=(queue,size)=>'));
});

console.log(`\n${pass} kiểm thử đạt`);
