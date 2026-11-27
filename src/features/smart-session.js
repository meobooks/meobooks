// Thuật toán buổi học thông minh JLPT (tách từ legacy). Hàm thuần: nhận RNG để có thể kiểm thử lặp lại.
import { classOf } from './vocab.js';

// 5 bước đầy đủ cho lần học đầu tiên của mỗi từ
export const FULL_STEPS = ['jp_to_vi', 'vi_to_jp', 'type_reading', 'type_meaning', 'type_word'];

// Xáo trộn bản sao của mảng (Fisher–Yates), không sửa mảng gốc
export const shuffleArr = (arr, rng = Math.random) => {
  const r = arr.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

// Tạo hàng đợi: ưu tiên từ "tough" trước, rồi "learn", rồi "known" (trọng số theo nhóm)
// ctx: { vs (thống kê ok/bad/streak theo id), srs (bản ghi SRS theo id) }
export const makeInitialQueue = (words, ctx = {}, maxCount = 12, rng = Math.random) => {
  const { vs, srs } = ctx;
  const weight = { tough: 3, learn: 1.5, known: 0.6 };
  const prioritized = words
    .map((v) => ({ v, k: rng() / weight[classOf(vs, v, srs)] }))
    .sort((x, y) => x.k - y.k)
    .map((x) => x.v)
    .slice(0, maxCount);
  return prioritized.map((w) => ({
    vocabId: w.id,
    attempt: 1,
    stage: 'full', // "full" (5 bước) hoặc "reinforce" (2 bước củng cố sau lần 2 điền đúng)
    steps: [...FULL_STEPS],
    si: 0,
    failedThisPass: false,
    testsPassedInAttempt2: 0,
  }));
};

// Trộn câu hỏi theo lượt `size` từ: mọi bước còn lại của các từ trong lượt được xáo lẫn,
// nhưng vẫn giữ đúng thứ tự bước của từng từ (chọn đáp án trước, điền sau).
export const buildPlan = (queue, size, rng = Math.random) => {
  const plan = [];
  for (let b = 0; b < queue.length; b += size) {
    const bag = [];
    for (let i = b; i < Math.min(b + size, queue.length); i++) {
      const it = queue[i];
      for (let k = it.si; k < it.steps.length; k++) bag.push(i);
    }
    plan.push(...shuffleArr(bag, rng));
  }
  return plan;
};
