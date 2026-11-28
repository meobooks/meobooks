// Kiểm thử tách JLPT bước 3: useJlpt chuyển sang src/ui/jlpt-hook.js, nhận phụ thuộc qua makeUseJlpt.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('jlpt-hook.js xuất makeUseJlpt và nhận đủ phụ thuộc', () => {
  const s = read('src/ui/jlpt-hook.js');
  assert.ok(s.includes('export function makeUseJlpt(deps)'));
  assert.ok(s.includes('const { supabase, dayKey, weekKey, jlId, norm, levelOf, addDaysKey, ACH_DEFS, EMPTY_PROFILE, QUEST_DEFS, meoFeat } = deps;'));
  assert.ok(s.includes('function useJlpt(o,a,c,onXp,onRes){'));
});

t('ui/index.js đưa makeUseJlpt vào ui', () => {
  assert.ok(read('src/ui/index.js').includes('makeUseJlpt }'));
});

t('legacy: useJlpt tạo từ meoFeat.ui.makeUseJlpt, không còn định nghĩa cũ', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const useJlpt=meoFeat.ui.makeUseJlpt({supabase,dayKey,weekKey,jlId,norm,levelOf,addDaysKey,ACH_DEFS,EMPTY_PROFILE,QUEST_DEFS,meoFeat});'));
  assert.ok(!legacy.includes('function useJlpt('));
});

console.log(`\n${pass} kiểm thử đạt`);
