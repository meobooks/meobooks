// Kiểm thử tách JLPT bước 2: JlptGame và QUEST_DEFS đã chuyển; app cũ dùng qua meoFeat.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/jlpt-game.js xuất JlptGame và nhận MochiPet qua props', () => {
  const s = read('src/ui/jlpt-game.js');
  assert.ok(s.includes('export function JlptGame('));
  assert.ok(s.includes('shop,MochiPet}'));
  assert.ok(s.includes("from '../features/progression.js'"));
});

t('src/ui/index.js đưa JlptGame vào ui', () => {
  assert.ok(read('src/ui/index.js').includes('export const ui = { JCard, JLoading, JlptGame, makeUseJlpt, makeJlptStudy, drawStroke, InkView };'));
});

t('features/progression.js xuất QUEST_DEFS', () => {
  assert.ok(read('src/features/progression.js').includes('export const QUEST_DEFS = [{id:"d_review20"'));
});

t('legacy: JlptGame và QUEST_DEFS lấy từ module; hai chỗ gọi đều truyền MochiPet', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const JlptGame=meoFeat.ui.JlptGame;'));
  assert.ok(!legacy.includes('function JlptGame({jl:o'));
  assert.ok(legacy.includes('QUEST_DEFS=meoFeat.progression.QUEST_DEFS'));
  assert.equal(legacy.split('React.createElement(JlptGame,{jl:GeAll,MochiPet:MochiPet,').length - 1, 2);
});

console.log(`\n${pass} kiểm thử đạt`);
