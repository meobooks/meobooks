// meobooks — logic Mochi Pet (giai đoạn 2, tách từ MochiPet của legacy).
// Plain script, không cần build. Gắn vào window.meobooksFeatures.mochiPet.
// Chỉ định nghĩa hàm; không có tác dụng phụ khi nạp.
(function (global) {
  'use strict';

  // Thời gian chờ giữa hai lần vuốt ve miễn phí (ms): 10 phút.
  var PET_COOLDOWN_MS = 600000;

  function clamp(v) {
    return Math.max(0, Math.min(100, Math.round(v)));
  }

  // Chỉ số hiện tại sau khi giảm theo thời gian trôi qua:
  // no bụng giảm 3 mỗi giờ, tâm trạng giảm 2 mỗi giờ.
  function decayedStats(base, nowMs) {
    var last = base.ts ? new Date(base.ts).getTime() : nowMs;
    var hours = Math.max(0, (nowMs - last) / 3600000);
    return {
      food: clamp(base.food - hours * 3),
      mood: clamp(base.mood - hours * 2),
    };
  }

  // Số ms còn lại trước khi được vuốt ve miễn phí lần nữa.
  function cooldownLeft(lastPet, nowMs) {
    return Math.max(0, PET_COOLDOWN_MS - (nowMs - (lastPet || 0)));
  }

  // Trạng thái mới sau một hành động tốn `cost` XP.
  // Trả về null nếu số XP còn lại không đủ; ngược lại trả về bản ghi để lưu.
  function afterAction(cur, cost, dFood, dMood, nowMs, extra) {
    if (cur.balance < cost) return null;
    return Object.assign({
      food: clamp(cur.food + dFood),
      mood: clamp(cur.mood + dMood),
      xpSpent: cur.spent + cost,
      ts: new Date(nowMs).toISOString(),
      lastPet: cur.lastPet || 0,
    }, extra || {});
  }

  global.meobooksFeatures = global.meobooksFeatures || {};
  global.meobooksFeatures.mochiPet = {
    PET_COOLDOWN_MS: PET_COOLDOWN_MS,
    decayedStats: decayedStats,
    cooldownLeft: cooldownLeft,
    afterAction: afterAction,
  };
})(typeof window !== 'undefined' ? window : globalThis);
