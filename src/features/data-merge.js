// Hợp nhất dữ liệu máy và tài khoản (tách từ legacy). Hàm thuần: không gọi mạng hay localStorage.

// Thời điểm cập nhật (ms) của một bản ghi; thiếu thì coi là 0
export const stampOf = (o) => Date.parse(o.updatedAt || '') || 0;

// Gộp hai danh sách theo id: với cùng id, bản có stamp mới hơn (hoặc bằng nhau và nằm trong `o`) thắng
export const mergeList = (o = [], a = [], c = stampOf) => {
  const b = new Map(a.map((v) => [v.id, v]));
  o.forEach((v) => {
    const A = b.get(v.id);
    if (!A || c(v) >= c(A)) b.set(v.id, v);
  });
  return [...b.values()];
};

// Đánh dấu xóa (tombstone): prefs.tombs = { pages, nbViews, notebooks, tasks: {id: thời điểm xóa} }
const TOMB_KEEP_MS = 180 * 24 * 3600 * 1000;
const TOMB_KINDS = ['pages', 'nbViews', 'notebooks', 'tasks'];

// Gộp hai bảng đánh dấu xóa: mỗi id lấy thời điểm xóa muộn hơn
export const mergeTombs = (x, y) => {
  const out = {};
  TOMB_KINDS.forEach((k) => {
    const m = { ...(((x || {})[k]) || {}) };
    Object.entries(((y || {})[k]) || {}).forEach(([id, t]) => {
      if (!m[id] || (Date.parse(t) || 0) > (Date.parse(m[id]) || 0)) m[id] = t;
    });
    out[k] = m;
  });
  return out;
};

// Bỏ các mục đã bị xóa, trừ khi mục được sửa/tạo sau thời điểm xóa
export const applyTombs = (list, tombs) => {
  const t = tombs || {};
  return (list || []).filter((it) => {
    const del = t[it.id];
    if (!del) return true;
    const stamp = Date.parse(it.updatedAt || it.createdAt || '') || 0;
    return stamp > (Date.parse(del) || 0);
  });
};

// Thêm đánh dấu xóa cho các id của `kind`, và bỏ đánh dấu quá 180 ngày
export const addTombs = (prefs, kind, ids, now) => {
  const tombs = mergeTombs(prefs && prefs.tombs, {});
  const cutoff = now - TOMB_KEEP_MS;
  TOMB_KINDS.forEach((k) => {
    Object.keys(tombs[k]).forEach((id) => {
      if ((Date.parse(tombs[k][id]) || 0) < cutoff) delete tombs[k][id];
    });
  });
  ids.forEach((id) => { tombs[kind][id] = new Date(now).toISOString(); });
  return tombs;
};

// Các view bị bỏ khi danh sách nbViews đổi từ prefs.nbViews sang nv
export const tombsAfterNbViews = (prefs, nv, now) => {
  const removed = [];
  Object.entries((prefs && prefs.nbViews) || {}).forEach(([nbId, list]) => {
    const keep = new Set((((nv || {})[nbId]) || []).map((v) => v.id));
    (list || []).forEach((v) => { if (!keep.has(v.id)) removed.push(v.id); });
  });
  return addTombs(prefs, 'nbViews', removed, now);
};

// Hợp nhất toàn bộ dữ liệu người dùng.
// o: bên cần ưu tiên (thường là bản trên máy); a: bên còn lại (thường là bản trên tài khoản).
export const mergeData = (o, a) => {
  // Hoạt động học: lấy số lớn hơn của mỗi chỉ số theo từng ngày
  const activity = { ...((a.prefs && a.prefs.activity) || {}) };
  Object.entries((o.prefs && o.prefs.activity) || {}).forEach(([day, L]) => {
    const u = activity[day] || {};
    activity[day] = {
      xp: Math.max(L.xp || 0, u.xp || 0),
      cards: Math.max(L.cards || 0, u.cards || 0),
      mins: Math.max(L.mins || 0, u.mins || 0),
      notes: Math.max(L.notes || 0, u.notes || 0),
    };
  });

  // Sắp xếp giảm dần theo createdAt
  const byCreatedDesc = (f, L) => (L.createdAt || '').localeCompare(f.createdAt || '');

  // Chế độ xem theo sổ: gộp theo thời điểm updatedAt của từng view
  const nbViewsA = ((a.prefs && a.prefs.nbViews) || {}) || {};
  const nbViewsO = ((o.prefs && o.prefs.nbViews) || {}) || {};
  const mergedNbViews = { ...nbViewsA };
  Object.entries(nbViewsO).forEach(([k, arr]) => {
    mergedNbViews[k] = mergeList(arr, mergedNbViews[k] || [], (x) => Date.parse(x.updatedAt || '') || 0);
  });

  // Thống kê từ: lấy số lớn hơn cho ok/bad/streak, giữ `last` mới nhất
  const vstatsA = (a.prefs && a.prefs.vstats) || {};
  const vstatsO = (o.prefs && o.prefs.vstats) || {};
  const mergedVstats = { ...vstatsA };
  Object.entries(vstatsO).forEach(([k, st]) => {
    const old = mergedVstats[k] || { ok: 0, bad: 0, streak: 0 };
    mergedVstats[k] = {
      ok: Math.max(old.ok || 0, st.ok || 0),
      bad: Math.max(old.bad || 0, st.bad || 0),
      streak: Math.max(old.streak || 0, st.streak || 0),
      last: st.last || old.last,
    };
  });

  const tombs = mergeTombs(a.prefs && a.prefs.tombs, o.prefs && o.prefs.tombs);
  Object.keys(mergedNbViews).forEach((k) => { mergedNbViews[k] = applyTombs(mergedNbViews[k], tombs.nbViews); });
  return {
    prefs: { ...(a.prefs || {}), ...(o.prefs || {}), activity, nbViews: mergedNbViews, vstats: mergedVstats, tombs },
    notebooks: applyTombs(mergeList(o.notebooks, a.notebooks).sort(byCreatedDesc), tombs.notebooks),
    pages: applyTombs(mergeList(o.pages, a.pages).sort(byCreatedDesc), tombs.pages),
    flashcards: mergeList(o.flashcards, a.flashcards),
    tasks: applyTombs(mergeList(o.tasks, a.tasks), tombs.tasks),
  };
};
