import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// Giai đoạn 1 (bỏ iframe): nạp nguyên bản app cũ (public/legacy/index.html) vào chính trang này.
// Legacy tự nạp React UMD riêng (window.React) và không dùng component nào của app mới,
// nên hai React không đụng nhau.

// Liên kết trong email của Supabase mở trang với phần #access_token=... hoặc #error=...
const AUTH_HASH = /^#(?:.*&)?(?:access_token|error|error_code|type)=/;

// StrictMode chạy effect hai lần; chỉ nạp một lần.
let started = false;

// Chạy một script và đợi nó nạp xong, để giữ đúng thứ tự như trong trang gốc.
function runScript({ src, attrs, text }) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (src) {
      el.src = src;
      el.async = false;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error('Không tải được ' + src));
      document.head.appendChild(el);
    } else {
      el.textContent = text;
      document.head.appendChild(el);
      resolve();
    }
  });
}

export default function LegacyHost({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    if (started) return;
    started = true;

    // App cũ dùng React và ReactDOM toàn cục. Gán bản của Vite (cùng phiên bản 18.3.1 như trước)
    // để app cũ và các component mới dùng chung một React.
    window.React = React;
    window.ReactDOM = { createRoot };

    (async () => {
      const abs = (v) => new URL(v, new URL(url, window.location.href)).href;
      const html = await fetch(url).then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' khi tải ' + url);
        return r.text();
      });
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Style và link của head được đưa vào trang. Bỏ title và meta để không đổi tiêu đề trang.
      doc.head.querySelectorAll('style, link').forEach((n) => {
        const c = document.importNode(n, true);
        if (c.hasAttribute('href')) c.setAttribute('href', abs(c.getAttribute('href')));
        document.head.appendChild(c);
      });

      // Thu thập script theo đúng thứ tự trong trang gốc (head rồi đến body), rồi gỡ khỏi phần HTML.
      const plan = [...doc.head.querySelectorAll('script'), ...doc.body.querySelectorAll('script')].map((s) => {
        const attrs = {};
        Array.from(s.attributes).forEach((a) => { if (a.name !== 'src') attrs[a.name] = a.value; });
        return { src: s.getAttribute('src') ? abs(s.getAttribute('src')) : null, attrs, text: s.textContent };
      });
      doc.querySelectorAll('script').forEach((s) => s.remove());

      ref.current.innerHTML = doc.body.innerHTML;

      for (const p of plan) await runScript(p);

      // Các script đã chụp phần # khi nạp. Giờ xóa phần # nhạy cảm (chứa token) khỏi thanh địa chỉ.
      if (AUTH_HASH.test(window.location.hash)) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    })().catch((err) => {
      console.error('Không nạp được app cũ:', err);
    });
  }, [url]);

  // Div này không có con do React quản lý, nên nội dung legacy đặt vào đây không bị React xóa.
  return <div ref={ref} />;
}
