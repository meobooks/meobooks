// Tạo câu hỏi cho từng chế độ học JLPT (tách từ legacy). Hàm thuần: nhận RNG để kiểm thử lặp lại.
import { shuffleArr } from './smart-session.js';

// Chữ hiển thị chính của từ: kanji nếu có, nếu không thì từ gốc
export const front = (o) => o.kanji || o.word;

// Chọn tối đa 4 đáp án (gồm đáp án đúng `correct`), lấy nhiễu từ `pool` (bỏ chính từ `a`), rồi xáo thứ tự
export const pickOpts = (pool, a, getter, correct, rng = Math.random) => {
  const set = new Set([correct]);
  const cands = shuffleArr(pool.filter((f) => f.id !== a.id), rng);
  for (const f of cands) {
    const L = getter(f);
    if (L && !set.has(L)) set.add(L);
    if (set.size >= 4) break;
  }
  return shuffleArr([...set], rng);
};

// Gợi ý phụ hiển thị khi trả lời
export const hintOf = (v) => {
  const h = [];
  if (v.reading) h.push('Cách đọc: ' + v.reading);
  if (v.sino_viet) h.push('Hán Việt: ' + v.sino_viet);
  if (v.meaning) h.push('Nghĩa: ' + v.meaning);
  if (v.example_jp) h.push('Ví dụ: ' + v.example_jp + (v.example_vi ? ' — ' + v.example_vi : ''));
  return h;
};

// Dựng câu hỏi cho một từ theo chế độ `mode`; `pool` là toàn bộ từ vựng dùng để lấy đáp án nhiễu
export const buildQuestion = (mode, a, pool, rng = Math.random) => {
  const hint = hintOf(a);
  if (mode === 'jp_to_vi') return { v: a, mode, prompt: front(a), sub: a.reading && a.reading !== front(a) ? a.reading : '', correct: a.meaning, options: pickOpts(pool, a, (b) => b.meaning, a.meaning, rng), hint };
  if (mode === 'vi_to_jp') return { v: a, mode, prompt: a.meaning, correct: front(a), options: pickOpts(pool, a, front, front(a), rng), hint };
  if (mode === 'type_reading') return { v: a, mode, prompt: front(a), sub: 'Điền cách đọc (hiragana / romaji)', correct: a.reading || front(a), accepts: [a.reading, a.word, a.kanji].filter(Boolean), hint: hint.filter((x) => !x.startsWith('Cách đọc')) };
  if (mode === 'type_meaning') return { v: a, mode, prompt: front(a), sub: (a.reading && a.reading !== front(a) ? '(' + a.reading + ') ' : '') + 'Điền nghĩa tiếng Việt', correct: a.meaning, accepts: String(a.meaning || '').split(/[,;/、，]/).map((x) => x.trim()).concat([a.meaning]).filter(Boolean), hint: hint.filter((x) => !x.startsWith('Nghĩa')) };
  return { v: a, mode: 'type_word', prompt: a.meaning, sub: (a.reading ? 'Cách đọc: ' + a.reading + ' · ' : '') + 'Điền từ tiếng Nhật', correct: front(a), accepts: [a.word, a.kanji].filter(Boolean), hint };
};
