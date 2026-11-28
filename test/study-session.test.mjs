// Kiểm thử src/features/study-session.js (dựng phiên học JLPT và tiến độ View tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '../src/features/study-session.js';
import { FULL_STEPS } from '../src/features/smart-session.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const rng = () => 0.5;
const words = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, word: id, meaning: 'm' + id }));

t('isDue: chưa có lịch, thiếu next_review, hoặc đến hạn thì đến hạn', () => {
  const srs = { a: { next_review: '2026-11-20' }, b: { next_review: '2026-12-01' }, c: {} };
  assert.equal(S.isDue({ id: 'x' }, srs, '2026-11-27'), true);
  assert.equal(S.isDue({ id: 'a' }, srs, '2026-11-27'), true);
  assert.equal(S.isDue({ id: 'b' }, srs, '2026-11-27'), false);
  assert.equal(S.isDue({ id: 'c' }, srs, '2026-11-27'), true);
});

t('viewWords: giữ thứ tự wordIds và bỏ từ đã xóa', () => {
  const view = { wordIds: ['c', 'zz', 'a'] };
  assert.deepEqual(S.viewWords(view, words).map((v) => v.id), ['c', 'a']);
});

t('viewProgress: tách từ đã học và chưa học theo doneIds', () => {
  const view = { wordIds: ['a', 'b', 'c'], doneIds: ['b'] };
  const p = S.viewProgress(view, words);
  assert.deepEqual(p.all.map((v) => v.id), ['a', 'b', 'c']);
  assert.deepEqual(p.pending.map((v) => v.id), ['a', 'c']);
  assert.equal(p.doneN, 1);
});

t('buildSmartSession: không xáo, không lượt -> plan null, qi 0, giới hạn maxCount', () => {
  const s = S.buildSmartSession({ title: 'T', words, maxCount: 3, mixSize: 0, rng });
  assert.equal(s.kind, 'smart');
  assert.equal(s.queue.length, 3);
  assert.equal(s.mix, false);
  assert.equal(s.plan, null);
  assert.equal(s.qi, 0);
  assert.deepEqual(s.src, ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.equal(s.round, 1);
  assert.equal(s.requeueNotice, null);
});

t('buildSmartSession: có mixSize -> plan đủ số bước và qi lấy từ plan', () => {
  const s = S.buildSmartSession({ title: 'T', words: words.slice(0, 2), maxCount: 2, mixSize: 5, rng });
  assert.equal(s.mix, true);
  assert.equal(s.plan.length, 2 * FULL_STEPS.length);
  assert.equal(s.qi, s.plan[0]);
});

t('buildSmartSession: kind và viewRef được truyền đúng', () => {
  const s = S.buildSmartSession({ kind: 'view', title: 'V', viewRef: { nbId: 'n', viewId: 'v' }, words: words.slice(0, 1), maxCount: 1, rng });
  assert.equal(s.kind, 'view');
  assert.deepEqual(s.viewRef, { nbId: 'n', viewId: 'v' });
});

t('buildSkimSession: 2 bước mỗi từ, lượt 5 từ, kind skim', () => {
  const s = S.buildSkimSession({ title: 'L', words, rng });
  assert.equal(s.kind, 'skim');
  assert.equal(s.mixSize, 5);
  assert.equal(s.queue.every((it) => it.stage === 'skim' && it.steps.length === 2), true);
  assert.equal(s.plan.length, words.length * 2);
  assert.equal(s.maxCount, words.length);
});

t('legacy: dùng module cho due, viewProgress và hai hàm khởi tạo phiên', () => {
  const legacy = ['../public/legacy/index.html', '../src/ui/jlpt-study.js', '../src/ui/jlpt-hook.js', '../src/ui/jlpt-game.js']
    .map((p) => readFileSync(new URL(p, import.meta.url), 'utf8')).join('\n'); // code JLPT đã tách nằm trong src/ui
  assert.ok((legacy + readFileSync(new URL('../src/ui/jlpt-study.js', import.meta.url), 'utf8')).includes('meoFeat.studySession.isDue(N,o.srs,today)'));
  assert.ok(legacy.includes('meoFeat.studySession.viewProgress(view,o.vocab)'));
  assert.ok(legacy.includes('meoFeat.studySession.buildSmartSession('));
  assert.ok(legacy.includes('meoFeat.studySession.buildSkimSession('));
});

console.log(`\n${pass} kiểm thử đạt`);
