// Kiểm thử tách giao diện ghi chú tay (bước 4): drawStroke và InkView nằm trong src/ui/ink.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/ink.js xuất drawStroke và InkView', () => {
  const s = read('src/ui/ink.js');
  assert.ok(s.includes('export function drawStroke(o, a)'));
  assert.ok(s.includes('export function InkView({ ink })'));
  assert.ok(s.includes("import React, { useEffect, useRef, useState } from 'react';"));
});

t('drawStroke giữ đủ ba nhánh: chấm, bút đánh dấu, bút chì/bút thường', () => {
  const s = read('src/ui/ink.js');
  assert.ok(s.includes("a.t === 'hl' ? 0.35"));
  assert.ok(s.includes("a.t === 'pencil' ? 0.6 + c[b][2] / 120"));
  assert.ok(s.includes('o.globalAlpha = 1;'));
});

t('src/ui/index.js gom drawStroke và InkView vào ui', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { drawStroke, InkView } from './ink.js';"));
  assert.ok(s.includes('drawStroke, InkView, makeReadView, makeNbEditModal, makeN2Roadmap, makePomodoroWidget, makeSubjectPicker, VocabTable, InteractiveSentenceCard, makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson, makeNoiTu, makeJlptVocab };'));
});

t('legacy: không còn định nghĩa drawStroke và InkView, lấy từ meoFeat.ui', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const {JCard,JLoading,drawStroke,InkView}=meoFeat.ui,EMPTY_V='));
  assert.ok(!legacy.includes('drawStroke=(o,a)=>'));
  assert.ok(!legacy.includes('function InkView({ink})'));
  assert.ok(legacy.includes('INK_COLORS=["#2D2A32"'));
  assert.ok(legacy.includes('function InkLayer('));
});

console.log(`\n${pass} kiểm thử đạt`);
