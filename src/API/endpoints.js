// src/api/endpoints.js
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/loginUser",
    CREATE: "/auth/createUser",
    UPDATE: "/auth/updateUser",
    UPDATE_PERMISSIONS: "/auth/updateUserPermissions",
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
    SEARCH: "/hopDong/search",
    UPDATE_POST_PRODUCTION: "/hopDong/update-post-production",
    ADD_ADDON: "/hopDong/add-addon",
    UPDATE_AUDIT: "/hopDong/update-audit",
    REMINDERS: "/hopDong/reminders"
  },
  TRANGPHUC: {
    FINDALLTRANGPHUC: "/trangPhuc/find",
    LIST: "/api/trang-phuc/list",
    CREATE: "/api/trang-phuc/create",
    UPDATE: "/api/trang-phuc/update",
    REMOVE: "/api/trang-phuc/remove",
    CHECK_CONFLICT: "/api/trang-phuc/check-conflict",
    CALENDAR: "/api/trang-phuc/calendar"
  },
  LEAD: {
    LIST: "/api/leads/list",
    CREATE: "/api/leads/create",
    UPDATE: "/api/leads/update",
    CONVERT: "/api/leads/convert"
  },
  DICHVU: {
    FIND: "/dichVu/findAll",
    CREATE: "/dichVu/create",
    UPDATE: "/dichVu/update",
    REMOVE: "/dichVu/remove",
    SYNC_TEMPLATES: "/dichVu/sync-invitation-templates",
    PHOTO_SIZES_LIST: "/dichVu/photo-sizes/list",
    PHOTO_SIZES_CREATE: "/dichVu/photo-sizes/create"
  },
  KHACHHANG: {
    FIND: "/khachHang/find",
    CREATE: "/khachHang/create",
    UPDATE: "/khachHang/update",
    REMOVE: "/khachHang/remove",
    GET_FACEBOOK_INFO: "/khachHang/get-facebook-info",
    LICH_SU_THANH_TOAN: "/khachHang/lich-su-thanh-toan",
    THONG_KE: "/khachHang/thong-ke"
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
    SETTINGS: "/api/album/admin",
    PORTAL: "/api/album/portal"
  },
  LOAI_DICHVU: {
    LIST: "/loaiDichVu/findAll",
    CREATE: "/loaiDichVu/create",
    UPDATE: "/loaiDichVu/update",
    REMOVE: "/loaiDichVu/remove"
  },
  LOAI_HOPDONG: {
    LIST: "/loaiHopDong/findAll",
    CREATE: "/loaiHopDong/create",
    UPDATE: "/loaiHopDong/update",
    REMOVE: "/loaiHopDong/remove"
  },
  SEPAY: {
    WEBHOOK: "/api/sepay/webhook",
    CONFIG: "/api/sepay/config",
    QR_INFO: "/api/sepay/qr-info",
    CHECK_STATUS: "/api/sepay/check-status",
    NOTIFICATIONS: "/api/sepay/notifications"
  },
  THI_DUA: {
    STATS: "/api/thi-dua/stats",
    STORE_TARGET: "/api/thi-dua/store-target",
    UPDATE_STORE_TARGET: "/api/thi-dua/update-store-target",
    UPDATE_TARGETS: "/api/thi-dua/update-targets"
  },
  BAO_CAO: {
    KINH_DOANH: "/api/bao-cao/kinh-doanh",
    TONG_QUAN: "/api/bao-cao/tong-quan",
    LICH_SU_THANH_TOAN: "/api/bao-cao/lich-su-thanh-toan",
    THONG_KE_KHACH_HANG: "/api/bao-cao/thong-ke-khach-hang"
  },
  DON_VI_NHAN_TIEN: {
    LIST: "/donViNhanTien/findAll",
    CREATE: "/donViNhanTien/create",
    UPDATE: "/donViNhanTien/update",
    REMOVE: "/donViNhanTien/remove"
  },
  VOUCHER: {
    LIST: "/api/vouchers/list",
    CREATE: "/api/vouchers/create",
    UPDATE: "/api/vouchers/update",
    REMOVE: "/api/vouchers/remove",
    DETAIL: "/api/vouchers/detail",
    TOGGLE_STATUS: "/api/vouchers/toggle-status",
    VALIDATE: "/api/vouchers/validate",
    GENERATE_CODES: "/api/vouchers/generate-codes",
    CODES: "/api/vouchers/codes"
  }
};
