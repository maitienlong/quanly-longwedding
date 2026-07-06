// src/api/endpoints.js
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/loginUser"
  },
  HOPDONG: {
    LIST: "/hopDong/list",
    CREATE: "/hopDong/create",
    UPDATE: "/hopDong/update",
    DELETEHOPDONG: "/hopDong/delete",
    UPDATEPROGRESS: "/hopDong/update-progress",
    PAYHOPDONG: "/hopDong/pay",
    SEARCH: "/hopDong/search"
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
