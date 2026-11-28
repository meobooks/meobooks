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

t('N2Roadmap dùng roadmap qua meoFeat (nay nằm trong src/ui/n2-roadmap.js)', () => {
  const n2 = readFileSync(new URL('../src/ui/n2-roadmap.js', import.meta.url), 'utf8');
  assert.equal(n2.includes('meoFeat.roadmap.resolveLevel(RM_LV_BY_LANG[lg],lv)'), true);
  assert.equal(n2.includes('meoFeat.roadmap.booksFor(books,lvE,lg)'), true);
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

// parseVocabLines: bảng từ vựng tiếng Trung
import { parseVocabLines } from '../src/features/roadmap.js';
const sample = '1|爱|ài|yêu; thích|我爱你。|Wǒ ài nǐ.|Tôi yêu bạn.\n2|吧|ba|nhé; đi; chứ|我们走吧。|Wǒmen zǒu ba.|Chúng ta đi nhé.';
const rows = parseVocabLines(sample);
assert.equal(rows.length, 2);
assert.equal(rows[0].word, '爱');
assert.equal(rows[0].pinyin, 'ài');
assert.equal(rows[0].meaning, 'yêu; thích');
assert.equal(rows[0].example, '我爱你。');
assert.equal(rows[0].examplePinyin, 'Wǒ ài nǐ.');
assert.equal(rows[0].exampleMeaning, 'Tôi yêu bạn.');
assert.equal(parseVocabLines('Đây là đoạn văn bình thường.'), null);
assert.equal(parseVocabLines(''), null);
assert.equal(parseVocabLines('1|爱|ài|yêu'), null); // thiếu cột
console.log('ok - parseVocabLines nhận đúng bảng và bỏ qua văn bản thường');
assert.equal(readFileSync(new URL('../src/ui/rm-lesson.js', import.meta.url), 'utf8').includes('meoFeat.roadmap.parseVocabLines(l.content)'), true);
const vocabTableSrc = readFileSync(new URL('../src/ui/vocab-table.js', import.meta.url), 'utf8');
assert.equal(vocabTableSrc.includes('export function VocabTable('), true);
console.log('ok - VocabTable nằm trong src/ui/vocab-table.js và legacy dùng parseVocabLines');

// Kho từ: tick mở chọn sổ, bỏ tick xóa khỏi kho; App gắn khoAdd/khoRemove
const legacyKho = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
assert.equal(legacyKho.includes('khoAdd:khoAddFn,khoRemove:khoRemoveFn,notebooks:E'), true);
assert.equal(legacyKho.includes('const khoAddFn=async(row,nbId)=>{'), true);
assert.equal(legacyKho.includes('await Ge.deleteVocab(id)'), true);
assert.equal(readFileSync(new URL('../src/ui/n2-roadmap.js', import.meta.url), 'utf8').includes('khoAdd:khoAdd,khoRemove:khoRemove,notebooks:notebooks'), true);
console.log('ok - kho từ được nối từ App xuống bảng');
