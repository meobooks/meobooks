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
