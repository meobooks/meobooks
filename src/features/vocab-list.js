// Danh sách, gợi ý và kiểm tra trùng cho bảng từ vựng JLPT (tách từ legacy). Hàm thuần.
import { classOf, byNewest, nbOf } from './vocab.js';

// Lọc và sắp xếp từ vựng mới nhất trước.
// status: 'all' hoặc trạng thái cụ thể; favOnly: chỉ từ yêu thích; cls: 'all' hoặc tough/learn/known; q: chuỗi tìm kiếm
export const filterVocab = ({ vocab = [], srs = {}, q = '', status = 'all', favOnly = false, cls = 'all', vs = {} }) => {
  const needle = String(q || '').trim().toLowerCase();
  return vocab
    .filter((p) =>
      (status === 'all' || p.status === status) &&
      (!favOnly || p.favorite) &&
      (cls === 'all' || classOf(vs, p, srs) === cls) &&
      (!needle || [p.word, p.kanji, p.reading, p.sino_viet, p.meaning, p.topic].some((h) => String(h || '').toLowerCase().includes(needle)))
    )
    .slice()
    .sort(byNewest);
};

// Gợi ý từ trùng hoặc gần giống khi đang nhập từ `draft.word` (không gợi ý chính nó)
export const suggestionsFor = (vocab = [], draft, limit = 5) => {
  const needle = String((draft && draft.word) || '').trim().toLowerCase();
  if (!needle) return [];
  return vocab
    .filter((v) => (!draft || v.id !== draft.id) && [v.word, v.kanji, v.reading].some((x) => String(x || '').toLowerCase().includes(needle)))
    .slice(0, limit);
};

// Số lượng từ theo trạng thái
export const statusCounts = (vocab = []) => vocab.reduce((l, p) => ((l[p.status] = (l[p.status] || 0) + 1), l), {});

// Từ trùng khi thêm/sửa: tìm theo kanji/word; bỏ qua chính bản ghi đang sửa (editingId)
export const liveDuplicate = (draft, editingId, findDup) => {
  const chk = (draft.kanji || draft.word || '').trim();
  if (!chk) return null;
  const found = findDup(chk) || findDup((draft.word || '').trim());
  if (found && found.id !== editingId) return found;
  return null;
};
