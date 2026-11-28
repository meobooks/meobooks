// Hộp thoại tùy chỉnh sổ tay, chuyển từ public/legacy/index.html (tách giao diện bước 6).
// NB_COLORS và cleanT vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState } from 'react';

export function makeNbEditModal({ NB_COLORS, cleanT }) {
  return function NbEditModal({ nb, theme: n, onSave, onDelete, onClose }) {
    const E = React.createElement;
    const [title, setTitle] = useState(nb.title || ''), [subject, setSubject] = useState(nb.subject || ''), [desc, setDesc] = useState(nb.desc || ''), [color, setColor] = useState(nb.color || NB_COLORS[0]);
    const inp = { borderColor: n.border, backgroundColor: n.card, color: n.text };
    const field = (label, el) => E('label', { className: 'block space-y-1' }, E('span', { className: 'text-xs font-bold opacity-80' }, label), el);
    const save = () => { const t = title.trim(); if (!t) return; onSave({ title: t, subject: subject.trim(), desc: desc.trim(), color }); };
    return E('div', { className: 'fixed inset-0 flex items-center justify-center p-4', style: { zIndex: 1000, backgroundColor: 'rgba(40,28,52,.45)' }, onClick: (ev) => { if (ev.target === ev.currentTarget) onClose(); } },
      E('div', { style: { backgroundColor: n.card, borderColor: n.border, color: n.text }, className: 'w-full max-w-md rounded-3xl border-2 p-6 space-y-4' },
        E('h3', { className: 'font-extrabold text-lg' }, 'Tùy chỉnh sổ tay'),
        field('Tên sổ', E('input', { value: title, onChange: (e) => setTitle(e.target.value), maxLength: 40, className: 'w-full px-3 py-2 rounded-xl border text-sm', style: inp })),
        field('Môn học', E('input', { value: subject, onChange: (e) => setSubject(e.target.value), maxLength: 30, placeholder: 'VD: Japanese, Math…', className: 'w-full px-3 py-2 rounded-xl border text-sm', style: inp })),
        field('Mô tả', E('input', { value: desc, onChange: (e) => setDesc(e.target.value), maxLength: 80, className: 'w-full px-3 py-2 rounded-xl border text-sm', style: inp })),
        E('div', { className: 'space-y-1' },
          E('span', { className: 'text-xs font-bold opacity-80' }, 'Màu nền'),
          E('div', { className: 'flex flex-wrap gap-2' }, NB_COLORS.map((c) => E('button', { key: c, type: 'button', onClick: () => setColor(c), className: 'tap-fx w-8 h-8 rounded-xl border-2', style: { backgroundColor: c, borderColor: color === c ? n.accent : 'transparent' } })))),
        E('div', { className: 'flex flex-wrap gap-2 pt-2' },
          E('button', { onClick: save, style: { backgroundColor: n.accent }, className: 'tap-fx px-4 py-2 rounded-xl text-white text-xs font-bold' }, 'Lưu'),
          E('button', { onClick: onClose, style: { backgroundColor: n.accentSoft }, className: 'tap-fx px-4 py-2 rounded-xl text-xs font-bold' }, 'Hủy'),
          E('button', { onClick: () => { if (confirm('Xóa sổ "' + cleanT(nb.title) + '"?')) onDelete(); }, className: 'tap-fx ml-auto px-4 py-2 rounded-xl text-xs font-bold text-rose-500' }, 'Xóa sổ'))));
  };
}
