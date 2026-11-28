// Kiểm thử src/features/mochi-pet.js và cách legacy nối vào nó.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as M from '../src/features/mochi-pet.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');

let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

const HOUR = 3600000;
const NOW = Date.UTC(2026, 10, 27, 12, 0, 0);

t('decayedStats: giảm 3 no bụng và 2 tâm trạng mỗi giờ', () => {
  const base = { food: 80, mood: 80, ts: new Date(NOW - 10 * HOUR).toISOString() };
  assert.deepEqual(M.decayedStats(base, NOW), { food: 50, mood: 60 });
});

t('decayedStats: kẹp trong khoảng 0..100 và làm tròn', () => {
  const longAgo = { food: 20, mood: 5, ts: new Date(NOW - 100 * HOUR).toISOString() };
  assert.deepEqual(M.decayedStats(longAgo, NOW), { food: 0, mood: 0 });
  assert.deepEqual(M.decayedStats({ food: 99.6, mood: 150, ts: null }, NOW), { food: 100, mood: 100 });
});

t('decayedStats: không có ts thì không giảm', () => {
  assert.deepEqual(M.decayedStats({ food: 70, mood: 60, ts: null }, NOW), { food: 70, mood: 60 });
});

t('cooldownLeft: 10 phút, không âm', () => {
  assert.equal(M.PET_COOLDOWN_MS, 600000);
  assert.equal(M.cooldownLeft(NOW, NOW), 600000);
  assert.equal(M.cooldownLeft(NOW - 600000, NOW), 0);
  assert.equal(M.cooldownLeft(NOW - 900000, NOW), 0);
  assert.equal(M.cooldownLeft(undefined, NOW), 0);
});

t('afterAction: không đủ XP thì trả về null', () => {
  assert.equal(M.afterAction({ food: 50, mood: 50, spent: 0, balance: 4, lastPet: 0 }, 5, 0, 0, NOW), null);
});

t('afterAction: trừ XP, kẹp chỉ số, giữ lastPet khi không có extra', () => {
  const next = M.afterAction({ food: 90, mood: 99, spent: 30, balance: 50, lastPet: 1234 }, 10, 25, 3, NOW);
  assert.equal(next.food, 100);
  assert.equal(next.mood, 100);
  assert.equal(next.xpSpent, 40);
  assert.equal(next.lastPet, 1234);
  assert.equal(next.ts, new Date(NOW).toISOString());
});

t('afterAction: extra ghi đè (vuốt ve cập nhật lastPet)', () => {
  const next = M.afterAction({ food: 40, mood: 40, spent: 0, balance: 0, lastPet: 0 }, 0, 0, 10, NOW, { lastPet: NOW });
  assert.equal(next.lastPet, NOW);
  assert.equal(next.mood, 50);
});

t('MochiPet gọi đúng 4 chỗ qua meoFeat (nay trong src/ui/mochi-pet.js), legacy không còn thẻ script cũ', () => {
  const petUi = readFileSync(new URL('../src/ui/mochi-pet.js', import.meta.url), 'utf8');
  const count = (s) => petUi.split(s).length - 1;
  assert.equal(count('petLogic=meoFeat.mochiPet'), 1);
  assert.equal(count('petLogic.decayedStats(base,now)'), 1);
  assert.equal(count('petLogic.cooldownLeft(base.lastPet,now)'), 1);
  assert.equal(count('petLogic.afterAction({food,mood,spent,balance,lastPet:base.lastPet},cost,dFood,dMood,now,extra)'), 1);
  assert.equal(legacy.split('src="mochi-pet.js"').length - 1, 0);
});

console.log(`\n${passed} kiểm thử đạt.`);
