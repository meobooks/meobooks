// Vẽ nét bút và xem trang ghi chú tay, chuyển từ public/legacy/index.html (tách giao diện bước 4).
// drawStroke dùng chung cho InkLayer (trong legacy) và InkView, nên nằm ở đây một bản duy nhất.
import React, { useEffect, useRef, useState } from 'react';

// Vẽ một nét lên canvas. a = { p: [[x, y, áp lực], ...], c: màu, w: độ dày, t: 'pen' | 'pencil' | 'hl' }.
export function drawStroke(o, a) {
  const c = a.p;
  o.strokeStyle = o.fillStyle = a.c;
  o.lineCap = o.lineJoin = 'round';
  o.globalAlpha = a.t === 'hl' ? 0.35 : a.t === 'pencil' ? 0.8 : 1;
  if (c.length === 1) {
    o.beginPath();
    o.arc(c[0][0], c[0][1], a.w * (a.t === 'hl' ? 2 : 0.6), 0, 7);
    o.fill();
  } else if (a.t === 'hl') {
    o.lineWidth = a.w * 4;
    o.beginPath();
    o.moveTo(c[0][0], c[0][1]);
    c.slice(1).forEach((b) => o.lineTo(b[0], b[1]));
    o.stroke();
  } else {
    for (let b = 1; b < c.length; b++) {
      o.lineWidth = a.w * (a.t === 'pencil' ? 0.6 + c[b][2] / 120 : 0.5 + c[b][2] / 80);
      o.beginPath();
      o.moveTo(c[b - 1][0], c[b - 1][1]);
      o.lineTo(c[b][0], c[b][1]);
      o.stroke();
    }
  }
  o.globalAlpha = 1;
}

// Xem trang ghi chú tay (chỉ đọc): vẽ nền giấy rồi các nét, co theo chiều rộng khung.
export function InkView({ ink }) {
  const E = React.createElement;
  const ref = useRef(null), box = useRef(null), [w, setW] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const g = ref.current;
    if (!g || !w) return;
    const H = window.devicePixelRatio || 1, S = w / 1000;
    g.width = Math.round(w * H);
    g.height = Math.round(ink.h * S * H);
    const d = g.getContext('2d');
    d.scale(S * H, S * H);
    d.lineWidth = 1.5;
    d.strokeStyle = '#E3DDF0';
    d.fillStyle = '#CFC6E0';
    const z = ink.paper || 'lined';
    if (z === 'lined' || z === 'grid')
      for (let y = 40; y < ink.h; y += 40) { d.beginPath(); d.moveTo(0, y); d.lineTo(1000, y); d.stroke(); }
    if (z === 'grid')
      for (let x = 40; x < 1000; x += 40) { d.beginPath(); d.moveTo(x, 0); d.lineTo(x, ink.h); d.stroke(); }
    if (z === 'dots')
      for (let y = 40; y < ink.h; y += 40)
        for (let x = 40; x < 1000; x += 40) d.fillRect(x - 1.5, y - 1.5, 3, 3);
    ink.strokes.forEach((s) => drawStroke(d, s));
  }, [w, ink]);
  return E('div', { ref: box, className: 'mt-6' },
    E('canvas', { ref, style: { width: '100%', height: w ? ink.h * w / 1000 : 0, backgroundColor: '#FFFEFA', borderRadius: 16 } }));
}
