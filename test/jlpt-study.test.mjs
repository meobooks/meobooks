// Kiểm thử tách JLPT bước 4: JlptStudy chuyển sang src/ui/jlpt-study.js, nhận phụ thuộc qua makeJlptStudy.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('jlpt-study.js xuất makeJlptStudy và nhận đủ phụ thuộc', () => {
  const s = read('src/ui/jlpt-study.js');
  assert.ok(s.includes('export function makeJlptStudy(deps)'));
  assert.ok(s.includes('const { CL_BG, MODES, isMC, buildQ, byNewest, classOf, dayKey, exactOk, lenientOk, mochiConfirm, nbOf, speak, meoFeat } = deps;'));
  assert.ok(s.includes('function JlptStudy('));
});

t('ui/index.js đưa makeJlptStudy vào ui', () => {
  assert.ok(read('src/ui/index.js').includes('makeUseJlpt, makeJlptStudy, drawStroke, InkView, makeReadView, makeNbEditModal, makeN2Roadmap, makePomodoroWidget }'));
});

t('legacy: JlptStudy tạo từ meoFeat.ui.makeJlptStudy, không còn định nghĩa cũ', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const JlptStudy=meoFeat.ui.makeJlptStudy({CL_BG,MODES,isMC,buildQ,byNewest,classOf,dayKey,exactOk,lenientOk,mochiConfirm,nbOf,speak,meoFeat});'));
  assert.ok(!legacy.includes('function JlptStudy('));
});

console.log(`\n${pass} kiểm thử đạt`);
