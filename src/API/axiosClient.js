import axios from "axios";
import { isTokenExpired, logoutAndRedirect } from "../utils/authUtils";
import { formatFriendlyErrorMessage } from "../utils/errorHandler";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Thêm interceptor để tự động gắn token & kiểm tra hết hạn
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      if (isTokenExpired(token)) {
        console.warn("Token expired! Logging out...");
        logoutAndRedirect("expired");
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Xử lý response & lỗi tập trung (chuyển đổi lỗi kỹ thuật thành thông điệp thân thiện)
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu API trả về HTTP 200 nhưng payload là lỗi logic
    if (response.data && (response.data.status === "error" || response.data.success === false)) {
      const rawMsg = response.data.message || response.data.error || response.data.msg || "Thao tác không thành công";
      const friendlyMsg = formatFriendlyErrorMessage(rawMsg);
      const customError = new Error(friendlyMsg);
      customError.response = response;
      customError.data = response.data;
      customError.status = response.status;
      return Promise.reject(customError);
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const rawData = error.response?.data;
    const rawMsg = rawData?.message || rawData?.error || rawData?.msg || (typeof rawData === "string" ? rawData : null);
    const url = String(error.config?.url || "");

    const isLoginEndpoint = url.includes("/login") || url.includes("/loginUser") || url.includes("/auth/");
    if (!isLoginEndpoint && (status === 401 || (status === 403 && rawMsg && (String(rawMsg).toLowerCase().includes("token") || String(rawMsg).toLowerCase().includes("hết hạn"))))) {
      console.warn(`Unauthorized/Expired Token (${status})! Redirecting to login...`);
      logoutAndRedirect("expired");
    }

    // Trích xuất và chuyển đổi nội dung lỗi sang câu tiếng Việt thân thiện
    let message = rawMsg ? formatFriendlyErrorMessage(rawMsg) : "";
    if (!message) {
      if (status === 400) message = "Dữ liệu gửi lên không hợp lệ hoặc thiếu thông tin.";
      else if (status === 401) message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      else if (status === 403) message = "Bạn không có quyền thực hiện thao tác này.";
      else if (status === 404) message = "Không tìm thấy dữ liệu yêu cầu trên hệ thống.";
      else if (status === 500) message = "Hệ thống đang gặp sự cố xử lý. Vui lòng thử lại sau giây lát.";
      else if (error.message === "Network Error" || !error.response) message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.";
      else message = formatFriendlyErrorMessage(error.message);
    }

    const customError = new Error(message);
    customError.status = status;
    customError.response = error.response;
    customError.data = rawData;
    customError.rawError = error;

    return Promise.reject(customError);
  }
);

export default axiosClient;

