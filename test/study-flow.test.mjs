// Kiểm thử src/features/study-flow.js (luồng trạng thái từng từ JLPT tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/features/study-flow.js';
import { FULL_STEPS } from '../src/features/smart-session.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const item = (over = {}) => ({ vocabId: 'v1', attempt: 1, stage: 'full', steps: [...FULL_STEPS], si: 0, failedThisPass: false, testsPassedInAttempt2: 0, ...over });

t('isTestStep: nhận đúng 3 bài kiểm tra tự luận', () => {
  assert.equal(F.isTestStep('type_reading'), true);
  assert.equal(F.isTestStep('type_meaning'), true);
  assert.equal(F.isTestStep('type_word'), true);
  assert.equal(F.isTestStep('jp_to_vi'), false);
});

t('markAnswer: sai thì đánh dấu failedThisPass và giữ nguyên dấu đã sai', () => {
  assert.equal(F.markAnswer(item(), 'jp_to_vi', false).failedThisPass, true);
  assert.equal(F.markAnswer(item({ failedThisPass: true }), 'jp_to_vi', true).failedThisPass, true);
  assert.equal(F.markAnswer(item(), 'jp_to_vi', true).failedThisPass, false);
});

t('markAnswer: chỉ đếm bài kiểm tra đúng ở lần học lại (attempt >= 2)', () => {
  assert.equal(F.markAnswer(item({ attempt: 1 }), 'type_word', true).testsPassedInAttempt2, 0);
  assert.equal(F.markAnswer(item({ attempt: 2, testsPassedInAttempt2: 1 }), 'type_word', true).testsPassedInAttempt2, 2);
  assert.equal(F.markAnswer(item({ attempt: 2, testsPassedInAttempt2: 1 }), 'type_word', false).testsPassedInAttempt2, 1);
  assert.equal(F.markAnswer(item({ attempt: 2, testsPassedInAttempt2: 1 }), 'jp_to_vi', true).testsPassedInAttempt2, 1);
});

t('retryItemOf (full): lần 2 đã đúng 3 bài kiểm tra -> chuyển sang củng cố', () => {
  const r = F.retryItemOf(item({ attempt: 2, testsPassedInAttempt2: 3 }));
  assert.equal(r.stage, 'reinforce');
  assert.deepEqual(r.steps, ['jp_to_vi', 'vi_to_jp']);
  assert.equal(r.attempt, 2);
  assert.equal(r.testsPassedInAttempt2, 3);
});

t('retryItemOf (full): sai thì học lại từ đầu với attempt + 1', () => {
  const r = F.retryItemOf(item({ failedThisPass: true, attempt: 1 }));
  assert.equal(r.stage, 'full');
  assert.equal(r.attempt, 2);
  assert.deepEqual(r.steps, FULL_STEPS);
  assert.equal(r.testsPassedInAttempt2, 0);
  assert.equal(r.failedThisPass, false);
});

t('retryItemOf (full): không sai và chưa đủ 3 bài -> null', () => {
  assert.equal(F.retryItemOf(item({ attempt: 1 })), null);
  assert.equal(F.retryItemOf(item({ attempt: 2, testsPassedInAttempt2: 2 })), null);
});

t('retryItemOf (skim): chỉ lặp lại khi sai, dùng 2 bước củng cố', () => {
  assert.equal(F.retryItemOf(item({ stage: 'skim', steps: ['jp_to_vi', 'vi_to_jp'], failedThisPass: true })).stage, 'skim');
  assert.equal(F.retryItemOf(item({ stage: 'skim', steps: ['jp_to_vi', 'vi_to_jp'] })), null);
});

t('retryItemOf (reinforce): sai thì quay lại 5 bước đầy đủ', () => {
  const r = F.retryItemOf(item({ stage: 'reinforce', attempt: 2, steps: ['jp_to_vi', 'vi_to_jp'], failedThisPass: true }));
  assert.equal(r.stage, 'full');
  assert.equal(r.attempt, 3);
  assert.equal(F.retryItemOf(item({ stage: 'reinforce', steps: ['jp_to_vi', 'vi_to_jp'] })), null);
});

t('legacy: dùng module cho markAnswer và retryItemOf', () => {
  const legacy = ['../public/legacy/index.html', '../src/ui/jlpt-study.js', '../src/ui/jlpt-hook.js', '../src/ui/jlpt-game.js']
    .map((p) => readFileSync(new URL(p, import.meta.url), 'utf8')).join('\n'); // code JLPT đã tách nằm trong src/ui
  assert.ok((legacy + readFileSync(new URL('../src/ui/jlpt-study.js', import.meta.url), 'utf8')).includes('meoFeat.studyFlow.markAnswer(curItem,mode,isCorrect)'));
  assert.ok(legacy.includes('meoFeat.studyFlow.retryItemOf(curItem)'));
  assert.ok(!legacy.includes('const isTestStep=mode==='));
});

console.log(`\n${pass} kiểm thử đạt`);
