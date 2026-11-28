// Logic Nối từ (tách từ NoiTu của legacy): cỡ vòng, chia lô, điểm, XP, bộ từ đang chơi.
// Hàm thuần. Xáo trộn (shuffle) vẫn nằm ở legacy.

// Số từ mỗi vòng: ít nhất 10, không quá 100 và không quá số từ có sẵn.
export function roundSize(cnt, poolLen) {
  const maxN = Math.min(100, poolLen);
  return Math.max(10, Math.min(cnt, maxN));
}

// Chia danh sách đã chọn thành các lô, mỗi lô khoảng `batch` từ, cỡ lô cân đều.
export function splitBatches(items, batch) {
  const n = items.length;
  const nb = Math.ceil(n / batch);
  const batches = [];
  let from = 0;
  for (let i = 0; i < nb; i++) {
    const size = Math.round((n - from) / (nb - i));
    batches.push(items.slice(from, from + size));
    from += size;
  }
  return batches;
}

// Điểm vòng chơi: 10 điểm mỗi từ, thưởng tốc độ, phạt 3 điểm mỗi lần sai. Không âm.
export function roundScore({ n, secs, wrong }) {
  return Math.max(0, n * 10 + Math.max(0, n * 4 - secs) - wrong * 3);
}

// XP nhận được: 1 mỗi 5 từ, từ 1 đến 10.
export function roundXp(n) {
  return Math.min(10, Math.max(1, Math.floor(n / 5)));
}

// Bộ từ đang chơi. Chế độ "fresh" chỉ lấy từ chưa dùng; còn lại lấy cả bộ.
export function playPool(list, usedSet, order) {
  return order === 'fresh' ? list.filter((x) => !usedSet.has(x.v.id)) : list;
}

// Danh sách đã dùng sau khi đặt lại bộ: bỏ các id thuộc bộ này.
export function usedAfterReset(usedIds, deckIds) {
  const ids = new Set(deckIds);
  return usedIds.filter((id) => !ids.has(id));
}
