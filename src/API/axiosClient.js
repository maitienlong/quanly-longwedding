// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Thêm interceptor để tự động gắn token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Xử lý response & lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý logout, refresh token...
      console.warn("Unauthorized! Redirecting to login...");
      // window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
