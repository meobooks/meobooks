// Kiểm thử tách lộ trình N2 (bước 7): makeN2Roadmap nằm trong src/ui/n2-roadmap.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/n2-roadmap.js xuất makeN2Roadmap nhận các phụ thuộc đã truyền vào', () => {
  const s = read('src/ui/n2-roadmap.js');
  assert.ok(s.includes('export function makeN2Roadmap({ supabase, RM_LV_BY_LANG, RmLesson, meoFeat })'));
  assert.ok(s.includes('Lantern Lane'));
  assert.ok(s.includes('roadmap_books'));
  assert.ok(s.includes('roadmap_lessons'));
});

t('src/ui/index.js gom makeN2Roadmap', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeN2Roadmap } from './n2-roadmap.js';"));
  assert.ok(s.includes('makeN2Roadmap, makePomodoroWidget, makeSubjectPicker, VocabTable, InteractiveSentenceCard, makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson, makeNoiTu };'));
});

t('legacy: N2Roadmap lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const N2Roadmap=meoFeat.ui.makeN2Roadmap({supabase,RM_LV_BY_LANG,RmLesson,meoFeat});'));
  assert.ok(!legacy.includes('function N2Roadmap('));
});

console.log(`\n${pass} kiểm thử đạt`);
