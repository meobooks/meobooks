// Kiểm thử src/features/roadmap.js (logic Lantern Lane tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as RM from '../src/features/roadmap.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

const levels = [{ id: 'n5' }, { id: 'n4' }];

t('resolveLevel: giữ cấp đang chọn nếu có, không thì lấy cấp đầu', () => {
  assert.equal(RM.resolveLevel(levels, 'n4'), 'n4');
  assert.equal(RM.resolveLevel(levels, 'zz'), 'n5');
  assert.equal(RM.resolveLevel(undefined, 'n4'), undefined);
});

t('booksFor: lọc theo cấp và ngôn ngữ, mặc định ja', () => {
  const books = [
    { id: 1, level: 'n5' },
    { id: 2, level: 'n5', lang: 'zh' },
    { id: 3, level: 'n4', lang: 'ja' },
  ];
  assert.deepEqual(RM.booksFor(books, 'n5', 'ja').map((b) => b.id), [1]);
  assert.deepEqual(RM.booksFor(books, 'n5', 'zh').map((b) => b.id), [2]);
});

t('legacy dùng roadmap qua meoFeat', () => {
  assert.equal(legacy.includes('meoFeat.roadmap.resolveLevel(RM_LV_BY_LANG[lg],lv)'), true);
  assert.equal(legacy.includes('meoFeat.roadmap.booksFor(books,lvE,lg)'), true);
});

console.log(`\n${passed} kiểm thử đạt.`);
// Bổ sung: rmNorm (chuẩn hóa chuỗi so khớp)
import * as RM2 from '../src/features/roadmap.js';
assert.equal(RM2.rmNorm('  Hello   World '), 'hello world');
console.log('ok - rmNorm: bỏ khoảng trắng thừa, chữ thường');

// Cấp độ tiếng Trung phải khớp với dữ liệu roadmap_books trên Supabase (có hsk7-9)
const legacyRM = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
assert.equal(legacyRM.includes('{id:"hsk7-9",title:"HSK 7–9"}'), true);
console.log('ok - cấp độ tiếng Trung có HSK 7–9');
