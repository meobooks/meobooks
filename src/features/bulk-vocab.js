// Phân tích văn bản nhập hàng loạt từ vựng (tách từ legacy). Hàm thuần.
import { withNb } from './vocab.js';

// Định dạng JLPT: mỗi dòng "Từ - Cách đọc - Nghĩa - Ví dụ"; dòng thiếu từ hoặc nghĩa bị bỏ qua
export const parseBulkLines = (text, nb) =>
  String(text || '')
    .split('\n')
    .map((h) => h.split(' - ').map((m) => m.trim()))
    .filter((h) => h[0] && h[2])
    .map((h) => ({ word: h[0], reading: h[1], meaning: h[2], example_jp: h[3], tags: withNb([], nb) }));

// Nhập dán vào kho: mỗi dòng tách bởi - | : ; hoặc tab. Mỗi dòng có id tạm theo thời điểm `now`
export const parseVocabPaste = (text, now = Date.now()) =>
  String(text || '')
    .trim()
    .split('\n')
    .map((s, r) => {
      const x = s.split(/[-|:;\t]/).map((i) => i.trim());
      return {
        id: 'v-bulk-' + now + '-' + r,
        word: x[0] || '',
        reading: x[1] || '',
        kanji: x[0] || '',
        meaning: x[2] || x[1] || '',
        pos: 'Từ vựng',
        example: x[3] || '',
        translation: '',
        note: '',
        status: 'learning',
      };
    });
