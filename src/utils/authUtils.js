/**
 * Utility functions for Auth and JWT token validation
 */

/**
 * Kiểm tra xem thiết bị đã bật tính năng ghi nhớ đăng nhập hay chưa
 * @returns {boolean}
 */
export const isRememberMeEnabled = () => {
  if (
    localStorage.getItem("lw_remember_login") === "false" ||
    localStorage.getItem("remember_me") === "false"
  ) {
    return false;
  }
  // Mặc định hỗ trợ ghi nhớ đăng nhập cho hệ thống quản trị studio
  return true;
};

/**
 * Kiểm tra xem JWT token đã hết hạn chưa
 * - Trên thiết bị cho phép ghi nhớ: Hạn token KHÔNG GIỚI HẠN (không hết hạn)
 * - Khi không ghi nhớ: Kiểm tra theo thời gian exp thực tế của JWT
 * @param {string} token - JWT token string
 * @returns {boolean} - true nếu token đã hết hạn, false nếu còn hạn hoặc không giới hạn
 */
export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;

  // Nếu người dùng bật ghi nhớ đăng nhập -> Hạn token duy trì liên tục
  if (isRememberMeEnabled()) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    // Buffer 5 giây phòng ngừa chênh lệch độ trễ mạng
    return decoded.exp < currentTime + 5;
  } catch (e) {
    console.error("Lỗi giải mã JWT token:", e);
    return false;
  }
};

let isRedirecting = false;

/**
 * Thực hiện xóa token/user thông tin và đăng xuất về màn hình login
 * @param {string} reason - Lý do đăng xuất ('expired', 'logout', 'inactivity', ...)
 */
export const logoutAndRedirect = (reason = "expired") => {
  // Nếu bật ghi nhớ đăng nhập và lý do là hết hạn/không hoạt động -> bỏ qua không tự động đăng xuất
  if (isRememberMeEnabled() && (reason === "expired" || reason === "inactivity")) {
    return;
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("last_activity_time");
  localStorage.removeItem("lw_login_time");

  // Nếu người dùng chủ động click Đăng xuất -> xóa trạng thái ghi nhớ & credentials đã lưu
  if (reason === "logout") {
    localStorage.removeItem("lw_remember_login");
    localStorage.removeItem("remember_me");
    localStorage.removeItem("lw_saved_user_credentials");
  }

  if (isRedirecting) return;

  if (!window.location.hash.includes("#/login")) {
    isRedirecting = true;
    window.location.hash = `#/login?reason=${reason}`;
    window.location.reload();
  }
};

