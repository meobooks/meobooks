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
