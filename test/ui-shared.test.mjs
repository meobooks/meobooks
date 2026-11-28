// Kiểm thử tách giao diện (JLPT, bước 1): JCard và JLoading nằm trong src/ui và app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/shared.js xuất JCard và JLoading', () => {
  const s = read('src/ui/shared.js');
  assert.ok(s.includes('export const JCard'));
  assert.ok(s.includes('export const JLoading'));
  assert.ok(s.includes('Đang tải dữ liệu…'));
});

t('src/ui/index.js gom ui và App đưa vào window.meobooksFeatures', () => {
  assert.ok(read('src/ui/index.js').includes('export const ui = { JCard, JLoading, JlptGame, makeUseJlpt, makeJlptStudy, drawStroke, InkView, makeReadView, makeNbEditModal, makeN2Roadmap, makePomodoroWidget, makeSubjectPicker, VocabTable, InteractiveSentenceCard, makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan }'));
  const app = read('src/app/App.jsx');
  assert.ok(app.includes("import { ui } from '../ui/index.js'"));
  assert.ok(app.includes('syncPolicy, ui };'));
});

t('legacy: JCard và JLoading lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const {JCard,JLoading,drawStroke,InkView}=meoFeat.ui,EMPTY_V='));
  assert.ok(!legacy.includes('const JCard=({theme:o'));
  assert.ok(!legacy.includes('JLoading=({theme:o})'));
});

console.log(`\n${pass} kiểm thử đạt`);
