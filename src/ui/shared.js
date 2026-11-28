// Thành phần giao diện dùng chung, chuyển từ public/legacy/index.html (bước 3 tách giao diện).
// Dùng React.createElement như app cũ nên không cần JSX.
import React from 'react';

export const JCard = ({ theme: o, className: a = '', children: c, style: b }) =>
  React.createElement('div', {
    style: { backgroundColor: o.card, borderColor: o.border, ...b },
    className: 'rounded-3xl border p-5 ' + a,
  }, c);

export const JLoading = ({ theme: o }) =>
  React.createElement('div', {
    className: 'p-10 text-center font-bold opacity-70',
    style: { color: o.text },
  }, 'Đang tải dữ liệu…');
