// meobooks — lớp dịch vụ dùng chung cho bản legacy (giai đoạn 2, cầu nối).
// Plain script, không cần build. Gắn vào window.meobooksServices.
// Chỉ định nghĩa hàm; không có tác dụng phụ khi nạp, nên app chạy như cũ
// cho đến khi bản legacy bắt đầu gọi các hàm này.
(function (global) {
  'use strict';

  // ---------- localStorage (giữ NGUYÊN tên khóa và định dạng legacy) ----------
  function getStorage() {
    try { return typeof localStorage === 'undefined' ? null : localStorage; } catch (e) { return null; }
  }
  function getRaw(key, fallback) {
    if (fallback === undefined) fallback = null;
    try { return (getStorage() && getStorage().getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function setRaw(key, value) { try { getStorage() && getStorage().setItem(key, value); } catch (e) {} }
  function removeRaw(key) { try { getStorage() && getStorage().removeItem(key); } catch (e) {} }
  function getJSON(key, fallback) {
    if (fallback === undefined) fallback = null;
    const raw = getRaw(key, null);
    if (raw == null) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  function setJSON(key, value) { try { getStorage() && getStorage().setItem(key, JSON.stringify(value)); } catch (e) {} }

  const localStore = {
    getRaw, setRaw, removeRaw, getJSON, setJSON,
    jlptLocalKey: (id) => 'jlpt_local_' + id,
    localKey: (id) => 'mochi_local_' + id,
    dirtyKey: (id) => 'mochi_dirty_' + id,
    subjectsKey: (id) => 'meobooks_subjects_' + id,
    LAST_USER_KEY: 'mochi_last_user',
    NOTIF_KEY: 'mochi_notif',
    AI_KEY_KEY: 'mochi_ai_key', // nhạy cảm: chỉ đọc qua getAiKey
    SOUND_KEY: 'bt_snd',
    bestKey: (kind, deckId) => kind + '_best_' + deckId,
    isDirty(id) { return !!getRaw(this.dirtyKey(id)); },
    markDirty(id) { setRaw(this.dirtyKey(id), '1'); },
    clearDirty(id) { removeRaw(this.dirtyKey(id)); },
    getLastUser() { return getJSON(this.LAST_USER_KEY, null); },
    setLastUser(user) {
      if (user) setJSON(this.LAST_USER_KEY, { id: user.id, email: user.email, user_metadata: user.user_metadata });
    },
    clearLastUser() { removeRaw(this.LAST_USER_KEY); },
    getAiKey() { return getRaw(this.AI_KEY_KEY, '') || ''; },
    getBestScore(kind, deckId) { return +getRaw(this.bestKey(kind, deckId), 0) || 0; },
    setBestScore(kind, deckId, score) { setRaw(this.bestKey(kind, deckId), String(score)); },
    // Danh sách môn học: trả về mảng không rỗng, hoặc null nếu chưa có/hỏng (legacy dùng DEFAULT_SUBJECTS).
    getSubjects(userId) {
      const r = getJSON(this.subjectsKey(userId), null);
      return Array.isArray(r) && r.length ? r : null;
    },
    setSubjects(userId, list) { setJSON(this.subjectsKey(userId), list); },
    // Bản sao dữ liệu người dùng trên máy (mochi_local_<id>)
    getLocalData(userId) { return getJSON(this.localKey(userId), null); },
    setLocalData(userId, data) { setJSON(this.localKey(userId), data); },
    // Dữ liệu học JLPT trên máy (jlpt_local_<id>)
    getJlptLocal(userId) { return getJSON(this.jlptLocalKey(userId), null); },
    setJlptLocal(userId, data) { setJSON(this.jlptLocalKey(userId), data); },
    // Phiên học thông minh đang dở
    SMART_SESSION_KEY: 'mochi_smart_session_v2',
    getSmartSession() { return getJSON(this.SMART_SESSION_KEY, null); },
    setSmartSession(sess) { setJSON(this.SMART_SESSION_KEY, sess); },
    clearSmartSession() { removeRaw(this.SMART_SESSION_KEY); },
    // Ngày đã gửi thông báo nhắc học gần nhất
    getNotifDay() { return getRaw(this.NOTIF_KEY, null); },
    setNotifDay(day) { setRaw(this.NOTIF_KEY, day); },
  };

  // ---------- sync: phần thuần (giữ NGUYÊN logic legacy) ----------
  const stampOf = (o) => Date.parse(o.updatedAt || '') || 0;

  function mergeList(o, a, c) {
    o = o || []; a = a || []; c = c || stampOf;
    const b = new Map(a.map((v) => [v.id, v]));
    o.forEach((v) => {
      const A = b.get(v.id);
      if (!A || c(v) >= c(A)) b.set(v.id, v);
    });
    return [...b.values()];
  }

  function mergeData(o, a) {
    const activity = Object.assign({}, (a.prefs && a.prefs.activity) || {});
    Object.entries((o.prefs && o.prefs.activity) || {}).forEach(([f, L]) => {
      const u = activity[f] || {};
      activity[f] = {
        xp: Math.max(L.xp || 0, u.xp || 0),
        cards: Math.max(L.cards || 0, u.cards || 0),
        mins: Math.max(L.mins || 0, u.mins || 0),
        notes: Math.max(L.notes || 0, u.notes || 0),
      };
    });
    const byCreated = (f, L) => (L.createdAt || '').localeCompare(f.createdAt || '');
    const nbViewsA = (a.prefs && a.prefs.nbViews) || {};
    const nbViewsO = (o.prefs && o.prefs.nbViews) || {};
    const mergedNbViews = Object.assign({}, nbViewsA);
    Object.entries(nbViewsO).forEach(([k, arr]) => {
      mergedNbViews[k] = mergeList(arr, mergedNbViews[k] || [], (x) => Date.parse(x.updatedAt || '') || 0);
    });
    const vstatsA = (a.prefs && a.prefs.vstats) || {};
    const vstatsO = (o.prefs && o.prefs.vstats) || {};
    const mergedVstats = Object.assign({}, vstatsA);
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
      prefs: Object.assign({}, a.prefs || {}, o.prefs || {}, { activity, nbViews: mergedNbViews, vstats: mergedVstats }),
      notebooks: mergeList(o.notebooks, a.notebooks).sort(byCreated),
      pages: mergeList(o.pages, a.pages).sort(byCreated),
      flashcards: mergeList(o.flashcards, a.flashcards),
      tasks: mergeList(o.tasks, a.tasks),
    };
  }

  const sync = {
    stampOf,
    mergeList,
    mergeData,
    shouldApplyRemote({ status, remoteRow, lastWrittenAt }) {
      return !!remoteRow && status === 'saved' && remoteRow.updated_at !== lastWrittenAt;
    },
    pickRemoteFields(remoteRow) {
      const out = {};
      ['prefs', 'notebooks', 'pages', 'flashcards', 'tasks'].forEach((k) => {
        if (remoteRow[k]) out[k] = remoteRow[k];
      });
      return out;
    },
    buildUpsertRow(userId, data, updatedAt) {
      return Object.assign({ user_id: userId }, data, { updated_at: updatedAt || new Date().toISOString() });
    },
    // ----- phần gọi Supabase (dùng client gắn bằng setClient) -----
    TABLE: 'mochi_user_data',
    CHANNEL: 'mochi-realtime-sync',
    // Đọc dòng dữ liệu của người dùng. Trả về Promise<{data, error}>.
    fetchRow(userId) {
      return requireClient().from(this.TABLE).select('*').eq('user_id', userId).maybeSingle();
    },
    // Ghi (upsert) dòng dữ liệu. Trả về Promise<{error}>.
    upsertRow(userId, data, updatedAt) {
      return requireClient().from(this.TABLE).upsert(this.buildUpsertRow(userId, data, updatedAt), { onConflict: 'user_id' });
    },
    // Nghe thay đổi UPDATE của chính người dùng. onRow nhận dòng mới. Trả về { unsubscribe }.
    subscribeRealtime(userId, onRow) {
      const c = requireClient();
      const ch = c.channel(this.CHANNEL)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: this.TABLE, filter: 'user_id=eq.' + userId },
          (payload) => onRow(payload.new))
        .subscribe();
      return { unsubscribe() { c.removeChannel(ch); } };
    },
  };

  // ---------- auth: dùng client của legacy (gắn bằng setClient) ----------
  let client = null;
  function requireClient() {
    if (!client) throw new Error('Supabase client chưa được gắn: gọi meobooksServices.setClient(client).');
    return client;
  }
  // Đọc phần # của địa chỉ (liên kết trong email của Supabase). Chỉ đọc, không có tác dụng phụ.
  // Ví dụ: #access_token=...&type=recovery  hoặc  #error=access_denied&error_code=otp_expired
  function parseAuthHash(hash) {
    const out = { type: '', error: '', errorCode: '', errorDescription: '' };
    const h = String(hash || '').replace(/^#/, '');
    if (!h || h.indexOf('=') < 0 || h.charAt(0) === '/') return out; // rỗng hoặc là đường dẫn trang kiểu #/dashboard
    const dec = (v) => { try { return decodeURIComponent(String(v).replace(/\+/g, ' ')); } catch (e) { return String(v); } };
    h.split('&').forEach((pair) => {
      const i = pair.indexOf('=');
      if (i < 0) return;
      const k = dec(pair.slice(0, i)), v = dec(pair.slice(i + 1));
      if (k === 'type') out.type = v;
      else if (k === 'error') out.error = v;
      else if (k === 'error_code') out.errorCode = v;
      else if (k === 'error_description') out.errorDescription = v;
    });
    return out;
  }
  function describeAuthError(p) {
    if (!p.error && !p.errorCode) return '';
    if (p.errorCode === 'otp_expired') return 'Liên kết đã hết hạn hoặc đã được dùng. Hãy bấm "Quên mật khẩu?" để nhận liên kết mới.';
    return p.errorDescription || 'Liên kết không hợp lệ. Hãy thử lại.';
  }
  // Chụp lại phần # ngay khi nạp (trước khi supabase-js hoặc app xóa/ghi đè nó).
  const bootAuth = parseAuthHash(typeof location !== 'undefined' && location ? location.hash : '');
  // Địa chỉ trang ngoài (shell Vite) để Supabase đưa người dùng quay về: thư mục cha của legacy/.
  function appHomeUrl() {
    try { return typeof location !== 'undefined' && location && location.href ? new URL('../', location.href).href : undefined; }
    catch (e) { return undefined; }
  }

  const auth = {
    parseHash: parseAuthHash,
    describeError: describeAuthError,
    // Trang vừa mở từ liên kết "đặt lại mật khẩu" trong email?
    isRecoveryBoot() { return bootAuth.type === 'recovery'; },
    // Thông báo lỗi (tiếng Việt) nếu liên kết trong email hỏng/hết hạn, ngược lại ''.
    bootAuthError() { return describeAuthError(bootAuth); },
    signUp({ email, password, displayName }) {
      return requireClient().auth.signUp({
        email, password,
        options: { data: { display_name: displayName.trim() } },
      });
    },
    signIn({ email, password }) { return requireClient().auth.signInWithPassword({ email, password }); },
    signOut() { return requireClient().auth.signOut(); },
    resetPassword(email, redirectTo) {
      const to = redirectTo || appHomeUrl();
      return to ? requireClient().auth.resetPasswordForEmail(email, { redirectTo: to }) : requireClient().auth.resetPasswordForEmail(email);
    },
    // Đặt mật khẩu mới (cần phiên khôi phục từ liên kết email, hoặc đang đăng nhập).
    updatePassword(newPassword) { return requireClient().auth.updateUser({ password: newPassword }); },
    getSession() { return requireClient().auth.getSession(); },
    onAuthStateChange(callback) {
      const res = requireClient().auth.onAuthStateChange(callback);
      return res.data.subscription;
    },
  };

  global.meobooksServices = {
    setClient(c) { client = c; },
    hasClient() { return !!client; },
    localStore,
    sync,
    auth,
  };
})(typeof window !== 'undefined' ? window : globalThis);
