// Kiểm thử public/legacy/services.js (cầu nối giai đoạn 2).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const here = new URL('.', import.meta.url);
const servicesSrc = readFileSync(new URL('../public/legacy/services.js', import.meta.url), 'utf8');
const legacy = readFileSync(new URL('../public/legacy/index.html', import.meta.url), 'utf8');

// Môi trường giả: window + localStorage + Notification không cần thiết
function makeWindow(extra = {}) {
  const mem = new Map();
  const ls = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
  };
  const win = { };
  const ctx = { window: win, localStorage: ls, console, Date, Map, Math, JSON, Object, Array, String, Number, Promise, globalThis: null };
  ctx.globalThis = ctx;
  Object.assign(ctx, extra);
  vm.createContext(ctx);
  vm.runInContext(servicesSrc, ctx);
  return { svc: ctx.window.meobooksServices, mem, ctx };
}

let fails = 0, runs = 0;
const check = (cond, msg) => { runs++; if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const deq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1) Nạp file không có tác dụng phụ ngoài window.meobooksServices
{
  const { svc } = makeWindow();
  check(!!svc && typeof svc.setClient === 'function', 'meobooksServices được gắn lên window');
  check(svc.hasClient() === false, 'chưa có client khi mới nạp');
}

// 2) mergeData/mergeList khớp 100% với bản GỐC trong legacy
const start = legacy.indexOf('const stampOf=');
const end = legacy.indexOf(',ROUTE_TO_NAV=');
const orig = new Function(legacy.slice(start, end) + ';return {mergeData,mergeList};')();
{
  const { svc } = makeWindow();
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const ts = () => new Date(Date.UTC(2026, 0, 1) + Math.floor(rnd() * 1e9)).toISOString();
  const items = (p) => { const n = Math.floor(rnd() * 5), out = []; for (let i = 0; i < n; i++) { const it = { id: p + Math.floor(rnd() * 6), title: 't' + Math.floor(rnd() * 9) }; if (rnd() > 0.2) it.updatedAt = ts(); if (rnd() > 0.3) it.createdAt = ts(); out.push(it); } return out; };
  const data = () => {
    const act = {}; if (rnd() > 0.3) for (const d of ['2026-01-01', '2026-01-02']) if (rnd() > 0.4) act[d] = { xp: Math.floor(rnd() * 50), cards: Math.floor(rnd() * 5), mins: Math.floor(rnd() * 30), notes: Math.floor(rnd() * 3) };
    const nb = {}; if (rnd() > 0.5) nb['nb' + Math.floor(rnd() * 3)] = items('v');
    const vs = {}; if (rnd() > 0.5) vs['k' + Math.floor(rnd() * 3)] = { ok: Math.floor(rnd() * 9), bad: Math.floor(rnd() * 9), streak: Math.floor(rnd() * 9), last: ts() };
    return { prefs: { displayName: pick(['A', 'B', undefined]), activity: act, nbViews: nb, vstats: vs, theme: pick(['light', 'dark']) }, notebooks: items('n'), pages: items('p'), flashcards: items('f'), tasks: items('t') };
  };
  let bad = 0;
  for (let i = 0; i < 2000; i++) {
    const L = data(), R = data();
    if (!deq(orig.mergeData(L, R), svc.sync.mergeData(L, R))) bad++;
    const A = items('x'), B = items('x');
    if (!deq(orig.mergeList(A, B), svc.sync.mergeList(A, B))) bad++;
  }
  check(bad === 0, `mergeData/mergeList khớp bản gốc legacy (2000 ca, lệch: ${bad})`);
}

// 3) localStore: khóa và định dạng giữ nguyên
{
  const { svc, mem } = makeWindow();
  const ls = svc.localStore;
  ls.markDirty('u1');
  check(mem.get('mochi_dirty_u1') === '1' && ls.isDirty('u1'), 'dirty: ghi "1" đúng khóa');
  ls.clearDirty('u1');
  check(!mem.has('mochi_dirty_u1'), 'dirty: xóa đúng');
  ls.setJSON(ls.subjectsKey('u1'), [{ id: 'a' }]);
  check(mem.get('meobooks_subjects_u1') === '[{"id":"a"}]', 'subjects: JSON đúng khóa');
  mem.set('jlpt_local_u1', '{hỏng');
  check(ls.getJSON(ls.jlptLocalKey('u1'), 'fb') === 'fb', 'JSON hỏng trả fallback');
  ls.setLastUser({ id: 'u1', email: 'e', user_metadata: { d: 1 }, extra: 9 });
  check(deq(JSON.parse(mem.get('mochi_last_user')), { id: 'u1', email: 'e', user_metadata: { d: 1 } }), 'lastUser chỉ 3 trường');
  ls.setBestScore('bt', 'd1', 42);
  check(mem.get('bt_best_d1') === '42' && ls.getBestScore('bt', 'd1') === 42, 'best score round-trip');
  mem.set('mochi_ai_key', '');
  check(ls.getAiKey() === '', 'ai key rỗng -> ""');
}

// 4) auth: báo lỗi rõ khi chưa gắn client, gọi đúng client khi đã gắn
{
  const { svc } = makeWindow();
  let threw = false;
  try { svc.auth.signOut(); } catch (e) { threw = /chưa được gắn/.test(e.message); }
  check(threw, 'auth: báo lỗi rõ khi chưa gắn client');

  const calls = [];
  const fake = {
    auth: {
      signUp: async (args) => { calls.push(['signUp', args]); return { data: {}, error: null }; },
      signInWithPassword: async (args) => { calls.push(['signIn', args]); return { error: null }; },
      signOut: async () => { calls.push(['signOut']); return {}; },
      resetPasswordForEmail: async (e) => { calls.push(['reset', e]); return {}; },
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (cb) => { calls.push(['onChange']); return { data: { subscription: { unsubscribe() {} } } }; },
    },
  };
  svc.setClient(fake);
  check(svc.hasClient(), 'setClient gắn được');
  await svc.auth.signUp({ email: 'a@b.c', password: 'p', displayName: '  Tên  ' });
  check(deq(calls[0][1].options.data, { display_name: 'Tên' }), 'signUp: trim display_name như legacy');
  await svc.auth.signIn({ email: 'a@b.c', password: 'p' });
  await svc.auth.resetPassword('a@b.c');
  const sub = svc.auth.onAuthStateChange(() => {});
  check(calls.map((c) => c[0]).join() === 'signUp,signIn,reset,onChange' && typeof sub.unsubscribe === 'function', 'auth: gọi đúng hàm và trả subscription');
}

// 5) Bản legacy đã được nối: có thẻ script và gắn client
{
  check(/<script src="services\.js"><\/script>\s*<script>\(function bootApp/.test(legacy), 'legacy: nạp services.js trước bootApp');
  check(legacy.includes('supabase=(window.meoSupabase=isSupabaseConfigured?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null,window.meobooksServices&&window.meobooksServices.setClient(window.meoSupabase),window.meoSupabase),'), 'legacy: gắn client cho services, giá trị vẫn là client');
  check(!legacy.includes('supabase.auth.'), 'legacy: không còn lời gọi supabase.auth trực tiếp');
  const authCalls = ['meobooksServices.auth.getSession().then(', 'const e=meobooksServices.auth.onAuthStateChange(', 'await meobooksServices.auth.signUp({email:s,password:r,displayName:t})', 'await meobooksServices.auth.signIn({email:s,password:r})', 'supabase&&await meobooksServices.auth.signOut()', 'await meobooksServices.auth.resetPassword(s)'];
  check(authCalls.every((c) => legacy.includes(c)), 'legacy: đủ 6 lời gọi auth qua meobooksServices');
}

// 6) Lưu trữ cục bộ: bt_best_* (điểm cao nhất trò Bảng Từ)
{
  const { svc, mem } = makeWindow();
  const LS = svc.localStore;
  check(LS.bestKey('bt', 'deckA') === 'bt_best_deckA', 'bestKey("bt") ra đúng khóa bt_best_<id>');
  check(LS.getBestScore('bt', 'deckA') === 0, 'chưa có điểm thì trả 0');
  mem.set('bt_best_deckA', '');
  check(LS.getBestScore('bt', 'deckA') === 0, 'chuỗi rỗng trả 0 như legacy (+x||0)');
  LS.setBestScore('bt', 'deckA', 40);
  check(mem.get('bt_best_deckA') === '40' && LS.getBestScore('bt', 'deckA') === 40, 'setBestScore ghi chuỗi số và đọc lại đúng');
  // mô phỏng đúng logic finish() trong legacy
  const finishLogic = (deckId, score) => {
    let best = score;
    const o = LS.getBestScore('bt', deckId);
    best = Math.max(o, score);
    if (score > o) LS.setBestScore('bt', deckId, score);
    return best;
  };
  check(finishLogic('deckA', 25) === 40 && mem.get('bt_best_deckA') === '40', 'điểm thấp hơn không ghi đè, trả về điểm cao nhất');
  check(finishLogic('deckA', 55) === 55 && mem.get('bt_best_deckA') === '55', 'điểm cao hơn được ghi lại');
  check(finishLogic('deckB', 7) === 7 && mem.get('bt_best_deckB') === '7', 'mỗi bộ thẻ có khóa riêng');
}

// 7) Legacy: bt_best_* không còn truy cập localStorage trực tiếp, chỉ qua localStore
{
  check(!legacy.includes('"bt_best_"+g.deckId'), 'legacy: finish bt không còn gọi localStorage trực tiếp cho bt_best_');
  check(!legacy.includes('lsGet("bt_best_"'), 'legacy: màn giới thiệu bt không còn lsGet("bt_best_")');
  check(legacy.includes('LS.getBestScore("bt",g.deckId)') && legacy.includes('LS.setBestScore("bt",g.deckId,g.score)'), 'legacy: finish bt dùng getBestScore/setBestScore');
  check(legacy.includes('window.meobooksServices.localStore.getBestScore("bt",deck.id)'), 'legacy: màn giới thiệu bt đọc qua getBestScore');
}

// 8) Lưu trữ cục bộ: nt_best_* (điểm cao nhất Nối Từ)
{
  const { svc, mem } = makeWindow();
  const LS = svc.localStore;
  check(LS.bestKey('nt', 'deckA') === 'nt_best_deckA', 'bestKey("nt") ra đúng khóa nt_best_<id>');
  check(LS.getBestScore('nt', 'deckA') === 0, 'Nối Từ: chưa có điểm thì trả 0');
  LS.setBestScore('nt', 'deckA', 30);
  check(mem.get('nt_best_deckA') === '30', 'Nối Từ: setBestScore ghi đúng khóa nt_best_');
  check(LS.getBestScore('bt', 'deckA') === 0, 'Bảng Từ và Nối Từ không lẫn khóa');
  const finishLogic = (deckId, score) => {
    const o = LS.getBestScore('nt', deckId);
    const best = Math.max(o, score);
    if (score > o) LS.setBestScore('nt', deckId, score);
    return best;
  };
  check(finishLogic('deckA', 12) === 30 && mem.get('nt_best_deckA') === '30', 'Nối Từ: điểm thấp không ghi đè');
  check(finishLogic('deckA', 44) === 44 && mem.get('nt_best_deckA') === '44', 'Nối Từ: điểm cao hơn được ghi lại');
}

// 9) Legacy: nt_best_* đã nối qua localStore
{
  check(!legacy.includes('"nt_best_"+ng.deckId'), 'legacy: finish nt không còn gọi localStorage trực tiếp');
  check(!legacy.includes('lsGet("nt_best_"'), 'legacy: màn giới thiệu nt không còn lsGet("nt_best_")');
  check(legacy.includes('LS.getBestScore("nt",ng.deckId)') && legacy.includes('LS.setBestScore("nt",ng.deckId,score)'), 'legacy: finish nt dùng getBestScore/setBestScore');
  check(legacy.includes('window.meobooksServices.localStore.getBestScore("nt",deck.id)'), 'legacy: màn giới thiệu nt đọc qua getBestScore');
}

// 10) Lưu trữ cục bộ: meobooks_subjects_* (danh sách môn học)
{
  const { svc, mem } = makeWindow();
  const LS = svc.localStore;
  check(LS.subjectsKey('u1') === 'meobooks_subjects_u1', 'subjectsKey ra đúng khóa meobooks_subjects_<id>');
  check(LS.getSubjects('u1') === null, 'chưa có dữ liệu: getSubjects trả null (legacy dùng DEFAULT_SUBJECTS)');
  const list = [{ id: 's1', name: 'Từ vựng' }, { id: 's2', name: 'Ngữ pháp' }];
  LS.setSubjects('u1', list);
  check(mem.get('meobooks_subjects_u1') === JSON.stringify(list), 'setSubjects ghi JSON đúng định dạng legacy');
  check(deq(LS.getSubjects('u1'), list), 'getSubjects đọc lại đúng');
  check(LS.getSubjects('u2') === null, 'mỗi người dùng có khóa riêng');
  mem.set('meobooks_subjects_u1', '[]');
  check(LS.getSubjects('u1') === null, 'mảng rỗng: trả null như legacy');
  mem.set('meobooks_subjects_u1', '{"a":1}');
  check(LS.getSubjects('u1') === null, 'không phải mảng: trả null như legacy');
  mem.set('meobooks_subjects_u1', 'khong-phai-json');
  check(LS.getSubjects('u1') === null, 'JSON hỏng: trả null, không ném lỗi');
  // Đọc dữ liệu do bản cũ ghi (cùng định dạng)
  mem.set('meobooks_subjects_u3', JSON.stringify(list));
  check(deq(LS.getSubjects('u3'), list), 'đọc được dữ liệu do bản legacy ghi trước đó');
}

// 11) Legacy: meobooks_subjects_* đã nối qua localStore
{
  check(!legacy.includes('meobooks_subjects_'), 'legacy: không còn truy cập trực tiếp khóa meobooks_subjects_');
  check(legacy.includes('window.meobooksServices.localStore.getSubjects(o.id)'), 'legacy: đọc môn qua getSubjects');
  check(legacy.includes('window.meobooksServices.localStore.setSubjects(o.id,list)'), 'legacy: ghi môn qua setSubjects');
}

// 12) Lưu trữ cục bộ: các khóa còn lại (mochi_local, jlpt_local, phiên học, thông báo, người dùng cuối, dirty)
{
  const { svc, mem } = makeWindow();
  const LS = svc.localStore;
  const data = { prefs: { a: 1 }, notebooks: [], pages: [], flashcards: [], tasks: [] };
  check(LS.getLocalData('u1') === null, 'mochi_local: chưa có thì trả null');
  LS.setLocalData('u1', data);
  check(mem.get('mochi_local_u1') === JSON.stringify(data) && deq(LS.getLocalData('u1'), data), 'mochi_local: ghi/đọc đúng khóa và định dạng');
  mem.set('mochi_local_u2', '{hong');
  check(LS.getLocalData('u2') === null, 'mochi_local: JSON hỏng trả null, không ném lỗi');
  const jl = { vocab: [1], srs: {}, profile: {}, quests: [], ach: [], log: [], sessions: 0 };
  LS.setJlptLocal('u1', jl);
  check(mem.get('jlpt_local_u1') === JSON.stringify(jl) && deq(LS.getJlptLocal('u1'), jl), 'jlpt_local: ghi/đọc đúng khóa và định dạng');
  check(LS.getJlptLocal('nobody') === null, 'jlpt_local: chưa có thì trả null');
  check(LS.getSmartSession() === null, 'phiên học: chưa có thì trả null');
  LS.setSmartSession({ queue: [1, 2] });
  check(mem.get('mochi_smart_session_v2') === '{"queue":[1,2]}' && deq(LS.getSmartSession(), { queue: [1, 2] }), 'phiên học: ghi/đọc đúng khóa mochi_smart_session_v2');
  LS.clearSmartSession();
  check(!mem.has('mochi_smart_session_v2'), 'phiên học: clear xóa khóa');
  check(LS.getNotifDay() === null, 'thông báo: chưa có thì trả null');
  LS.setNotifDay('2026-11-27');
  check(mem.get('mochi_notif') === '2026-11-27' && LS.getNotifDay() === '2026-11-27', 'thông báo: ghi/đọc đúng khóa mochi_notif');
  LS.setLastUser({ id: 'u1', email: 'a@b.c', user_metadata: { display_name: 'A' }, extra: 'bo' });
  check(mem.get('mochi_last_user') === JSON.stringify({ id: 'u1', email: 'a@b.c', user_metadata: { display_name: 'A' } }), 'last_user: chỉ lưu id, email, user_metadata');
  check(LS.getLastUser().id === 'u1', 'last_user: đọc lại đúng');
  LS.clearLastUser();
  check(LS.getLastUser() === null, 'last_user: clear');
  check(!LS.isDirty('u1'), 'dirty: mặc định false');
  LS.markDirty('u1');
  check(mem.get('mochi_dirty_u1') === '1' && LS.isDirty('u1'), 'dirty: markDirty ghi "1"');
  LS.clearDirty('u1');
  check(!LS.isDirty('u1') && !mem.has('mochi_dirty_u1'), 'dirty: clearDirty xóa khóa');
  // Cờ cài đặt dùng getRaw/setRaw (thay lsGet/lsSet của legacy)
  check(LS.getRaw('bt_cnt', '32') === '32', 'cài đặt: chưa có thì dùng mặc định');
  LS.setRaw('bt_cnt', '64');
  check(LS.getRaw('bt_cnt', '32') === '64', 'cài đặt: ghi rồi đọc lại');
  LS.setRaw('bt_snd', '0');
  check(LS.getRaw('bt_snd') === '0' && LS.getRaw('bt_snd', '1') !== '1', 'cài đặt: bt_snd = "0" đọc đúng');
  // AI key chỉ đọc qua getAiKey
  mem.set('mochi_ai_key', 'sk-test');
  check(LS.getAiKey() === 'sk-test', 'ai key: đọc qua getAiKey');
}

// 15) Dọn dẹp: preconnect đúng project thật, không đăng ký sw.js
{
  check(!legacy.includes('eajwseopzkmoeriqlpry'), 'legacy: không còn project Supabase cũ eajwseopzkmoeriqlpry');
  check(legacy.includes('<link rel="preconnect" href="https://dlbmzzawxmedyulfduib.supabase.co" crossorigin>'), 'legacy: preconnect trỏ tới project thật dlbmzzawxmedyulfduib');
  check(!legacy.includes('serviceWorker') && !legacy.includes("register('sw.js')"), 'legacy: không còn đăng ký service worker sw.js');
}

// 16) Quên mật khẩu: đọc liên kết trong email, đặt mật khẩu mới
{
  const { svc } = makeWindow();
  const P = svc.auth.parseHash;
  check(deq(P(''), { type: '', error: '', errorCode: '', errorDescription: '' }), 'parseHash: rỗng ra kết quả rỗng');
  check(P('#/dashboard').type === '' && P('#/notebooks').error === '', 'parseHash: bỏ qua đường dẫn trang kiểu #/dashboard');
  check(P('#access_token=abc&refresh_token=x&type=recovery').type === 'recovery', 'parseHash: nhận ra type=recovery');
  check(P('type=recovery').type === 'recovery', 'parseHash: không cần dấu #');
  const e = P('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');
  check(e.error === 'access_denied' && e.errorCode === 'otp_expired' && e.errorDescription === 'Email link is invalid or has expired', 'parseHash: đọc lỗi, đổi + thành khoảng trắng');
  check(P('#error_description=%E1%BA%A1%20x').errorDescription === 'ạ x', 'parseHash: giải mã %XX');
  check(P('#error_description=%E0%A4%A').errorDescription === '%E0%A4%A', 'parseHash: chuỗi mã hóa hỏng không ném lỗi');
  check(svc.auth.describeError(e).includes('hết hạn'), 'describeError: otp_expired ra thông báo tiếng Việt');
  check(svc.auth.describeError(P('#error=access_denied&error_description=Boom')) === 'Boom', 'describeError: lỗi khác dùng mô tả của Supabase');
  check(svc.auth.describeError(P('#type=recovery')) === '', 'describeError: không lỗi thì rỗng');
  const mk = (hash, href) => makeWindow({ location: { hash, href: href || 'http://localhost:5174/meobooks/legacy/index.html' }, URL }).svc;
  const a = mk('#access_token=abc&type=recovery');
  check(a.auth.isRecoveryBoot() === true && a.auth.bootAuthError() === '', 'boot: mở từ liên kết khôi phục -> isRecoveryBoot true');
  const b = mk('#error=access_denied&error_code=otp_expired');
  check(b.auth.isRecoveryBoot() === false && b.auth.bootAuthError().includes('hết hạn'), 'boot: liên kết hết hạn -> báo lỗi, không vào màn đặt mật khẩu');
  const c = mk('#/dashboard');
  check(c.auth.isRecoveryBoot() === false && c.auth.bootAuthError() === '', 'boot: mở app bình thường -> không có gì');
  check(makeWindow().svc.auth.isRecoveryBoot() === false, 'boot: không có location -> không lỗi');
  const calls = [];
  const client = { auth: {
    resetPasswordForEmail: async (...args) => { calls.push(['reset', ...args]); return {}; },
    updateUser: async (...args) => { calls.push(['update', ...args]); return { data: {}, error: null }; },
  } };
  a.setClient(client);
  globalThis.__p16 = (async () => {
    await a.auth.resetPassword('a@b.c');
    check(deq(calls[0], ['reset', 'a@b.c', { redirectTo: 'http://localhost:5174/meobooks/' }]), 'resetPassword: tự gửi redirectTo là trang ngoài /meobooks/');
    await a.auth.resetPassword('a@b.c', 'https://x.github.io/meobooks/');
    check(deq(calls[1], ['reset', 'a@b.c', { redirectTo: 'https://x.github.io/meobooks/' }]), 'resetPassword: redirectTo truyền vào được ưu tiên');
    const n = makeWindow().svc; n.setClient(client);
    await n.auth.resetPassword('z@z.z');
    check(deq(calls[2], ['reset', 'z@z.z']), 'resetPassword: không có location thì gọi như cũ (chỉ email)');
    await a.auth.updatePassword('matkhaumoi');
    check(deq(calls[3], ['update', { password: 'matkhaumoi' }]), 'updatePassword: gọi updateUser({password})');
  })().catch((x) => { fails++; console.log('FAIL (mục 16 ngoại lệ)', x); });
}

// 17) Legacy và shell: màn hình đặt mật khẩu mới đã được nối
{
  const appJsx = readFileSync(new URL('../src/app/App.jsx', import.meta.url), 'utf8');
  check(legacy.includes('meobooksServices.auth.isRecoveryBoot()') && legacy.includes('t==="PASSWORD_RECOVERY"&&setRecovery(!0)'), 'legacy: bật màn đặt mật khẩu khi mở từ liên kết hoặc nhận sự kiện PASSWORD_RECOVERY');
  check(legacy.includes('if(recovery)return(()=>') && legacy.indexOf('if(recovery)return') < legacy.indexOf('if(!o)return(()=>{const H=React.createElement,FEATS='), 'legacy: màn đặt mật khẩu được kiểm tra trước màn đăng nhập');
  check(legacy.includes('meobooksServices.auth.updatePassword(rcForm.pw)'), 'legacy: màn đặt mật khẩu gọi auth.updatePassword');
  check(legacy.includes('[R,j]=useState(()=>meobooksServices.auth.bootAuthError())'), 'legacy: liên kết hỏng/hết hạn hiện thông báo ở khung đăng nhập');
  check(appJsx.includes('LEGACY_URL + h') && appJsx.includes('replaceState'), 'shell: App.jsx chuyển phần # vào iframe và xóa khỏi thanh địa chỉ');
  const re = /^#(?:.*&)?(?:access_token|error|error_code|type)=/;
  check(re.test('#access_token=a&type=recovery') && re.test('#error=access_denied&error_code=otp_expired') && !re.test('#/dashboard') && !re.test(''), 'shell: biểu thức nhận diện # đúng với liên kết email, bỏ qua #/dashboard');
}

// 13) Đồng bộ: phần gọi Supabase (dùng client giả)
{
  const { svc } = makeWindow();
  const calls = [];
  const fakeClient = {
    from(table) {
      calls.push(['from', table]);
      return {
        select(cols) { calls.push(['select', cols]); return { eq(c, v) { calls.push(['eq', c, v]); return { maybeSingle() { calls.push(['maybeSingle']); return Promise.resolve({ data: { user_id: v }, error: null }); } }; } }; },
        upsert(row, opts) { calls.push(['upsert', row, opts]); return Promise.resolve({ error: null }); },
        insert(row) { calls.push(['insert', row]); return Promise.resolve({ error: null }); },
      };
    },
    channel(name) {
      calls.push(['channel', name]);
      const ch = {
        on(type, cfg, cb) { calls.push(['on', type, cfg]); ch.cb = cb; return ch; },
        subscribe() { calls.push(['subscribe']); return ch; },
      };
      fakeClient.lastChannel = ch;
      return ch;
    },
    removeChannel(ch) { calls.push(['removeChannel', ch === fakeClient.lastChannel]); },
  };
  let threw = false;
  try { svc.sync.fetchRow('u1'); } catch (e) { threw = true; }
  check(threw, 'sync: chưa gắn client thì fetchRow báo lỗi rõ ràng');
  svc.setClient(fakeClient);
  (async () => {
    const r = await svc.sync.fetchRow('u1');
    check(deq(calls.slice(0, 4), [['from', 'mochi_user_data'], ['select', '*'], ['eq', 'user_id', 'u1'], ['maybeSingle']]) && r.data.user_id === 'u1', 'sync: fetchRow gọi đúng bảng/cột/điều kiện');
    calls.length = 0;
    await svc.sync.upsertRow('u1', { prefs: { a: 1 }, tasks: [] }, '2026-11-27T00:00:00.000Z');
    check(calls[0][1] === 'mochi_user_data' || calls[0][0] === 'from', 'sync: upsertRow gọi bảng mochi_user_data');
    const up = calls.find((c) => c[0] === 'upsert');
    check(deq(up[1], { user_id: 'u1', prefs: { a: 1 }, tasks: [], updated_at: '2026-11-27T00:00:00.000Z' }) && deq(up[2], { onConflict: 'user_id' }), 'sync: upsertRow đúng dòng và onConflict user_id');
    const ins = await svc.sync.insertRow('u3', { prefs: { b: 2 } }, '2026-11-27T00:00:00.000Z');
    check(!ins.error && calls.some((c) => c[0] === 'insert' && c[1].user_id === 'u3' && c[1].prefs.b === 2) && !calls.some((c) => c[0] === 'upsert'), 'sync: insertRow chỉ insert, không upsert');
    await svc.sync.upsertRow('u2', { prefs: {} });
    const up2 = calls.filter((c) => c[0] === 'upsert')[1];
    check(up2[1].user_id === 'u2' && /^\d{4}-\d\d-\d\dT/.test(up2[1].updated_at), 'sync: upsertRow tự điền updated_at khi không truyền');
    calls.length = 0;
    const got = [];
    const sub = svc.sync.subscribeRealtime('u1', (row) => got.push(row));
    const on = calls.find((c) => c[0] === 'on');
    check(calls[0][0] === 'channel' && calls[0][1] === 'mochi-realtime-sync', 'sync: kênh tên mochi-realtime-sync');
    check(deq(on, ['on', 'postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mochi_user_data', filter: 'user_id=eq.u1' }]), 'sync: lắng nghe UPDATE đúng bảng và bộ lọc user_id');
    check(calls.some((c) => c[0] === 'subscribe'), 'sync: đã subscribe');
    fakeClient.lastChannel.cb({ new: { updated_at: 'x', prefs: { z: 1 } } });
    check(got.length === 1 && got[0].updated_at === 'x', 'sync: onRow nhận dòng mới (payload.new)');
    sub.unsubscribe();
    check(deq(calls[calls.length - 1], ['removeChannel', true]), 'sync: unsubscribe gọi removeChannel đúng kênh');
    // Điều kiện áp realtime khớp biểu thức gốc của legacy
    const SY = svc.sync;
    const origCond = (n, st, q) => n && st === 'saved' && n.updated_at !== q;
    let same = true;
    for (const st of ['saved', 'saving', 'error', 'offline'])
      for (const n of [null, undefined, { updated_at: 'a' }, { updated_at: 'b' }])
        for (const q of ['a', 'b', null]) {
          if (!!origCond(n, st, q) !== SY.shouldApplyRemote({ status: st, remoteRow: n, lastWrittenAt: q })) same = false;
        }
    check(same, 'sync: shouldApplyRemote khớp điều kiện gốc trên mọi tổ hợp');
    await globalThis.__p16;
    console.log(fails ? `\n${fails} lỗi / ${runs}` : `\nTất cả ${runs} kiểm thử đạt`);
    process.exit(fails ? 1 : 0);
  })();
}

// 14) Legacy: không còn truy cập trực tiếp localStorage/Supabase cho các nhóm đã nối
{
  check(!legacy.includes('localStorage'), 'legacy: không còn chữ localStorage nào (mọi truy cập qua localStore)');
  check(!legacy.includes('mochi_local_') && !legacy.includes('mochi_dirty_') && !legacy.includes('jlpt_local_'), 'legacy: không còn khóa mochi_local_/mochi_dirty_/jlpt_local_ viết tay');
  check(!legacy.includes('mochi_last_user') && !legacy.includes('mochi_notif') && !legacy.includes('mochi_ai_key') && !legacy.includes('mochi_smart_session_v2'), 'legacy: không còn khóa last_user/notif/ai_key/smart_session viết tay');
  check(!legacy.includes('from("mochi_user_data")') && !legacy.includes('supabase.channel('), 'legacy: không còn gọi bảng mochi_user_data/kênh realtime trực tiếp');
  check(legacy.includes('sync.insertRow(e.id,O)') && legacy.includes('sync.fetchRow(') && legacy.includes('sync.upsertRow(') && legacy.includes('sync.subscribeRealtime('), 'legacy: dùng fetchRow/upsertRow/subscribeRealtime');
  check((legacy.match(/sync\.upsertRow\(/g) || []).length === 2 && (legacy.match(/sync\.fetchRow\(/g) || []).length === 2, 'legacy: 2 chỗ upsertRow, 2 chỗ fetchRow');
  check(!/sync\.upsertRow\(e\.id,O\)/.test(legacy), 'legacy: không ghi dữ liệu mặc định lên tài khoản khi chưa tải được');
  check(legacy.includes('meoCloudLoaded=true') && legacy.includes('if(!meoCloudLoaded)'), 'legacy: chặn lưu toàn dòng khi chưa tải xong dữ liệu');
  check(legacy.includes('getRaw(k,d)') && legacy.includes('setRaw(k,v)'), 'legacy: lsGet/lsSet chuyển sang getRaw/setRaw');
}
