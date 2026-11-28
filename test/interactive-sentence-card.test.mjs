// Kiểm thử tách thẻ câu tương tác (bước 11): InteractiveSentenceCard nằm trong src/ui/interactive-sentence-card.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/interactive-sentence-card.js xuất InteractiveSentenceCard và giữ logic furigana', () => {
  const s = read('src/ui/interactive-sentence-card.js');
  assert.ok(s.includes('export function InteractiveSentenceCard({'));
  assert.ok(s.includes('const renderRubyToken=tk=>{'));
  assert.ok(s.includes('Bấm để tra nghĩa, nghe phát âm hoặc lưu vào sổ'));
  assert.ok(!s.includes('const langOfWord'), 'không được kéo theo khai báo legacy');
});

t('src/ui/index.js gom InteractiveSentenceCard', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { InteractiveSentenceCard } from './interactive-sentence-card.js';"));
  assert.ok(s.includes('InteractiveSentenceCard, makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan };'));
});

t('legacy: InteractiveSentenceCard lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const InteractiveSentenceCard=meoFeat.ui.InteractiveSentenceCard;'));
  assert.ok(!legacy.includes('function InteractiveSentenceCard('));
  assert.ok(legacy.includes('const langOfWord=meoFeat.vocab.langOfWord;'), 'khai báo kế bên vẫn còn nguyên');
});

console.log(`\n${pass} kiểm thử đạt`);
