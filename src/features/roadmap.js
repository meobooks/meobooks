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
