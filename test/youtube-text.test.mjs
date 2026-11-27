// Kiểm thử src/features/youtube-text.js (YTL tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { youtubeText as Y } from '../src/features/youtube-text.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('id: nhận link youtu.be, watch, shorts, embed và id thuần', () => {
  assert.equal(Y.id('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(Y.id('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'), 'dQw4w9WgXcQ');
  assert.equal(Y.id('https://m.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(Y.id('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(Y.id('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});

t('id: link không hợp lệ trả về null', () => {
  assert.equal(Y.id('https://example.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(Y.id('abc'), null);
  assert.equal(Y.id(''), null);
});

t('rb: tách ruby 漢字《かんじ》 thành đoạn và chữ đọc', () => {
  const r = Y.rb('日本語《にほんご》を勉強');
  assert.equal(r.plain, '日本語を勉強');
  assert.ok(Array.isArray(r.segs));
  assert.deepEqual(r.segs[0], ['日本語', 'にほんご']);
});

t('rb: chuỗi không có ruby thì segs = null', () => {
  const r = Y.rb('ただの文');
  assert.equal(r.plain, 'ただの文');
  assert.equal(r.segs, null);
});

t('legacy dùng youtubeText, không còn khối YTL cũ', () => {
  assert.equal(legacy.includes('const YTL=meoFeat.youtubeText;'), true);
  assert.equal(legacy.includes('const YTL=(()=>{'), false);
});

console.log(`\n${passed} kiểm thử đạt.`);
