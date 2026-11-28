// Kiểm thử bước 2: CSS và font của app cũ đã chuyển sang Vite (src/styles/legacy.css, index.html).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('legacy không còn khối <style> và không còn link font Google', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(!legacy.includes('<style'));
  assert.ok(!/<link[^>]*fonts\.googleapis\.com/.test(legacy)); // font động trong JS vẫn giữ nguyên
});

t('CSS của app cũ nằm trong src/styles/legacy.css và được main.jsx import sau global.css', () => {
  const css = read('src/styles/legacy.css');
  assert.ok(css.includes('tailwindcss v4'));
  assert.ok(css.includes('.bt-grid2'));
  const main = read('src/main.jsx');
  assert.ok(main.indexOf("import './styles/global.css'") < main.indexOf("import './styles/legacy.css'"));
});

t('index.html có đủ link font (Nunito, Quicksand, Baloo 2, Pacifico)', () => {
  const html = read('index.html');
  assert.ok(html.includes('family=Nunito'));
  assert.ok(html.includes('family=Quicksand'));
  assert.ok(html.includes('family=Baloo+2'));
  assert.ok(html.includes('family=Pacifico'));
});

console.log(`\n${pass} kiểm thử đạt`);
