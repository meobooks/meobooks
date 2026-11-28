// Kiểm thử src/features/progression.js (cấp độ EXP và huy hiệu JLPT tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as P from '../src/features/progression.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

t('lvlInfo: cấp 1 khi chưa có EXP, cần 10 EXP', () => {
  assert.deepEqual(P.lvlInfo(0), { level: 1, into: 0, need: 10 });
  assert.deepEqual(P.lvlInfo(9), { level: 1, into: 9, need: 10 });
});

t('lvlInfo: nhu cầu EXP nhân đôi mỗi cấp', () => {
  assert.deepEqual(P.lvlInfo(10), { level: 2, into: 0, need: 20 });
  assert.deepEqual(P.lvlInfo(30), { level: 3, into: 0, need: 40 });
  assert.deepEqual(P.lvlInfo(35), { level: 3, into: 5, need: 40 });
});

t('lvlInfo: EXP âm hoặc không hợp lệ coi như 0', () => {
  assert.equal(P.lvlInfo(-5).level, 1);
  assert.equal(P.lvlInfo('abc').into, 0);
});

t('levelOf trả về cấp hiện tại', () => {
  assert.equal(P.levelOf(30), 3);
});

t('ACH_DEFS: đủ 8 huy hiệu, id duy nhất', () => {
  assert.equal(P.ACH_DEFS.length, 8);
  assert.equal(new Set(P.ACH_DEFS.map((m) => m.id)).size, 8);
});

t('ACH_DEFS: điều kiện đạt đúng ngưỡng', () => {
  const byId = Object.fromEntries(P.ACH_DEFS.map((m) => [m.id, m]));
  assert.equal(byId.words_50.test({ vocab: 49 }), false);
  assert.equal(byId.words_50.test({ vocab: 50 }), true);
  assert.equal(byId.streak_7.test({ streak: 6 }), false);
  assert.equal(byId.streak_7.test({ streak: 7 }), true);
  assert.equal(byId.level_5.test({ level: 5 }), true);
  assert.equal(byId.first_session.test({ sessions: 0 }), false);
  assert.equal(byId.perfect.test({ perfect: true }), true);
});

t('newlyUnlocked: bỏ qua huy hiệu đã có, chỉ trả về huy hiệu mới đạt', () => {
  const stats = { vocab: 60, streak: 0, level: 1, sessions: 1, perfect: false };
  const got = P.newlyUnlocked(P.ACH_DEFS, stats, ['first_word']).map((m) => m.id);
  assert.deepEqual(got, ['words_50', 'first_session']);
});

t('newlyUnlocked: không có owned thì trả về tất cả huy hiệu đạt', () => {
  const got = P.newlyUnlocked(P.ACH_DEFS, { vocab: 1, streak: 0, level: 1, sessions: 0, perfect: false }).map((m) => m.id);
  assert.deepEqual(got, ['first_word']);
});

t('legacy: dùng module cho cấp độ, huy hiệu và vòng mở khóa', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('lvlInfo=meoFeat.progression.lvlInfo'));
  assert.ok(legacy.includes('ACH_DEFS=meoFeat.progression.ACH_DEFS'));
  const hookSrc = readFileSync(new URL('../src/ui/jlpt-hook.js', import.meta.url), 'utf8');
  assert.ok(hookSrc.includes('meoFeat.progression.newlyUnlocked(ACH_DEFS,p,l.ach)'));
  assert.ok(!legacy.includes('let n=1,need=10,left='));
});

console.log(`\n${pass} kiểm thử đạt`);
