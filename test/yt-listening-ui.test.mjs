// Kiểm thử tách component YtListening (bước 22): makeYtListening nằm trong src/ui/yt-listening.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const t = (name, fn) => { try { fn(); console.log('ok -', name); } catch (e) { console.error('FAIL -', name, e.message); process.exitCode = 1; } };
const mod = readFileSync('src/ui/yt-listening.js', 'utf8');
const legacy = readFileSync('public/legacy/index.html', 'utf8');
const idx = readFileSync('src/ui/index.js', 'utf8');

t('src/ui/yt-listening.js xuất makeYtListening với đầy đủ dependency', () => {
  assert.ok(mod.includes('export function makeYtListening({ cleanT, YTL, ytApi, YT_ERR, ytFallback, askClaude, searchJP, InteractiveSentenceCard })'));
  assert.ok(mod.includes('return function YtListening({theme:a'));
});

t('src/ui/index.js gom makeYtListening', () => {
  assert.ok(idx.includes("import { makeYtListening } from './yt-listening.js';"));
  assert.ok(idx.includes('makeBanTu, makeYtListening };'));
});

t('legacy dùng makeYtListening thay cho function YtListening cũ', () => {
  assert.ok(legacy.includes('const YtListening=meoFeat.ui.makeYtListening({cleanT,YTL,ytApi,YT_ERR,ytFallback,askClaude,searchJP,InteractiveSentenceCard});'));
  assert.ok(!legacy.includes('function YtListening('));
});

t('các dependency được khai báo trước lời gọi factory (không cần bọc arrow)', () => {
  const call = legacy.indexOf('const YtListening=meoFeat.ui.makeYtListening');
  for (const decl of ['const YTL=', 'const ytApi=', 'const YT_ERR=', 'const ytFallback=', 'const InteractiveSentenceCard=']) {
    assert.ok(legacy.indexOf(decl) < call, decl);
  }
});
