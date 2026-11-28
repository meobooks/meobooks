// Kiểm thử src/features/plan.js (cấu hình kế hoạch học tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as PL from '../src/features/plan.js';

const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
let passed = 0;
function t(name, fn) { fn(); passed++; console.log('ok -', name); }

t('planCfg: mặc định và ghi đè từ S.plan', () => {
  const d = PL.planCfg(undefined);
  assert.equal(d.newPerDay, 10);
  assert.deepEqual(d.days, [1, 1, 1, 1, 1, 1, 1]);
  assert.equal(PL.planCfg({ plan: { newPerDay: 5 } }).newPerDay, 5);
});

t('legacy dùng planCfg qua meoFeat', () => {
  assert.equal(legacy.includes('const planCfg=meoFeat.plan.planCfg;'), true);
});

console.log(`\n${passed} kiểm thử đạt.`);
