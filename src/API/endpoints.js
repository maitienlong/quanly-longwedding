// src/api/endpoints.js
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/loginUser",
    CREATE: "/auth/createUser",
    UPDATE: "/auth/updateUser",
    REMOVE: "/auth/removeUser",
    LIST: "/auth/findUsers"
  },
  HOPDONG: {
    LIST: "/hopDong/list",
    CREATE: "/hopDong/create",
    UPDATE: "/hopDong/update",
    DELETEHOPDONG: "/hopDong/remove",
    UPDATEPROGRESS: "/hopDong/update-progress",
    PAYHOPDONG: "/hopDong/pay",
    SEARCH: "/hopDong/search"
  },
  TRANGPHUC: {
    FINDALLTRANGPHUC: "/trangPhuc/find"
  },
  DICHVU: {
    FIND: "/dichVu/findAll",
    CREATE: "/dichVu/create",
    UPDATE: "/dichVu/update",
    REMOVE: "/dichVu/remove"
  }, KHACHHANG: {
    FIND: "/khachHang/find",
    CREATE: "/khachHang/create",
    UPDATE: "/khachHang/update",
    REMOVE: "/khachHang/remove",
    GET_FACEBOOK_INFO: "/khachHang/get-facebook-info"
  },
  CHITIEU: {
    CREATE: "/chiTieu/create",
    UPDATE: "/chiTieu/update",
    REMOVE: "/chiTieu/remove",
    LIST: "/chiTieu/findAll"
  },
  LICH_SOAN_DO: {
    SAVE: "/lichSoanDo/save",
    FIND_ALL: "/lichSoanDo/findAll",
    FIND_BY_CONTRACT: "/lichSoanDo/findByContract",
    REMOVE: "/lichSoanDo/remove"
  },
  ALBUM: {
    SYNC: "/api/album/sync",
    LIST: "/api/album/admin/list",
    DETAIL: "/api/album/admin",
    SETTINGS: "/api/album/admin"
  },
  LOAI_HOPDONG: {
    LIST: "/loaiHopDong/findAll",
    CREATE: "/loaiHopDong/create",
    UPDATE: "/loaiHopDong/update",
    REMOVE: "/loaiHopDong/remove"
  },
  THI_DUA: {
    STATS: "/api/thi-dua/stats",
    UPDATE_TARGETS: "/api/thi-dua/update-targets"
  }
};
