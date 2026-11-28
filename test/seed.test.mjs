// Kiểm thử src/features/seed.js (dữ liệu mặc định cho tài khoản mới, tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { DEFAULT_NOTEBOOKS, createInitialSeed } from '../src/features/seed.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

// Mẫu ghi chú giả lập: chỉ cần đủ trường mà createInitialSeed đọc tới
const TPL = [null, { defaultVocab: [] }, { defaultGrammar: [] }, { defaultKanji: [] }, { defaultReading: [] }, { defaultListening: [] }, { defaultWriting: [] }];

t('DEFAULT_NOTEBOOKS: 4 sổ, id duy nhất, có môn học', () => {
  assert.equal(DEFAULT_NOTEBOOKS.length, 4);
  assert.equal(new Set(DEFAULT_NOTEBOOKS.map((n) => n.id)).size, 4);
  assert.deepEqual(DEFAULT_NOTEBOOKS.map((n) => n.subject), ['Japanese', 'Chinese', 'English', 'Personal']);
});

t('createInitialSeed: có đủ prefs, sổ, trang, thẻ, việc và tên hiển thị', () => {
  const s = createInitialSeed('Mochi', TPL);
  assert.equal(s.prefs.displayName, 'Mochi');
  assert.equal(s.notebooks.length, 4);
  assert.deepEqual(s.flashcards, []);
  assert.equal(s.tasks.length, 1);
  assert.equal(s.pages.length, 1);
});

t('createInitialSeed: tên mặc định khi không truyền tên', () => {
  assert.equal(createInitialSeed(undefined, TPL).prefs.displayName, 'Study Friend');
});

t('createInitialSeed: trang chào mừng thuộc một sổ có thật', () => {
  const s = createInitialSeed('Mochi', TPL);
  const ids = new Set(s.notebooks.map((n) => n.id));
  assert.ok(ids.has(s.pages[0].notebookId));
});

t('createInitialSeed: mỗi sổ có createdAt/updatedAt là chuỗi ISO', () => {
  for (const n of createInitialSeed('x', TPL).notebooks) {
    assert.match(n.createdAt, /^\d{4}-\d\d-\d\dT/);
    assert.match(n.updatedAt, /^\d{4}-\d\d-\d\dT/);
  }
});

t('createInitialSeed: không sửa DEFAULT_NOTEBOOKS (mỗi lần tạo là bản sao mới)', () => {
  const before = JSON.stringify(DEFAULT_NOTEBOOKS);
  createInitialSeed('a', TPL);
  assert.equal(JSON.stringify(DEFAULT_NOTEBOOKS), before);
});

t('legacy: dùng module seed và truyền NOTE_TEMPLATES', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('createInitialSeed=o=>meoFeat.seed.createInitialSeed(o,NOTE_TEMPLATES)'));
  assert.ok(legacy.includes('DEFAULT_NOTEBOOKS=meoFeat.seed.DEFAULT_NOTEBOOKS'));
  assert.ok(!legacy.includes('DEFAULT_NOTEBOOKS=[{id:"nb-jp"'));
});

console.log(`\n${pass} kiểm thử đạt`);
