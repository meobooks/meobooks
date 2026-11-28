// Kiểm thử src/features/reader.js (logic đọc trang và sách tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as R from '../src/features/reader.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('grammarListOf: ưu tiên grammarList, hỗ trợ grammarData cũ', () => {
  assert.deepEqual(R.grammarListOf({ grammarList: [{ id: 'x' }] }), [{ id: 'x' }]);
  assert.deepEqual(R.grammarListOf({ type: 'grammar', grammarData: { structure: 'S' } }), [{ id: 'g0', structure: 'S' }]);
  assert.deepEqual(R.grammarListOf({ type: 'vocab' }), []);
});

t('extraEntriesOf: chỉ loại reading, listening, writing và bỏ mục rỗng', () => {
  assert.deepEqual(R.extraEntriesOf({ type: 'reading', readingData: { a: 'x', b: '' } }), [['a', 'x']]);
  assert.deepEqual(R.extraEntriesOf({ type: 'vocab', vocabData: { a: 'x' } }), []);
});

t('hasInkStrokes', () => {
  assert.equal(R.hasInkStrokes({ ink: { strokes: [1] } }), true);
  assert.equal(R.hasInkStrokes({ ink: { strokes: [] } }), false);
  assert.equal(R.hasInkStrokes({}), false);
});

t('bookBounds và startLeafIndex', () => {
  assert.deepEqual(R.bookBounds(5), { maxS: 2, maxC: 4 });
  const leaves = [{ cover: true, title: 'T' }, { id: 'p1' }, { id: 'p2' }];
  assert.equal(R.startLeafIndex(leaves, 'p2'), 2);
  assert.equal(R.startLeafIndex(leaves, 'zz'), 0);
});

t('canTurn: không lật quá giới hạn ở cả hai chế độ', () => {
  assert.equal(R.canTurn('next', false, 0, 0, 2, 4), true);
  assert.equal(R.canTurn('next', false, 2, 0, 2, 4), false);
  assert.equal(R.canTurn('prev', false, 0, 0, 2, 4), false);
  assert.equal(R.canTurn('next', true, 0, 4, 2, 4), false);
  assert.equal(R.canTurn('prev', true, 0, 1, 2, 4), true);
});

t('legacy dùng reader qua meoFeat', () => {
  assert.equal(legacy.includes('meoFeat.reader.canTurn(dir,single,s,ci,maxS,maxC)'), true);
  assert.equal(legacy.includes('meoFeat.reader.bookBounds(n)'), true);
  const pageReadSrc = readFileSync(new URL('../src/ui/page-read.js', import.meta.url), 'utf8');
  assert.equal(pageReadSrc.includes('const hasInk=meoFeat.reader.hasInkStrokes(p);'), true);
});

console.log(`\n${passed} kiểm thử đạt.`);
