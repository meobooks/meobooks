// Kiểm thử tách màn Trò chơi (bước 12): makeGamesHub nằm trong src/ui/games-hub.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/games-hub.js xuất makeGamesHub nhận BanTu, NoiTu, MochiMascot', () => {
  const s = read('src/ui/games-hub.js');
  assert.ok(s.includes('export function makeGamesHub({ BanTu, NoiTu, MochiMascot })'));
  assert.ok(s.includes('Vừa chơi vừa ôn từ vựng trong kho từ của bạn.'));
  assert.ok(s.includes('Sắp có thêm trò chơi mới…'));
});

t('src/ui/index.js gom makeGamesHub', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeGamesHub } from './games-hub.js';"));
  assert.ok(s.includes('makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson };'));
});

t('legacy: GamesHub lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const GamesHub=meoFeat.ui.makeGamesHub({BanTu,NoiTu,MochiMascot});'));
  assert.ok(!legacy.includes('function GamesHub('));
});

console.log(`\n${pass} kiểm thử đạt`);
