// Quyết định đồng bộ tài khoản (tách từ legacy) để kiểm thử: chọn cách xử lý khi tải và điều kiện được phép lưu. Hàm thuần.

// Khi tải xong dữ liệu từ máy chủ:
// - có dòng trên máy chủ và có bản trên máy -> 'merge' (hợp nhất, không mất dữ liệu nào)
// - có dòng trên máy chủ, không có bản trên máy -> 'apply_cloud' (áp dụng dữ liệu máy chủ)
// - không có dòng trên máy chủ -> 'insert_new' (chỉ tạo dòng mới bằng insert, không ghi đè)
export const cloudLoadPlan = ({ hasLocal = false, cloudRow = null } = {}) => {
  if (cloudRow) return hasLocal ? 'merge' : 'apply_cloud';
  return 'insert_new';
};

// Có được ghi toàn bộ dòng lên máy chủ không.
// Thứ tự kiểm tra giữ nguyên như legacy: offline -> không có Supabase/bản xem trước -> chưa tải xong dữ liệu.
// Trả về { upsert: true } nếu được phép; ngược lại trả về trạng thái hiển thị và thông báo (nếu có).
export const saveGate = ({ online = true, hasSupabase = true, isPreview = false, cloudLoaded = false } = {}) => {
  if (!online) return { upsert: false, status: 'offline' };
  if (!hasSupabase || isPreview) return { upsert: false, status: 'saved' };
  if (!cloudLoaded) return { upsert: false, status: 'error', message: 'Chưa tải xong dữ liệu tài khoản, chưa lưu lên máy chủ.' };
  return { upsert: true };
};

// Đổi dấu thời gian về số ms. Chấp nhận cả ISO ("...T...Z") và dạng Postgres ("... +00").
export const parseStamp = (v) => {
  if (!v) return 0;
  const iso = String(v).trim().replace(' ', 'T').replace(/\+00(:?00)?$/, 'Z');
  const n = Date.parse(iso);
  return isNaN(n) ? 0 : n;
};

// Trước khi ghi: nếu máy chủ có dòng với updated_at mới hơn mốc đã biết (lần tải/lưu gần nhất) thì phải hợp nhất trước.
// baseline rỗng (chưa biết mốc) mà máy chủ đã có dữ liệu thì cũng coi là cần hợp nhất, cho an toàn.
export const shouldMergeBeforeWrite = ({ baseline = null, remoteUpdatedAt = null } = {}) => {
  if (!remoteUpdatedAt) return false;
  return parseStamp(remoteUpdatedAt) > parseStamp(baseline);
};

// Realtime: có áp dụng dòng vừa nhận từ máy chủ vào màn hình không.
// - Chỉ áp khi không còn thay đổi chưa lưu (status 'saved'). Nếu đang có thay đổi chưa lưu thì bỏ qua,
//   lần lưu kế tiếp sẽ hợp nhất với dòng này trước khi ghi.
// - Chỉ áp khi dòng mới hơn mốc đã biết. Sự kiện đến muộn (cũ hơn hoặc bằng mốc) không được ghi đè dữ liệu mới hơn.
export const shouldApplyRealtime = ({ status = 'saved', remoteUpdatedAt = null, baseline = null } = {}) => {
  if (status !== 'saved' || !remoteUpdatedAt) return false;
  return parseStamp(remoteUpdatedAt) > parseStamp(baseline);
};
