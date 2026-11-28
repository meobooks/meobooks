// Cấp độ EXP và huy hiệu JLPT (tách từ legacy). Hàm thuần.

// Đường cong cấp: cấp n cần `need` EXP, need nhân đôi mỗi cấp, tối đa cấp 60
export const lvlInfo = (exp) => {
  let n = 1, need = 10, left = Math.max(0, Number(exp) || 0);
  while (left >= need && n < 60) { left -= need; n++; need *= 2; }
  return { level: n, into: left, need };
};

export const levelOf = (exp) => lvlInfo(exp).level;

// Định nghĩa huy hiệu: `test(stats)` trả true khi đạt điều kiện
export const ACH_DEFS = [
  { id: 'first_word', title: 'Từ đầu tiên', icon: '', desc: 'Thêm 1 từ vựng', test: (o) => o.vocab >= 1 },
  { id: 'words_50', title: '50 từ vựng', icon: '', desc: 'Có 50 từ', test: (o) => o.vocab >= 50 },
  { id: 'words_200', title: '200 từ vựng', icon: '', desc: 'Có 200 từ', test: (o) => o.vocab >= 200 },
  { id: 'streak_3', title: 'Chuỗi 3 ngày', icon: '', desc: 'Học 3 ngày liên tiếp', test: (o) => o.streak >= 3 },
  { id: 'streak_7', title: 'Chuỗi 7 ngày', icon: '', desc: 'Học 7 ngày liên tiếp', test: (o) => o.streak >= 7 },
  { id: 'level_5', title: 'Đạt cấp 5', icon: '', desc: 'Lên cấp 5', test: (o) => o.level >= 5 },
  { id: 'first_session', title: 'Buổi học đầu tiên', icon: '', desc: 'Hoàn thành 1 buổi', test: (o) => o.sessions >= 1 },
  { id: 'perfect', title: 'Điểm tuyệt đối', icon: '', desc: 'Đúng hết (từ 5 câu)', test: (o) => o.perfect },
];

// Các huy hiệu vừa đạt: chưa có trong `owned` và thỏa điều kiện với `stats`
export const newlyUnlocked = (defs, stats, owned = []) => {
  const have = new Set(owned);
  return defs.filter((m) => !have.has(m.id) && m.test(stats));
};

// Nhiệm vụ hằng ngày và hằng tuần (chuyển từ app cũ).
export const QUEST_DEFS = [{id:"d_review20",type:"daily",title:"Ôn 20 thẻ",icon:"",target:20,exp:2,gold:10,ev:"review"},{id:"d_add5",type:"daily",title:"Thêm 5 từ mới",icon:"",target:5,exp:2,gold:10,ev:"add"},{id:"d_session1",type:"daily",title:"Hoàn thành 1 buổi học bài",icon:"",target:1,exp:1,gold:10,ev:"session"},{id:"w_review100",type:"weekly",title:"Ôn 100 thẻ trong tuần",icon:"",target:100,exp:5,gold:10,ev:"review"},{id:"w_add25",type:"weekly",title:"Thêm 25 từ trong tuần",icon:"",target:25,exp:3,gold:10,ev:"add"},{id:"w_session5",type:"weekly",title:"5 buổi học bài",icon:"",target:5,exp:5,gold:10,ev:"session"}];
