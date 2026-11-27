// Logic Lantern Lane (tách từ N2Roadmap của legacy). Hàm thuần: chọn cấp độ và lọc sách.

// Cấp độ đang chọn: giữ `lv` nếu có trong danh sách, không thì lấy cấp đầu tiên.
export function resolveLevel(levels, lv) {
  const list = levels || [];
  return list.some((x) => x.id === lv) ? lv : (list[0] || {}).id;
}

// Sách thuộc cấp độ và ngôn ngữ đã chọn (sách không ghi ngôn ngữ thì coi là tiếng Nhật).
export function booksFor(books, level, lang) {
  return books.filter((b) => b.level === level && (b.lang || 'ja') === lang);
}

// Chuẩn hóa chuỗi để so khớp: bỏ khoảng trắng thừa, chữ thường.
export const rmNorm=s=>String(s||"").trim().toLowerCase().replace(/\s+/g," ");

// Phân tích nội dung bài từ vựng dạng bảng: mỗi dòng "STT|Từ|Pinyin|Nghĩa|Câu ví dụ|Pinyin ví dụ|Dịch nghĩa".
// Trả về null nếu nội dung không đúng dạng này (khi đó hiển thị như đoạn văn).
export function parseVocabLines(text) {
  const lines = String(text || '').split('\n').map((x) => x.trim()).filter(Boolean);
  if (!lines.length) return null;
  const rows = lines.map((line) => line.split('|').map((x) => x.trim()));
  if (!rows.every((r) => r.length >= 7 && /^\d+$/.test(r[0]))) return null;
  return rows.map((r) => ({
    stt: r[0],
    word: r[1],
    pinyin: r[2],
    meaning: r[3],
    example: r[4],
    examplePinyin: r[5],
    exampleMeaning: r[6],
  }));
}
