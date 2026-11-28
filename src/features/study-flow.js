// Luồng trạng thái từng từ trong buổi học JLPT (tách từ legacy). Hàm thuần.
import { FULL_STEPS } from './smart-session.js';

// Bước củng cố sau khi đã điền đúng cả 3 bài kiểm tra ở lần học lại
export const REINFORCE_STEPS = ['jp_to_vi', 'vi_to_jp'];

// 3 bước kiểm tra tự luận (điền cách đọc / nghĩa / từ)
export const isTestStep = (mode) => mode === 'type_reading' || mode === 'type_meaning' || mode === 'type_word';

// Cập nhật từ sau một câu trả lời: đánh dấu có sai trong lượt, đếm bài kiểm tra đúng ở lần học lại
export const markAnswer = (item, mode, isCorrect) => ({
  ...item,
  failedThisPass: item.failedThisPass || !isCorrect,
  testsPassedInAttempt2:
    item.attempt >= 2 && isTestStep(mode) && isCorrect
      ? item.testsPassedInAttempt2 + 1
      : item.testsPassedInAttempt2,
});

// Khi đã đi hết các bước của một từ trong lượt: trả về mục cần đưa vào vòng lặp lại, hoặc null nếu không cần
export const retryItemOf = (item) => {
  const base = { vocabId: item.vocabId, si: 0, failedThisPass: false };
  if (item.stage === 'full') {
    if (item.attempt >= 2 && item.testsPassedInAttempt2 >= 3) {
      // Lần 2 đã điền đúng cả 3 bài kiểm tra: chỉ còn 2 bước củng cố
      return { ...base, attempt: item.attempt, stage: 'reinforce', steps: [...REINFORCE_STEPS], testsPassedInAttempt2: 3 };
    }
    if (item.failedThisPass) {
      // Sai ít nhất một lần: học lại từ đầu 5 bước
      return { ...base, attempt: item.attempt + 1, stage: 'full', steps: [...FULL_STEPS], testsPassedInAttempt2: 0 };
    }
    return null;
  }
  if (item.stage === 'skim') {
    return item.failedThisPass
      ? { ...base, attempt: item.attempt + 1, stage: 'skim', steps: [...REINFORCE_STEPS], testsPassedInAttempt2: 0 }
      : null;
  }
  if (item.stage === 'reinforce') {
    return item.failedThisPass
      ? { ...base, attempt: item.attempt + 1, stage: 'full', steps: [...FULL_STEPS], testsPassedInAttempt2: 0 }
      : null;
  }
  return null;
};
