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

  return {
    prefs: { ...(a.prefs || {}), ...(o.prefs || {}), activity, nbViews: mergedNbViews, vstats: mergedVstats },
    notebooks: mergeList(o.notebooks, a.notebooks).sort(byCreatedDesc),
    pages: mergeList(o.pages, a.pages).sort(byCreatedDesc),
    flashcards: mergeList(o.flashcards, a.flashcards),
    tasks: mergeList(o.tasks, a.tasks),
  };
};
