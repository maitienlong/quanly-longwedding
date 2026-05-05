// src/api/endpoints.js
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/loginUser"
  },
  HOPDONG: {
    LIST: "/hopDong/list",
    CREATEHOPDONG: "/hopDong/create",
    UPDATEHOPDONG: "/hopDong/update",
    DELETEHOPDONG: "/hopDong/delete",
    PAYHOPDONG: "/hopDong/pay"
  },
  TRANGPHUC: {
    FINDALLTRANGPHUC: "/trangPhuc/find"
  },
  DICHVU: {
    FIND: "/dichVu/findAll",
    CREATE: "/dichVu/create"
  }, KHACHHANG: {
    FIND: "/khachHang/find",
    CREATE: "/khachHang/create"
  }
};
