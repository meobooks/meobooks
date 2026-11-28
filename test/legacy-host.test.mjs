// Kiểm thử bước 1 bỏ iframe: app cũ được nạp trực tiếp vào trang qua LegacyHost.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('App không còn dùng iframe và nạp app cũ qua LegacyHost', () => {
  const app = read('src/app/App.jsx');
  assert.ok(!app.includes('<iframe'));
  assert.ok(app.includes("import LegacyHost from './LegacyHost.jsx'"));
  assert.ok(app.includes('<LegacyHost url={LEGACY_URL} />'));
});

t('LegacyHost: nạp script theo thứ tự, xóa phần # nhạy cảm sau khi legacy đã chạy', () => {
  const h = read('src/app/LegacyHost.jsx');
  assert.ok(h.includes('await runScript(p)'));
  assert.ok(h.indexOf('await runScript(p)') < h.indexOf('history.replaceState'));
  assert.ok(h.includes('el.async = false'));
});

t('legacy: phần tử gốc đổi thành legacy-root để không trùng #root của app mới', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('<div id="legacy-root">'));
  assert.ok(legacy.includes('createRoot(document.getElementById("legacy-root")'));
  assert.ok(!legacy.includes('getElementById("root")'));
});

t('bước 3: legacy không tải React từ CDN; LegacyHost gán React của Vite làm window.React', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(!legacy.includes('cdn.jsdelivr.net/npm/react'));
  const h = read('src/app/LegacyHost.jsx');
  assert.ok(h.includes('window.React = React;'));
  assert.ok(h.includes('window.ReactDOM = { createRoot };'));
});

console.log(`\n${pass} kiểm thử đạt`);
