// Kiểm thử src/features/sync-policy.js (quyết định tải và lưu đồng bộ, tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as P from '../src/features/sync-policy.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

t('cloudLoadPlan: có dòng trên máy chủ và có bản trên máy -> merge', () => {
  assert.equal(P.cloudLoadPlan({ hasLocal: true, cloudRow: { user_id: 'u' } }), 'merge');
});

t('cloudLoadPlan: có dòng trên máy chủ, không có bản trên máy -> apply_cloud', () => {
  assert.equal(P.cloudLoadPlan({ hasLocal: false, cloudRow: { user_id: 'u' } }), 'apply_cloud');
});

t('cloudLoadPlan: không có dòng trên máy chủ -> insert_new, dù có bản trên máy hay không', () => {
  assert.equal(P.cloudLoadPlan({ hasLocal: true, cloudRow: null }), 'insert_new');
  assert.equal(P.cloudLoadPlan({ hasLocal: false, cloudRow: null }), 'insert_new');
  assert.equal(P.cloudLoadPlan({}), 'insert_new');
});

t('saveGate: offline thì không ghi, trạng thái offline', () => {
  assert.deepEqual(P.saveGate({ online: false, hasSupabase: true, isPreview: false, cloudLoaded: true }), { upsert: false, status: 'offline' });
});

t('saveGate: không có Supabase hoặc là bản xem trước thì coi như đã lưu cục bộ', () => {
  assert.deepEqual(P.saveGate({ hasSupabase: false, cloudLoaded: true }), { upsert: false, status: 'saved' });
  assert.deepEqual(P.saveGate({ isPreview: true, cloudLoaded: true }), { upsert: false, status: 'saved' });
});

t('saveGate: chưa tải xong dữ liệu tài khoản thì KHÔNG được ghi lên máy chủ', () => {
  const g = P.saveGate({ online: true, hasSupabase: true, isPreview: false, cloudLoaded: false });
  assert.equal(g.upsert, false);
  assert.equal(g.status, 'error');
  assert.match(g.message, /Chưa tải xong dữ liệu tài khoản/);
});

t('saveGate: đủ điều kiện thì được ghi', () => {
  assert.deepEqual(P.saveGate({ online: true, hasSupabase: true, isPreview: false, cloudLoaded: true }), { upsert: true });
});

t('saveGate: thứ tự kiểm tra: offline trước, rồi preview, rồi chưa tải xong', () => {
  assert.equal(P.saveGate({ online: false, isPreview: true, cloudLoaded: false }).status, 'offline');
  assert.equal(P.saveGate({ online: true, isPreview: true, cloudLoaded: false }).status, 'saved');
});

t('legacy: dùng module cho quyết định tải và lưu', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('meoFeat.syncPolicy.cloudLoadPlan('));
  assert.ok(legacy.includes('meoFeat.syncPolicy.saveGate('));
  assert.ok(!legacy.includes('if(!meoCloudLoaded){p("error")'));
});

console.log(`\n${pass} kiểm thử đạt`);
