// Kiểm thử src/features/data-merge.js (hợp nhất dữ liệu máy và tài khoản, tách từ legacy).
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as M from '../src/features/data-merge.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok  ' + name); };

t('stampOf: đọc updatedAt, thiếu hoặc sai thì 0', () => {
  assert.equal(M.stampOf({ updatedAt: '2026-11-27T00:00:00Z' }), Date.parse('2026-11-27T00:00:00Z'));
  assert.equal(M.stampOf({}), 0);
  assert.equal(M.stampOf({ updatedAt: 'không phải ngày' }), 0);
});

t('mergeList: cùng id, bản mới hơn thắng; id chỉ có một bên được giữ lại', () => {
  const o = [{ id: 'a', updatedAt: '2026-11-02T00:00:00Z', v: 'o-new' }, { id: 'c', updatedAt: '2026-11-01T00:00:00Z', v: 'only-o' }];
  const a = [{ id: 'a', updatedAt: '2026-11-01T00:00:00Z', v: 'a-old' }, { id: 'b', updatedAt: '2026-11-01T00:00:00Z', v: 'only-a' }];
  const got = Object.fromEntries(M.mergeList(o, a).map((x) => [x.id, x.v]));
  assert.deepEqual(got, { a: 'o-new', b: 'only-a', c: 'only-o' });
});

t('mergeList: bản cũ hơn không ghi đè bản mới hơn (bên o cũ hơn)', () => {
  const o = [{ id: 'a', updatedAt: '2026-11-01T00:00:00Z', v: 'o-old' }];
  const a = [{ id: 'a', updatedAt: '2026-11-05T00:00:00Z', v: 'a-new' }];
  assert.equal(M.mergeList(o, a)[0].v, 'a-new');
});

t('mergeList: bằng nhau thì bên o (ưu tiên) thắng; đầu vào trống vẫn chạy', () => {
  const same = '2026-11-01T00:00:00Z';
  assert.equal(M.mergeList([{ id: 'a', updatedAt: same, v: 'o' }], [{ id: 'a', updatedAt: same, v: 'a' }])[0].v, 'o');
  assert.deepEqual(M.mergeList(undefined, undefined), []);
});

t('mergeData: không mất sổ, trang, thẻ, việc từ cả hai bên', () => {
  const o = { notebooks: [{ id: 'n1', createdAt: '2026-11-02', updatedAt: '2026-11-02' }], pages: [{ id: 'p1' }], flashcards: [{ id: 'f1' }], tasks: [{ id: 't1' }], prefs: {} };
  const a = { notebooks: [{ id: 'n2', createdAt: '2026-11-01', updatedAt: '2026-11-01' }], pages: [], flashcards: [{ id: 'f2' }], tasks: [], prefs: {} };
  const r = M.mergeData(o, a);
  assert.deepEqual(r.notebooks.map((n) => n.id), ['n1', 'n2']);
  assert.deepEqual(r.pages.map((p) => p.id), ['p1']);
  assert.deepEqual(r.flashcards.map((f) => f.id).sort(), ['f1', 'f2']);
  assert.deepEqual(r.tasks.map((x) => x.id), ['t1']);
});

t('mergeData: chỉ số hoạt động và thống kê từ lấy giá trị lớn hơn; last lấy của bên o nếu có', () => {
  const o = { prefs: { activity: { '2026-11-27': { xp: 5, cards: 1, mins: 10, notes: 0 } }, vstats: { w1: { ok: 2, bad: 9, streak: 1, last: 'o' } } } };
  const a = { prefs: { activity: { '2026-11-27': { xp: 9, cards: 0, mins: 3, notes: 4 } }, vstats: { w1: { ok: 7, bad: 1, streak: 3, last: 'a' } } } };
  const r = M.mergeData(o, a);
  assert.deepEqual(r.prefs.activity['2026-11-27'], { xp: 9, cards: 1, mins: 10, notes: 4 });
  assert.deepEqual(r.prefs.vstats.w1, { ok: 7, bad: 9, streak: 3, last: 'o' });
});

t('mergeData: prefs của o ghi đè prefs của a cùng khóa; thiếu prefs vẫn chạy', () => {
  const r = M.mergeData({ prefs: { themeId: 'o', fontSize: 18 } }, { prefs: { themeId: 'a', displayName: 'Mochi' } });
  assert.equal(r.prefs.themeId, 'o');
  assert.equal(r.prefs.displayName, 'Mochi');
  const empty = M.mergeData({}, {});
  assert.deepEqual(empty.notebooks, []);
  assert.deepEqual(empty.prefs.activity, {});
});

t('mergeData: nbViews gộp theo view, giữ bản mới hơn (theo updatedAt)', () => {
  const o = { prefs: { nbViews: { nb1: [{ id: 'v1', updatedAt: '2026-11-03T00:00:00Z', doneIds: ['x'] }] } } };
  const a = { prefs: { nbViews: { nb1: [{ id: 'v1', updatedAt: '2026-11-01T00:00:00Z', doneIds: [] }, { id: 'v2', updatedAt: '2026-11-01T00:00:00Z' }] } } };
  const r = M.mergeData(o, a);
  const views = Object.fromEntries(r.prefs.nbViews.nb1.map((v) => [v.id, v]));
  assert.deepEqual(views.v1.doneIds, ['x']);
  assert.ok(views.v2);
});

t('legacy: dùng module cho stampOf, mergeList và mergeData', () => {
  const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');
  assert.ok(legacy.includes('mergeData=meoFeat.dataMerge.mergeData'));
  assert.ok(!legacy.includes('mergeData=(o,a)=>{var v,A;'));
});

console.log(`\n${pass} kiểm thử đạt`);
