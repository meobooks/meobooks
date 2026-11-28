// Kiểm thử tách component App gốc (bước 23): makeApp nằm trong src/ui/app.js, app cũ gọi ngay trước root.render.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const t = (name, fn) => { try { fn(); console.log('ok -', name); } catch (e) { console.error('FAIL -', name, e.message); process.exitCode = 1; } };
const mod = readFileSync('src/ui/app.js', 'utf8');
const legacy = readFileSync('public/legacy/index.html', 'utf8');
const idx = readFileSync('src/ui/index.js', 'utf8');

t('src/ui/app.js xuất makeApp và trả về component App', () => {
  assert.ok(mod.includes('export function makeApp({ PomodoroWidget, GRAMMAR_FIELDS, G_PALETTES, InkLayer, EMPTY_PROFILE, NAV_TO_PATH, lvlInfo, mergeData, navFromHash, norm, useJlpt, cleanT, nbOf, withNb, GamesHub, NAV_GROUPS, UI_STYLES, DEF_COLS, FIXED_COLS, normCols, classOf, JlptVocab, JlptStudy, JlptGame, ReadView, BookViewer, NbEditModal, SHOP_ITEMS, MochiPet, planToday, SmartPlan, N2Roadmap, YtListening, DEFAULT_SUBJECTS, SubjectPicker })'));
  assert.ok(mod.includes('return function App(){'));
});

t('src/ui/index.js gom makeApp', () => {
  assert.ok(idx.includes("import { makeApp } from './app.js';"));
  assert.ok(idx.includes('makeYtListening, makeApp };'));
});

t('legacy không còn function App, và gọi makeApp ngay trước root.render', () => {
  assert.ok(!legacy.includes('function App('));
  const call = legacy.indexOf('const App=meoFeat.ui.makeApp({');
  const root = legacy.indexOf('const root=ReactDOM.createRoot(');
  assert.ok(call > 0 && call < root, 'makeApp phải nằm trước root');
  assert.ok(legacy.includes('root.render(React.createElement(App,null));'));
});

t('mọi dependency được khai báo trước lời gọi makeApp', () => {
  const call = legacy.indexOf('const App=meoFeat.ui.makeApp({');
  for (const decl of ['const classOf=', 'const SubjectPicker=', 'const YtListening=', 'const DEFAULT_SUBJECTS=', 'const useJlpt=']) {
    assert.ok(legacy.indexOf(decl) >= 0 && legacy.indexOf(decl) < call, decl);
  }
});
