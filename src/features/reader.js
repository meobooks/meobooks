// Logic đọc trang và sách (tách từ PageRead và BookViewer của legacy). Hàm thuần.

// Danh sách mục ngữ pháp của trang (hỗ trợ dữ liệu cũ dạng grammarData).
export function grammarListOf(p) {
  return p.grammarList || (p.grammarData && p.type === 'grammar' ? [{ id: 'g0', ...p.grammarData }] : []);
}

// Các mục bổ sung của trang đọc, nửa, viết (chỉ lấy mục có giá trị).
export function extraEntriesOf(p) {
  if (!['reading', 'listening', 'writing'].includes(p.type)) return [];
  return Object.entries(p[p.type + 'Data'] || {}).filter(([, v]) => v);
}

// Trang có nét vẽ không.
export function hasInkStrokes(p) {
  return !!(p.ink && p.ink.strokes && p.ink.strokes.length);
}

// Số tờ tối đa khi lật theo cặp (maxS) và số trang khi xem một trang (maxC).
export function bookBounds(n) {
  return { maxS: Math.floor(n / 2), maxC: n - 1 };
}

// Vị trí tờ bắt đầu: tờ không phải bìa có id khớp; không có thì 0.
export function startLeafIndex(leaves, startId) {
  return Math.max(0, leaves.findIndex((x) => !x.cover && x.id === startId));
}

// Có được lật theo hướng này không (chế độ một trang dùng ci, chế độ hai trang dùng s).
export function canTurn(dir, single, s, ci, maxS, maxC) {
  if (single) {
    if (dir === 'next' && ci >= maxC) return false;
    if (dir === 'prev' && ci <= 0) return false;
    return true;
  }
  if (dir === 'next' && s >= maxS) return false;
  if (dir === 'prev' && s <= 0) return false;
  return true;
}
