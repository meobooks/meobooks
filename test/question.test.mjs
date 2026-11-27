// Kiểm thử src/features/question.js (dựng câu hỏi JLPT tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as Q from '../src/features/question.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const rng = () => 0.5;

const pool = [
  { id: 'a', word: '食べる', kanji: '食べる', reading: 'たべる', meaning: 'ăn', sino_viet: 'Thực', example_jp: '毎日食べる', example_vi: 'ăn hằng ngày' },
  { id: 'b', word: '飲む', kanji: '飲む', reading: 'のむ', meaning: 'uống' },
  { id: 'c', word: '見る', kanji: '見る', reading: 'みる', meaning: 'nhìn' },
  { id: 'd', word: '聞く', kanji: '聞く', reading: 'きく', meaning: 'nghe' },
  { id: 'e', word: '書く', kanji: '書く', reading: 'かく', meaning: 'viết' },
];
const a = pool[0];

t('front: ưu tiên kanji rồi đến word', () => {
  assert.equal(Q.front({ kanji: '食', word: '食べる' }), '食');
  assert.equal(Q.front({ word: 'ひと' }), 'ひと');
});

t('pickOpts: có đáp án đúng, tối đa 4, không lặp, không lấy chính từ đó làm nhiễu', () => {
  const opts = Q.pickOpts(pool, a, (b) => b.meaning, a.meaning, rng);
  assert.equal(opts.length, 4);
  assert.equal(new Set(opts).size, 4);
  assert.ok(opts.includes('ăn'));
});

t('pickOpts: pool quá nhỏ thì trả về ít hơn 4 đáp án', () => {
  const opts = Q.pickOpts([a], a, (b) => b.meaning, a.meaning, rng);
  assert.deepEqual(opts, ['ăn']);
});

t('hintOf: đủ các gợi ý theo thứ tự', () => {
  assert.deepEqual(Q.hintOf(a), ['Cách đọc: たべる', 'Hán Việt: Thực', 'Nghĩa: ăn', 'Ví dụ: 毎日食べる — ăn hằng ngày']);
});

t('buildQuestion jp_to_vi: prompt là chữ, đáp án đúng là nghĩa, có sub là cách đọc', () => {
  const q = Q.buildQuestion('jp_to_vi', a, pool, rng);
  assert.equal(q.prompt, '食べる');
  assert.equal(q.correct, 'ăn');
  assert.equal(q.sub, 'たべる');
  assert.ok(q.options.includes('ăn') && q.options.length === 4);
});

t('buildQuestion vi_to_jp: prompt là nghĩa, đáp án đúng là chữ', () => {
  const q = Q.buildQuestion('vi_to_jp', a, pool, rng);
  assert.equal(q.prompt, 'ăn');
  assert.equal(q.correct, '食べる');
  assert.ok(q.options.includes('食べる'));
});

t('buildQuestion type_reading: chấp nhận cách đọc, word, kanji; bỏ gợi ý cách đọc', () => {
  const q = Q.buildQuestion('type_reading', a, pool, rng);
  assert.deepEqual(q.accepts, ['たべる', '食べる', '食べる']);
  assert.ok(q.hint.every((x) => !x.startsWith('Cách đọc')));
});

t('buildQuestion type_meaning: tách nghĩa theo dấu phẩy/chấm phẩy và bỏ gợi ý nghĩa', () => {
  const q = Q.buildQuestion('type_meaning', { ...a, meaning: 'ăn, dùng bữa; xơi' }, pool, rng);
  assert.ok(q.accepts.includes('ăn') && q.accepts.includes('dùng bữa') && q.accepts.includes('xơi'));
  assert.ok(q.hint.every((x) => !x.startsWith('Nghĩa')));
});

t('buildQuestion type_word (mặc định): prompt là nghĩa, đáp án là chữ', () => {
  const q = Q.buildQuestion('type_word', a, pool, rng);
  assert.equal(q.mode, 'type_word');
  assert.equal(q.prompt, 'ăn');
  assert.equal(q.correct, '食べる');
});

t('legacy: dùng module thay vì định nghĩa lại', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('meoFeat.question.buildQuestion'));
  assert.ok(!legacy.includes('pickOpts=(o,a,c,b)=>'));
});

console.log(`\n${pass} kiểm thử đạt`);
