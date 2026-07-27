// src/api/axiosClient.js
import axios from "axios";
import { isTokenExpired, logoutAndRedirect } from "../utils/authUtils";

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
        return Promise.reject(new Error("Token expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Xử lý response & lỗi 401, 403 tập trung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      console.warn(`Unauthorized/Forbidden (${status})! Redirecting to login...`);
      logoutAndRedirect("expired");
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;

