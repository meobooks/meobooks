// Màn chế độ đọc trang sổ tay, chuyển từ public/legacy/index.html (tách giao diện bước 5).
// cleanT và PageRead vẫn nằm trong app cũ nên được truyền vào (dependency injection), như các màn JLPT.
import React from 'react';

export function makeReadView({ cleanT, PageRead }) {
  return function ReadView({ page: k, theme: n, defFont, notebooks, onBack, onEdit, onBook, onFav, onSyncVocab }) {
    const E = React.createElement;
    const nb = notebooks.find((x) => x.id === k.notebookId);
    const b = (label, fn, st, cls) => E('button', { onClick: fn, style: st || { backgroundColor: n.accentSoft }, className: 'tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold ' + (cls || '') }, label);
    return E('div', { className: 'space-y-4' },
      E('div', { className: 'no-print flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border', style: { backgroundColor: n.card, borderColor: n.border } },
        E('div', { className: 'flex items-center gap-2' }, b('← Về sổ tay', onBack), E('span', { className: 'text-xs font-bold opacity-70' }, nb ? cleanT(nb.title) : '')),
        E('div', { className: 'flex flex-wrap items-center gap-2' },
          E('span', { className: 'text-[11px] font-extrabold px-2.5 py-1 rounded-full', style: { backgroundColor: n.accentSoft } }, 'Chế độ đọc'),
          k.type === 'vocabulary' && (k.vocabRows || []).length > 0 && b('Đồng bộ vào Kho Từ Vựng', () => onSyncVocab(), { backgroundColor: '#FFF0C9', color: '#5E503F' }),
          b('Mở sách (lật trang)', onBook),
          b('PDF', () => window.print()),
          b(k.favorite ? '★ Yêu thích' : '☆ Yêu thích', onFav),
          b('Sửa trang', onEdit, { backgroundColor: n.accent }, 'text-white'))),
      E(PageRead, { page: k, defFont, onSyncVocab: k.type === 'vocabulary' ? onSyncVocab : null }));
  };
}
