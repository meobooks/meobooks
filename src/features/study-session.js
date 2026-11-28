// Dựng phiên học JLPT và tiến độ View (tách từ legacy). Hàm thuần: không gọi React hay localStorage.
import { makeInitialQueue, buildPlan, shuffleArr } from './smart-session.js';
import { REINFORCE_STEPS } from './study-flow.js';

// Từ đến hạn ôn: chưa có lịch, hoặc ngày ôn tới hạn <= hôm nay
export const isDue = (word, srs = {}, today) => {
  const r = srs[word.id];
  return !r || !r.next_review || r.next_review <= today;
};

// Các từ của một View theo đúng thứ tự wordIds (bỏ từ đã xóa)
export const viewWords = (view, vocab = []) => {
  const byId = new Map(vocab.map((v) => [v.id, v]));
  return (view.wordIds || []).map((id) => byId.get(id)).filter(Boolean);
};

// Tiến độ View: tất cả từ, từ chưa học, và số đã học (lưu ở view.doneIds)
export const viewProgress = (view, vocab = []) => {
  const done = new Set(view.doneIds || []);
  const all = viewWords(view, vocab);
  const pending = all.filter((v) => !done.has(v.id));
  return { all, pending, doneN: all.length - pending.length };
};

// Phiên học thông minh (5 bước): hàng đợi + kế hoạch lượt nếu có mixSize
// ctx: { vs, srs } dùng để ưu tiên từ theo thống kê
export const buildSmartSession = ({ kind = 'smart', title, viewRef = null, words, maxCount = 12, shuffle = false, mixSize = 0, ctx = {}, rng = Math.random }) => {
  const srcIds = words.map((v) => v.id);
  let queue = makeInitialQueue(shuffle ? shuffleArr(words, rng) : words, ctx, maxCount, rng);
  if (shuffle) queue = shuffleArr(queue, rng);
  const plan = mixSize ? buildPlan(queue, mixSize, rng) : null;
  return {
    kind,
    title,
    viewRef,
    src: srcIds,
    maxCount,
    round: 1,
    queue,
    mix: !!mixSize,
    mixSize,
    plan,
    pi: 0,
    qi: plan ? plan[0] : 0,
    nextRoundFailed: [],
    res: [],
    picked: null,
    typed: '',
    checked: null,
    requeueNotice: null,
  };
};

// Phiên lướt: mỗi từ 2 câu (Nhật→Việt, Việt→Nhật), xáo theo lượt 5 từ
export const buildSkimSession = ({ title, words, viewRef = null, rng = Math.random }) => {
  const queue = words.map((w) => ({ vocabId: w.id, attempt: 1, stage: 'skim', steps: [...REINFORCE_STEPS], si: 0, failedThisPass: false, testsPassedInAttempt2: 0 }));
  const plan = buildPlan(queue, 5, rng);
  return {
    kind: 'skim',
    title,
    viewRef,
    src: words.map((v) => v.id),
    maxCount: words.length,
    mix: true,
    mixSize: 5,
    plan,
    pi: 0,
    qi: plan[0],
    round: 1,
    queue,
    nextRoundFailed: [],
    res: [],
    picked: null,
    typed: '',
    checked: null,
    requeueNotice: null,
  };
};
