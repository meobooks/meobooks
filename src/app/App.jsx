import { useEffect, useState } from 'react';
import * as pomodoro from '../features/pomodoro.js';
import * as mochiPet from '../features/mochi-pet.js';
import * as bantu from '../features/bantu.js';
import { youtubeText } from '../features/youtube-text.js';
import * as noitu from '../features/noitu.js';
import * as reader from '../features/reader.js';
import * as roadmap from '../features/roadmap.js';
import * as vocab from '../features/vocab.js';
import * as plan from '../features/plan.js';
import * as srs from '../features/srs.js';
import * as answer from '../features/answer.js';
import * as smartSession from '../features/smart-session.js';

// Legacy là script thuần nên không import được từ src/. App gắn các hàm logic lên window
// trước khi khung iframe được tạo; legacy đọc qua window.parent (cùng origin).
window.meobooksFeatures = { pomodoro, mochiPet, bantu, youtubeText, noitu, reader, roadmap, vocab, plan, srs, answer, smartSession };

// Giai đoạn 1: chạy nguyên bản app cũ (đã áp bản vá matching) trong khung toàn màn hình.
// Giao diện, theme, Supabase, localStorage đều giữ y nguyên vì app cũ chạy không thay đổi.
// Các giai đoạn sau sẽ tách dần từng tính năng sang src/features/.
const LEGACY_URL = `${import.meta.env.BASE_URL}legacy/index.html`;

// Liên kết trong email của Supabase (đặt lại mật khẩu...) mở trang ngoài này kèm phần
// #access_token=...&type=recovery hoặc #error=.... Client Supabase nằm trong iframe nên
// phải chuyển phần # đó vào địa chỉ của iframe để nó đọc được.
const AUTH_HASH = /^#(?:.*&)?(?:access_token|error|error_code|type)=/;

export default function App() {
  const [src] = useState(() => {
    const h = window.location.hash;
    return AUTH_HASH.test(h) ? LEGACY_URL + h : LEGACY_URL;
  });

  // Xóa phần # nhạy cảm (chứa token) khỏi thanh địa chỉ của trang ngoài.
  useEffect(() => {
    if (AUTH_HASH.test(window.location.hash)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <iframe
      src={src}
      title="Meobooks"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 0,
        display: 'block',
      }}
    />
  );
}
