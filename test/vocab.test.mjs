// Kiểm thử src/features/vocab.js (logic từ vựng dùng chung tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as V from '../src/features/vocab.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('nbOf và withNb: đọc và ghi thẻ nb:', () => {
  assert.equal(V.nbOf({ tags: ['x', 'nb:n1'] }), 'n1');
  assert.equal(V.nbOf({}), '');
  assert.deepEqual(V.withNb(['a', 'nb:old'], 'new'), ['a', 'nb:new']);
  assert.deepEqual(V.withNb(['nb:old'], ''), []);
});

t('byNewest: mới nhất đứng trước', () => {
  const list = [{ created_at: '2026-01-01' }, { created_at: '2026-01-02' }];
  assert.equal(list.slice().sort(V.byNewest)[0].created_at, '2026-01-02');
});

t('classOf: tough, known, learn', () => {
  const v = { id: 'a', status: 'learn' };
  assert.equal(V.classOf({ a: { ok: 1, bad: 3, streak: 0 } }, v, {}), 'tough');
  assert.equal(V.classOf({}, { id: 'a', status: 'mastered' }, {}), 'known');
  assert.equal(V.classOf({ a: { ok: 9, bad: 0, streak: 5 } }, v, {}), 'known');
  assert.equal(V.classOf({ a: { ok: 3, bad: 0, streak: 3 } }, v, { a: { interval_days: 4 } }), 'known');
  assert.equal(V.classOf({}, v, {}), 'learn');
});

t('langOfWord: theo môn của sổ, mặc định tiếng Nhật', () => {
  const nbs = [{ id: 'n', subject: 'Chinese' }];
  assert.equal(V.langOfWord({ tags: ['nb:n'] }, nbs), 'Chinese');
  assert.equal(V.langOfWord({ tags: [] }, nbs), 'Japanese');
});

t('legacy dùng vocab qua meoFeat', () => {
  assert.equal(legacy.includes('const classOf=meoFeat.vocab.classOf;'), true);
  assert.equal(legacy.includes('const nbOf=meoFeat.vocab.nbOf;'), true);
});

console.log(`\n${passed} kiểm thử đạt.`);
