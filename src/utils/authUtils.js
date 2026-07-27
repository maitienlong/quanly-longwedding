/**
 * Utility functions for Auth and JWT token validation
 */

/**
 * Kiểm tra xem JWT token đã hết hạn chưa
 * @param {string} token - JWT token string
 * @returns {boolean} - true nếu token đã hết hạn hoặc không hợp lệ, false nếu còn hạn
 */
export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string") return true;
  const parts = token.split(".");
  if (parts.length !== 3) return false; // Nếu không phải định dạng JWT chuẩn 3 phần thì không tự hết hạn ở client

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
    if (!decoded.exp) return false;

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
 * @param {string} reason - Lý do đăng xuất ('expired', 'logout', ...)
 */
export const logoutAndRedirect = (reason = "expired") => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");

  if (isRedirecting) return;

  if (window.location.pathname !== "/login") {
    isRedirecting = true;
    window.location.href = `/login?reason=${reason}`;
  }
};
