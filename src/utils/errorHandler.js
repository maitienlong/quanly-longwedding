import { toast } from "sonner";

/**
 * Chuyển đổi các thông báo lỗi kỹ thuật (tiếng Anh, stacktrace, database/runtime error)
 * thành thông báo tiếng Việt rõ ràng, thân thiện và dễ hiểu với người dùng.
 * @param {string} rawMsg
 * @returns {string} Thông báo tiếng Việt thân thiện
 */
export function formatFriendlyErrorMessage(rawMsg = "") {
  if (!rawMsg) return "Đã có lỗi xảy ra. Vui lòng thử lại!";
  const str = String(rawMsg).trim();

  // 1. Lỗi trùng lặp dữ liệu (MongoDB E11000 duplicate key)
  if (str.includes("E11000") || str.toLowerCase().includes("duplicate key")) {
    if (str.includes("maHopDong")) return "Mã hợp đồng này đã tồn tại trên hệ thống. Vui lòng chọn mã khác.";
    if (str.includes("username")) return "Tên tài khoản này đã được sử dụng. Vui lòng chọn tên tài khoản khác.";
    if (str.includes("maDichVu")) return "Mã dịch vụ này đã tồn tại. Vui lòng chọn mã khác.";
    if (str.includes("soDienThoai")) return "Số điện thoại này đã được đăng ký cho khách hàng khác.";
    return "Dữ liệu bị trùng lặp với thông tin đã có trên hệ thống. Vui lòng kiểm tra lại.";
  }

  // 2. Lỗi biến chưa định nghĩa / code runtime
  if (str.includes("is not defined") || str.includes("Cannot read propert") || str.includes("TypeError") || str.includes("ReferenceError")) {
    return "Hệ thống gặp sự cố xử lý dữ liệu. Vui lòng kiểm tra lại thông tin hoặc thử lại sau.";
  }

  // 3. Lỗi xác thực token / JWT
  if (str.toLowerCase().includes("jwt expired") || str.toLowerCase().includes("token expired") || str.includes("hết hạn")) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
  }
  if (str.toLowerCase().includes("jwt malformed") || str.toLowerCase().includes("invalid token")) {
    return "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại.";
  }

  // 4. Lỗi định dạng dữ liệu (Mongoose CastError / Validation)
  if (str.includes("Cast to ObjectId failed") || str.includes("CastError")) {
    return "Dữ liệu định danh không hợp lệ hoặc bản ghi không còn tồn tại.";
  }
  if (str.includes("Validation failed")) {
    return "Dữ liệu nhập vào chưa đúng định dạng yêu cầu. Vui lòng kiểm tra lại các trường thông tin.";
  }

  // 5. Lỗi kết nối mạng
  if (str === "Network Error" || str.includes("ECONNREFUSED") || str.includes("ETIMEDOUT") || str.includes("Failed to fetch")) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng của bạn.";
  }

  // 6. Lỗi ảnh base64
  if (str.toLowerCase().includes("invalid base64")) {
    return "Định dạng file hình ảnh không hợp lệ. Vui lòng chọn ảnh định dạng PNG, JPG hoặc WEBP.";
  }

  // 7. Lỗi Axios generic status codes
  if (str.startsWith("Request failed with status code")) {
    if (str.includes("400")) return "Thông tin gửi lên không hợp lệ hoặc thiếu dữ liệu bắt buộc.";
    if (str.includes("401")) return "Bạn chưa đăng nhập hoặc phiên làm việc đã kết thúc.";
    if (str.includes("403")) return "Bạn không có quyền thực hiện hành động này.";
    if (str.includes("404")) return "Không tìm thấy dữ liệu yêu cầu trên hệ thống.";
    if (str.includes("500")) return "Máy chủ gặp sự cố xử lý nội bộ. Vui lòng thử lại sau giây lát.";
  }

  // Nếu thông báo đã là câu tiếng Việt đầy đủ, trả về nguyên bản
  return str;
}

/**
 * Trích xuất nội dung thông báo lỗi chính xác và chi tiết nhất từ API response hoặc Error object
 * @param {any} err - Error object, AxiosError, response data hoặc chuỗi lỗi
 * @param {string} [defaultMsg="Đã có lỗi xảy ra!"] - Thông báo mặc định nếu không trích xuất được
 * @returns {string} Thông báo lỗi thân thiện với người dùng
 */
export function getErrorMessage(err, defaultMsg = "Đã có lỗi xảy ra!") {
  if (!err) return defaultMsg;
  if (typeof err === "string") return formatFriendlyErrorMessage(err);

  // 1. Kiểm tra response data từ Axios hoặc backend payload
  const resData = err.response?.data || err.data;
  if (resData) {
    if (typeof resData === "string") return formatFriendlyErrorMessage(resData);
    if (resData.message && typeof resData.message === "string") return formatFriendlyErrorMessage(resData.message);
    if (resData.error && typeof resData.error === "string") return formatFriendlyErrorMessage(resData.error);
    if (resData.msg && typeof resData.msg === "string") return formatFriendlyErrorMessage(resData.msg);
  }

  // 2. Kiểm tra message trực tiếp trên error
  if (err.message && typeof err.message === "string") {
    if (!err.message.startsWith("Request failed with status code")) {
      return formatFriendlyErrorMessage(err.message);
    }
  }

  // 3. Kiểm tra trường hợp err là plain object { status: 'error', message: '...' }
  if (err.status === "error" || err.success === false) {
    if (err.message && typeof err.message === "string") return formatFriendlyErrorMessage(err.message);
    if (err.error && typeof err.error === "string") return formatFriendlyErrorMessage(err.error);
  }

  // 4. Nếu có mã HTTP status code cụ thể
  const status = err.status || err.response?.status;
  if (status === 400) return "Dữ liệu gửi lên không hợp lệ hoặc thiếu thông tin bắt buộc.";
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu yêu cầu trên hệ thống.";
  if (status === 500) return "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.";

  if (err.message) return formatFriendlyErrorMessage(err.message);
  return defaultMsg;
}

/**
 * Hiển thị thông báo lỗi Toast với nội dung thân thiện, dễ hiểu cho người dùng
 * @param {any} err - Đối tượng lỗi
 * @param {string} [prefix=""] - Tiền tố (ví dụ: "Lỗi tạo hợp đồng")
 * @returns {string} Nội dung lỗi đã hiển thị
 */
export function showApiError(err, prefix = "") {
  const msg = getErrorMessage(err);
  const fullMsg = prefix ? `${prefix}: ${msg}` : msg;
  toast.error(fullMsg);
  return fullMsg;
}
