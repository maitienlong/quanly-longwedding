import axios from "axios";
import { isTokenExpired, logoutAndRedirect, isRememberMeEnabled } from "../utils/authUtils";
import { formatFriendlyErrorMessage } from "../utils/errorHandler";
import { getDeviceCredentials } from "../utils/pinAuthUtils";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ✅ Thêm interceptor để tự động gắn token & kiểm tra hết hạn
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      if (isTokenExpired(token)) {
        console.warn("Token expired! Logging out...");
        logoutAndRedirect("expired");
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn (giới hạn 1 ngày). Vui lòng đăng nhập lại."));
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
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const rawData = error.response?.data;
    const rawMsg = rawData?.message || rawData?.error || rawData?.msg || (typeof rawData === "string" ? rawData : null);
    const url = String(originalRequest?.url || "");

    const isLoginEndpoint = url.includes("/login") || url.includes("/loginUser") || url.includes("/auth/");
    const isTokenError = status === 401 || (status === 403 && rawMsg && (String(rawMsg).toLowerCase().includes("token") || String(rawMsg).toLowerCase().includes("hết hạn")));

    if (!isLoginEndpoint && isTokenError) {
      // Nếu thiết bị được cho phép ghi nhớ, tự động gia hạn token ngầm qua /auth/refreshToken (không cần lưu password)
      const currentToken = localStorage.getItem("access_token");
      if (isRememberMeEnabled() && currentToken && originalRequest && !originalRequest._retry) {
        const credentials = getDeviceCredentials();
        if (credentials && credentials.username) {
          if (!isRefreshing) {
            isRefreshing = true;
            originalRequest._retry = true;

            try {
              const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/refreshToken`, {
                token: currentToken,
              });

              const newToken = res.data?.data?.token || res.data?.token;
              if (newToken) {
                localStorage.setItem("access_token", newToken);
                isRefreshing = false;
                onRefreshed(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
              }
            } catch (refreshErr) {
              isRefreshing = false;
              console.warn("Tự động gia hạn phiên ngầm thất bại:", refreshErr);
            }
          } else {
            return new Promise((resolve) => {
              subscribeTokenRefresh((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(axiosClient(originalRequest));
              });
            });
          }
        }
      }

      console.warn(`Phiên đăng nhập hết hạn (${status})! Đang chuyển về màn hình đăng nhập...`);
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
