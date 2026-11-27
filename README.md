# Meobooks – Vite migration scaffold

This is a **technical scaffold only**, not the migrated application. The existing
single-file application and its data are not included or modified.

## Requirements
- Node.js 20+
- npm

## Local setup
Giai đoạn 1 chưa đọc biến `VITE_*` (Supabase đang được khai báo sẵn trong
`public/legacy/index.html`), nên không cần tạo `.env`.

```bash
npm install
npm run dev
```

Dev server mặc định chạy ở `http://localhost:5173/meobooks/` (nếu cổng đó bận,
Vite sẽ tự chuyển sang cổng khác và in ra trong terminal). Phải mở kèm `/meobooks/`
vì `base` trong `vite.config.js` là `/meobooks/`.

## Build
```bash
npm run build
npm run preview
```

## Important migration safeguards
- Keep the existing `main` branch and deployed version unchanged while migrating.
- Do not run SQL migrations or alter Supabase tables/data as part of this scaffold.
- Move features one at a time and test login, local cache, cloud sync, and realtime
  behavior before considering deployment.
- The `base` value in `vite.config.js` assumes the GitHub Pages project path
  `/meobooks/`. Change it only if the repository's published URL uses another path.
- The workflow deploys on pushes to both `main` and `migration-vite`. Before enabling
  it, configure GitHub Pages to use **GitHub Actions** and consider restricting the
  workflow to `migration-vite` until the migration is verified.

## Giai đoạn 1 (đã hoàn thành)
- Bản app cũ nằm ở `public/legacy/index.html`, hiển thị trong iframe toàn màn hình
  (`src/app/App.jsx`). Đã kiểm tra thủ công: trang chủ, đăng nhập, ghép đôi, đổi giao diện.
- Project Supabase đang dùng là `dlbmzzawxmedyulfduib` (đã xác nhận trên Supabase
  Dashboard: có đủ các bảng của app). Thẻ `preconnect` đã được sửa trỏ đúng project này.
- Bản legacy không còn đăng ký `sw.js` (file này chưa từng tồn tại, lỗi trước đây bị
  nuốt âm thầm). Khi cần làm ngoại tuyến thật sự, tạo `public/legacy/sw.js` rồi thêm
  lại đoạn đăng ký.

## Giai đoạn 2 (đang làm)
Kiến trúc: bản legacy là file tĩnh, không đi qua Vite, nên không import được `src/`.
Các lớp dịch vụ được viết thành một plain script, `public/legacy/services.js`, và
gắn vào `window.meobooksServices`. Không cần build.

- **Cầu nối** (xong): `services.js` được nạp trước script khởi động của legacy.
  Client Supabase của legacy được gắn lên `window.meoSupabase` (một thay đổi một
  dòng, giá trị không đổi), và gọi `meobooksServices.setClient(...)` để auth dùng.
- **Auth** (xong, đã nối và đã kiểm chứng trên trình duyệt): 6 lời gọi auth trong
  `index.html` đi qua `meobooksServices.auth`. Đã kiểm tra: đăng nhập sai và đúng,
  F5 khi đang đăng nhập, đăng xuất rồi F5, quên mật khẩu gửi được email.
  - Quên mật khẩu (đã kiểm chứng trên trình duyệt): email gửi kèm `redirectTo` là trang ngoài
    (`.../meobooks/`). Liên kết mở trang ngoài với phần `#access_token=...&type=recovery`;
    `src/app/App.jsx` chuyển phần `#` đó vào iframe (client Supabase nằm trong iframe) rồi
    xóa nó khỏi thanh địa chỉ. `services.js` chụp phần `#` ngay khi nạp
    (`auth.isRecoveryBoot()`, `auth.bootAuthError()`), legacy hiện màn "Đặt mật khẩu mới"
    (gọi `auth.updatePassword`). Liên kết hết hạn thì hiện thông báo ở khung đăng nhập.
    Cần trong Supabase: Authentication > URL Configuration > Redirect URLs có địa chỉ
    trang ngoài (`http://localhost:5174/meobooks/` khi thử trên máy).
  - Đăng ký bị Supabase chặn ("Signups not allowed for this instance"): đây là cấu
    hình project, không phải lỗi code.
- **Lưu trữ cục bộ** (đã nối toàn bộ, đã kiểm chứng trên trình duyệt): `meobooksServices.localStore`
  giữ đúng tên khóa và định dạng của legacy. Trong `index.html` không còn chữ
  `localStorage` nào.
  - Đã nối và đã kiểm chứng trên trình duyệt: `bt_best_*`, `nt_best_*`, `meobooks_subjects_*`,
    và `mochi_local_*`, `mochi_dirty_*`, `jlpt_local_*`,
    `mochi_last_user`, `mochi_notif`, `mochi_ai_key` (đọc qua `getAiKey`),
    `mochi_smart_session_v2` (phiên học thông minh), và các cài đặt `bt_snd`, `bt_deck`,
    `bt_cnt`, `bt_spd`, `nt_deck`, `nt_cnt`, `nt_order`, `nt_used` (qua `lsGet`/`lsSet`,
    nay gọi `getRaw`/`setRaw`).
  - Khóa phiên đăng nhập của Supabase do thư viện supabase-js tự quản lý, không nằm
    trong code legacy, nên không có gì để nối.
- **Đồng bộ** (đã nối, đã kiểm chứng trên trình duyệt): `meobooksServices.sync` chứa `mergeData`,
  `mergeList`, điều kiện áp realtime, cấu trúc upsert, và phần gọi Supabase:
  `fetchRow` (2 chỗ), `upsertRow` (3 chỗ: dòng khởi tạo, hợp nhất, lưu debounce) và
  `subscribeRealtime` (kênh `mochi-realtime-sync`). Phần điều khiển (debounce 500 ms,
  cờ dirty, trạng thái saving/saved) vẫn nằm trong component React của legacy và gọi
  vào các hàm trên.

Đã kiểm thử: `node test/services.test.mjs` (116 kiểm thử). Phần `mergeData` được so
với chính hàm gốc trong legacy trên 2000 ca ngẫu nhiên: khớp 100%. Phần gọi Supabase
được kiểm bằng client giả (đúng bảng, cột, `onConflict`, bộ lọc realtime). Các script
inline của `index.html` đã kiểm tra cú pháp sau khi vá.

Đã kiểm chứng trên trình duyệt: đăng nhập, lưu, ngoại tuyến, realtime, JLPT, cài đặt
trò chơi, phiên học, đăng xuất/đăng nhập lại. Giai đoạn 2 hoàn thành.

Dọn dẹp (đã kiểm chứng trên trình duyệt): sửa `preconnect`, bỏ đăng ký `sw.js`.

Tách tính năng (giai đoạn 2): Pomodoro (`src/features/pomodoro.js`).
Phần logic (tính số giây còn lại, ngưỡng 15 phút để tính một phiên, tiêu đề tab) nằm trong
`window.meobooksFeatures.pomodoro`, và `PomodoroWidget` trong legacy gọi vào đó. Giao diện
của widget vẫn nằm trong legacy. Kiểm thử: `node test/pomodoro.test.mjs` (4 kiểm thử).
Chờ người dùng kiểm chứng trên trình duyệt: hẹn giờ 25 phút chạy đúng, tiêu đề tab đếm
ngược, phiên đủ 15 phút cộng XP, nghỉ 5 phút không cộng XP.

Tách tính năng: Mochi Pet (`src/features/mochi-pet.js`).
Logic đã tách: giảm chỉ số theo giờ (`decayedStats`), thời gian chờ vuốt ve 10 phút
(`cooldownLeft`), và trạng thái sau một hành động (`afterAction`, trả null nếu không đủ XP).
Giao diện, hiệu ứng và tiệm đồ vẫn nằm trong legacy. Kiểm thử: `node test/mochi-pet.test.mjs`
(8 kiểm thử). Chờ người dùng kiểm chứng trên trình duyệt: no bụng và tâm trạng giảm theo
thời gian, cho ăn/đi dạo/liếm lông trừ đúng XP, vuốt ve bị khóa 10 phút rồi mở lại.

Còn để sau: đăng ký bị chặn (cấu hình project, không phải lỗi code).

Cách nối (giai đoạn 2): `src/app/App.jsx` import các module trong `src/features/` và gắn lên
`window.meobooksFeatures` trước khi tạo iframe. Legacy là script thuần nên đọc qua biến `meoFeat`
(lấy từ `window.parent.meobooksFeatures`), không import trực tiếp được.

Đợt 1 (giai đoạn 2, đang làm): đã tách `src/features/youtube-text.js` (khối YTL: link YouTube,
ruby, tách câu, token hóa) và `src/features/bantu.js` (`btProg`, tiến độ ôn từ). Kiểm thử:
`test/youtube-text.test.mjs`, `test/bantu.test.mjs`. Chưa tách: NoiTu (logic chọn lô và
đã-dùng nằm trong thân component), BookViewer và PageRead (logic chia trang nằm lẫn với JSX).
Hai phần này sẽ làm ở đợt tiếp theo.
