// Logic Pomodoro (tách từ PomodoroWidget của legacy). Hàm thuần, không đụng DOM hay React.

// Phiên tập trung từ 15 phút trở lên mới được tính là một phiên (cộng XP).
export const MIN_SESSION_MINUTES = 15;

// Số giây còn lại tính từ mốc kết thúc (ms) và thời điểm hiện tại (ms).
export function remainingSeconds(endMs, nowMs) {
  return Math.max(0, Math.round((endMs - nowMs) / 1000));
}

// Phiên dài `minutes` phút có được tính là một phiên học không.
export function countsAsSession(minutes) {
  return minutes >= MIN_SESSION_MINUTES;
}

// Tiêu đề tab: đang chạy thì hiện đồng hồ, không thì tên app.
// clockText là chuỗi đã định dạng (ví dụ "24:59").
export function documentTitle(running, clockText) {
  return running ? clockText + ' – meobooks' : 'meobooks';
}
