// meobooks — logic Pomodoro (giai đoạn 2, tách từ PomodoroWidget của legacy).
// Plain script, không cần build. Gắn vào window.meobooksFeatures.pomodoro.
// Chỉ định nghĩa hàm; không có tác dụng phụ khi nạp.
(function (global) {
  'use strict';

  // Phiên tập trung từ 15 phút trở lên mới được tính là một phiên (cộng XP).
  var MIN_SESSION_MINUTES = 15;

  // Số giây còn lại tính từ mốc kết thúc (ms) và thời điểm hiện tại (ms).
  function remainingSeconds(endMs, nowMs) {
    return Math.max(0, Math.round((endMs - nowMs) / 1000));
  }

  // Phiên dài `minutes` phút có được tính là một phiên học không.
  function countsAsSession(minutes) {
    return minutes >= MIN_SESSION_MINUTES;
  }

  // Tiêu đề tab: đang chạy thì hiện đồng hồ, không thì tên app.
  // clockText là chuỗi đã định dạng (ví dụ "24:59").
  function documentTitle(running, clockText) {
    return running ? clockText + ' – meobooks' : 'meobooks';
  }

  global.meobooksFeatures = global.meobooksFeatures || {};
  global.meobooksFeatures.pomodoro = {
    MIN_SESSION_MINUTES: MIN_SESSION_MINUTES,
    remainingSeconds: remainingSeconds,
    countsAsSession: countsAsSession,
    documentTitle: documentTitle,
  };
})(typeof window !== 'undefined' ? window : globalThis);
