// Kiểm thử src/features/vocab-list.js (lọc, gợi ý, đếm và kiểm tra trùng từ JLPT tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as L from '../src/features/vocab-list.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

const vocab = [
  { id: '1', word: '食べる', kanji: '食べる', reading: 'たべる', meaning: 'ăn', status: 'learning', favorite: true, created_at: '2026-11-01T00:00:00Z' },
  { id: '2', word: '飲む', kanji: '飲む', reading: 'のむ', meaning: 'uống', status: 'new', favorite: false, created_at: '2026-11-05T00:00:00Z' },
  { id: '3', word: '見る', kanji: '見る', reading: 'みる', meaning: 'nhìn', status: 'mastered', favorite: true, created_at: '2026-11-03T00:00:00Z' },
];

t('filterVocab: mặc định trả về tất cả, sắp mới nhất trước', () => {
  assert.deepEqual(L.filterVocab({ vocab }).map((v) => v.id), ['2', '3', '1']);
});

t('filterVocab: lọc theo trạng thái và yêu thích', () => {
  assert.deepEqual(L.filterVocab({ vocab, status: 'mastered' }).map((v) => v.id), ['3']);
  assert.deepEqual(L.filterVocab({ vocab, favOnly: true }).map((v) => v.id), ['3', '1']);
});

t('filterVocab: tìm theo chữ, cách đọc, nghĩa (không phân biệt hoa thường, bỏ khoảng trắng đầu cuối)', () => {
  assert.deepEqual(L.filterVocab({ vocab, q: '  NHÌN ' }).map((v) => v.id), ['3']);
  assert.deepEqual(L.filterVocab({ vocab, q: 'のむ' }).map((v) => v.id), ['2']);
  assert.deepEqual(L.filterVocab({ vocab, q: 'không có' }), []);
});

t('filterVocab: lọc theo nhóm tough/learn/known qua classOf', () => {
  const vs = { 2: { ok: 0, bad: 3, streak: 0 } };
  assert.deepEqual(L.filterVocab({ vocab, vs, cls: 'tough' }).map((v) => v.id), ['2']);
  assert.deepEqual(L.filterVocab({ vocab, cls: 'known' }).map((v) => v.id), ['3']);
});

t('suggestionsFor: không gợi ý khi chưa nhập, bỏ chính từ đang sửa, giới hạn limit', () => {
  assert.deepEqual(L.suggestionsFor(vocab, { id: '9', word: '' }), []);
  assert.deepEqual(L.suggestionsFor(vocab, { id: '1', word: '食' }), []);
  assert.deepEqual(L.suggestionsFor(vocab, { id: '9', word: 'る' }, 1).length, 1);
  assert.deepEqual(L.suggestionsFor(vocab, { id: '9', word: 'る' }).map((v) => v.id), ['1', '3']);
});

t('statusCounts: đếm đúng từng trạng thái', () => {
  assert.deepEqual(L.statusCounts(vocab), { learning: 1, new: 1, mastered: 1 });
  assert.deepEqual(L.statusCounts([]), {});
});

t('liveDuplicate: tìm trùng theo kanji, bỏ qua chính bản ghi đang sửa', () => {
  const findDup = (k) => vocab.find((v) => v.kanji === k || v.word === k) || null;
  assert.equal(L.liveDuplicate({ word: '食べる', kanji: '食べる' }, null, findDup).id, '1');
  assert.equal(L.liveDuplicate({ word: '食べる', kanji: '食べる' }, '1', findDup), null);
  assert.equal(L.liveDuplicate({ word: '', kanji: '' }, null, findDup), null);
  assert.equal(L.liveDuplicate({ word: '新', kanji: '' }, null, () => null), null);
});

t('legacy: dùng module cho lọc, gợi ý, đếm và kiểm tra trùng', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('meoFeat.vocabList.filterVocab('));
  assert.ok(legacy.includes('meoFeat.vocabList.suggestionsFor(o.vocab,u,5)'));
  assert.ok(legacy.includes('meoFeat.vocabList.statusCounts(o.vocab)'));
  assert.ok(legacy.includes('meoFeat.vocabList.liveDuplicate(u,R,o.findDup)'));
});

console.log(`\n${pass} kiểm thử đạt`);
