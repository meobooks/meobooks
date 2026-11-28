// Kiểm thử tách lịch học thông minh (bước 15): makeSmartPlan nằm trong src/ui/smart-plan.js, app cũ dùng qua meoFeat.ui.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

t('src/ui/smart-plan.js xuất makeSmartPlan nhận JCard, planToday, DAYN, idxOf', () => {
  const s = read('src/ui/smart-plan.js');
  assert.ok(s.includes('export function makeSmartPlan({ JCard, planToday, DAYN, idxOf })'));
  assert.ok(s.includes('Lịch học thông minh'));
  assert.ok(s.includes('Mochi đã tự điều chỉnh'));
});

t('src/ui/index.js gom makeSmartPlan', () => {
  const s = read('src/ui/index.js');
  assert.ok(s.includes("import { makeSmartPlan } from './smart-plan.js';"));
  assert.ok(s.includes('makeSmartPlan, makeMochiPet, makeRmLesson };'));
});

t('legacy: SmartPlan lấy từ meoFeat.ui, không còn định nghĩa lại', () => {
  const legacy = read('public/legacy/index.html');
  assert.ok(legacy.includes('const SmartPlan=meoFeat.ui.makeSmartPlan({JCard,planToday,DAYN,idxOf});'));
  assert.ok(!legacy.includes('function SmartPlan('));
});

console.log(`\n${pass} kiểm thử đạt`);
