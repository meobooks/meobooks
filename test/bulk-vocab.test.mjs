// Kiểm thử src/features/bulk-vocab.js (phân tích nhập hàng loạt từ vựng tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as B from '../src/features/bulk-vocab.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

t('parseBulkLines: đọc đúng từ, cách đọc, nghĩa, ví dụ và gắn sổ', () => {
  const rows = B.parseBulkLines('維持 - いじ - Duy trì - 健康を維持する', 'nb1');
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], { word: '維持', reading: 'いじ', meaning: 'Duy trì', example_jp: '健康を維持する', tags: ['nb:nb1'] });
});

t('parseBulkLines: bỏ dòng thiếu từ hoặc nghĩa, bỏ khoảng trắng thừa', () => {
  const rows = B.parseBulkLines('  食べる - たべる - ăn  \n\nthiếu nghĩa - x\n飲む - のむ - uống', '');
  assert.deepEqual(rows.map((r) => r.word), ['食べる', '飲む']);
  assert.deepEqual(rows[0].tags, []);
});

t('parseBulkLines: đầu vào rỗng hoặc không phải chuỗi trả về mảng rỗng', () => {
  assert.deepEqual(B.parseBulkLines('', 'x'), []);
  assert.deepEqual(B.parseBulkLines(null, 'x'), []);
});

t('parseVocabPaste: tách bằng - | : ; hoặc tab, id dựa trên now và số dòng', () => {
  const rows = B.parseVocabPaste('食べる|たべる|ăn|ăn cơm\n飲む:のむ:uống', 1000);
  assert.equal(rows[0].id, 'v-bulk-1000-0');
  assert.equal(rows[1].id, 'v-bulk-1000-1');
  assert.equal(rows[0].word, '食べる');
  assert.equal(rows[0].kanji, '食べる');
  assert.equal(rows[0].example, 'ăn cơm');
  assert.equal(rows[0].status, 'learning');
  assert.equal(rows[1].meaning, 'uống');
});

t('parseVocabPaste: thiếu cột thì nghĩa lấy từ cách đọc, không có ví dụ', () => {
  const [r] = B.parseVocabPaste('見る\tみる', 5);
  assert.equal(r.meaning, 'みる');
  assert.equal(r.example, '');
});

t('parseVocabPaste: bỏ khoảng trắng đầu/cuối toàn bộ văn bản', () => {
  assert.equal(B.parseVocabPaste('   \n  ', 1).length, 1);
  assert.equal(B.parseVocabPaste('   ', 1)[0].word, '');
});

t('legacy: dùng module cho nhập hàng loạt JLPT và nhập dán', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  const jlptVocabSrc = readFileSync(new URL('../src/ui/jlpt-vocab.js', import.meta.url), 'utf8');
  assert.ok(jlptVocabSrc.includes('meoFeat.bulkVocab.parseBulkLines(bulk,bulkNb||firstNb)'));
  assert.ok(legacy.includes('meoFeat.bulkVocab.parseVocabPaste(Ve)'));
});

console.log(`\n${pass} kiểm thử đạt`);
