// Kiểm thử tách bảng từ vựng (bước 10): VocabTable nằm trong src/ui/vocab-table.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/vocab-table.js xuất VocabTable và giữ khóa kho từ', () => {
  const s = read('src/ui/vocab-table.js');
  assert.ok(s.includes('export function VocabTable({rows,lessonId,theme:a,khoAdd,khoRemove,notebooks})'));
  assert.ok(s.includes('const key="rm_kho_"+lessonId;'));
  assert.ok(s.includes('Chưa có sổ nào. Hãy tạo sổ trước.'));
});

t('src/ui/index.js gom VocabTable', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { VocabTable } from './vocab-table.js';"));
  assert.ok(s.includes('VocabTable, InteractiveSentenceCard, makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson };'));
});

t('legacy: VocabTable lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const VocabTable=meoFeat.ui.VocabTable;'));
  assert.ok(!legacy.includes('function VocabTable('));
});

console.log(`\n${pass} kiểm thử đạt`);
