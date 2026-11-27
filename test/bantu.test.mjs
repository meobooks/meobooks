// Kiểm thử src/features/bantu.js (tiến độ ôn từ tách từ BanTu).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { btProg } from '../src/features/bantu.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

const pack = {
  vars: [
    { s: 'taberu', b: [[3, 5], [6, 2], [9, 4]] },
    { s: 'tabemono', b: [[2, 1]] },
  ],
};

t('btProg: không có chuỗi nhập thì 0', () => {
  assert.equal(btProg(pack, ''), 0);
});

t('btProg: không tìm thấy biến thì 0', () => {
  assert.equal(btProg(pack, 'miru'), 0);
});

t('btProg: cộng điểm các mốc có độ dài <= độ dài nhập, trên biến có tiền tố khớp', () => {
  // "tabe" khớp tiền tố của "taberu"; chỉ mốc [3,5] có e[0] <= 4 -> 5
  assert.equal(btProg(pack, 'tabe'), 5);
  // "taberu" (6 ký tự): cả [3,5] và [6,2] -> 7
  assert.equal(btProg(pack, 'taberu'), 7);
  // "tabem" khớp "tabemono" (mốc [2,1]) -> 1
  assert.equal(btProg(pack, 'tabem'), 1);
});

t('legacy dùng btProg từ meoFeat, không còn định nghĩa cũ', () => {
  assert.equal(legacy.includes('const btProg=meoFeat.bantu.btProg;'), true);
  assert.equal(legacy.includes('const btProg=(p,t)=>{'), false);
});

console.log(`\n${passed} kiểm thử đạt.`);
