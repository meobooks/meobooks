// Kiểm thử src/features/answer.js (kiểm đáp án tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as A from '../src/features/answer.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('norm: bỏ khoảng trắng, chữ thường', () => {
  assert.equal(A.norm('  Ab C '), 'abc');
});

t('headOf4: lấy phần trước dấu phẩy', () => {
  assert.equal(A.headOf4('kanji, nghĩa'), 'kanji');
});

t('exactOk: khớp sau chuẩn hóa', () => {
  assert.equal(A.exactOk('ABC', ['abc']), true);
  assert.equal(A.exactOk('abd', ['abc']), false);
});

t('lenientOk: cho phép sai nhẹ theo độ dài', () => {
  assert.equal(A.lenientOk('tabeta', ['tabeta']), true);
  assert.equal(A.lenientOk('tabete', ['tabeta']), true);   // 1 lỗi, độ dài 6 -> cho 1
  assert.equal(A.lenientOk('xyz', ['tabeta']), false);
  assert.equal(A.lenientOk('', ['tabeta']), false);
});

t('legacy dùng answer qua meoFeat', () => {
  assert.equal(legacy.includes('const exactOk=meoFeat.answer.exactOk;'), true);
  assert.equal(legacy.includes('const lenientOk=meoFeat.answer.lenientOk;'), true);
});

console.log(`\n${passed} kiểm thử đạt.`);
