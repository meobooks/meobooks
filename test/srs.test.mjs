// Kiểm thử src/features/srs.js (lịch ôn SM-2, ngày, planToday tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as S from '../src/features/srs.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('dayKey và addDaysKey theo định dạng YYYY-MM-DD', () => {
  assert.equal(S.dayKey(new Date(2026, 10, 27)), '2026-11-27');
  assert.equal(S.addDaysKey('2026-11-27', 3), '2026-11-30');
  assert.equal(S.addDaysKey('2026-11-30', -3), '2026-11-27');
});

t('idxOf: thứ 2 là 0, 27/11/2026 là thứ 6 (chỉ số 4)', () => {
  assert.equal(S.idxOf('2026-11-27'), 4);
  assert.equal(S.idxOf('2026-11-23'), 0);
});

t('sm2: trả lời kém (<3) đặt lại chuỗi', () => {
  const r = S.sm2({ ease_factor: 2.5, interval_days: 6, repetitions: 2 }, 2);
  assert.equal(r.repetitions, 0);
  assert.equal(r.interval_days, 1);
  assert.equal(r.ease_factor, 2.18);
});

t('sm2: trả lời tốt tăng chuỗi và độ dễ', () => {
  const r = S.sm2({ ease_factor: 2.5, interval_days: 1, repetitions: 1 }, 5);
  assert.equal(r.repetitions, 2);
  assert.equal(r.interval_days, 6);
  assert.equal(r.ease_factor, 2.6);
});

t('planToday: chạy được với một từ mới', () => {
  const jl = { vocab: [{ id: 'a', created_at: '2026-11-20T00:00:00Z' }], srs: {} };
  const res = S.planToday(jl, undefined);
  assert.equal(typeof res, 'object');
  assert.equal(res.fresh, 1);
});

t('planToday: nhánh đầy đủ (ôn đến hạn, quá hạn, từ khó, lịch 7 ngày)', () => {
  const today = S.dayKey();
  const past = S.addDaysKey(today, -2);
  const old = S.addDaysKey(today, -10) + 'T00:00:00Z';
  const jl = {
    vocab: [{ id: 'a', created_at: old }, { id: 'b', created_at: old }, { id: 'c', created_at: old }, { id: 'd', created_at: old }],
    srs: {
      a: { last_reviewed: past, repetitions: 3, next_review: past, interval_days: 1, ease_factor: 2.5 },
      b: { last_reviewed: past, repetitions: 2, next_review: S.addDaysKey(today, 4), interval_days: 4, ease_factor: 2.5 },
      c: { last_reviewed: null, repetitions: 0, next_review: today, interval_days: 0, ease_factor: 2.5 },
    },
  };
  const S2 = { plan: { newPerDay: 3, days: [1, 1, 1, 1, 1, 1, 1] }, vstats: { a: { ok: 1, bad: 4, streak: 0 } }, activity: { [past]: { xp: 5 } } };
  const r = S.planToday(jl, S2);
  assert.equal(r.due, 1);
  assert.equal(r.overdue, 1);
  assert.equal(r.hard, 1);
  assert.equal(r.fresh, 2);
  assert.equal(r.days.length, 7);
});

t('legacy dùng srs và planToday qua meoFeat', () => {
  assert.equal(legacy.includes('const planToday=meoFeat.srs.planToday;'), true);
  assert.equal(legacy.includes('sm2=meoFeat.srs.sm2'), true);
  assert.equal(legacy.includes('dayKey=meoFeat.srs.dayKey'), true);
});

console.log(`\n${passed} kiểm thử đạt.`);
