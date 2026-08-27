// src/api/services/userService.js
import axiosClient from "../axiosClient";
import { ENDPOINTS } from "../endpoints";

const appService = {
   LIST_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.LIST, params),
   SEARCH_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.SEARCH, params),
   CREATE_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.CREATE, params),
   UPDATE_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.UPDATE, params),
   UPDATE_PROGRESS: (params) => axiosClient.post(ENDPOINTS.HOPDONG.UPDATEPROGRESS, params),
   deleteHopDong: (params) => axiosClient.post(ENDPOINTS.HOPDONG.DELETEHOPDONG, params),
   findAllTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.FINDALLTRANGPHUC, params),
   findDichVu: (params) => axiosClient.post(ENDPOINTS.DICHVU.FIND, params),
   ServiceAddProdcut: (params) => axiosClient.post(ENDPOINTS.DICHVU.CREATE, params),
   ServiceUpdateProduct: (params) => axiosClient.post(ENDPOINTS.DICHVU.UPDATE, params),
   ServiceRemoveProduct: (params) => axiosClient.post(ENDPOINTS.DICHVU.REMOVE, params),
   findKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.FIND, params),
   createKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.CREATE, params),
   LIST_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.LIST, params),
   CREATE_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.CREATE, params),
   UPDATE_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.UPDATE, params),
   REMOVE_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.REMOVE, params),
   createUser: (params) => axiosClient.post(ENDPOINTS.AUTH.CREATE, params),
   updateUser: (params) => axiosClient.post(ENDPOINTS.AUTH.UPDATE, params),
   removeUser: (params) => axiosClient.post(ENDPOINTS.AUTH.REMOVE, params),
   findUsers: (params) => axiosClient.post(ENDPOINTS.AUTH.LIST, params),
   updateKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.UPDATE, params),
   removeKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.REMOVE, params),
   getFacebookInfo: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.GET_FACEBOOK_INFO, params),
   saveLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.SAVE, params),
   findAllLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.FIND_ALL, params),
   findByContractLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.FIND_BY_CONTRACT, params),
   removeLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.REMOVE, params),
   // ALBUM
   syncAlbum: (params) => axiosClient.post(ENDPOINTS.ALBUM.SYNC, params),
   listAlbums: (params) => axiosClient.get(ENDPOINTS.ALBUM.LIST, { params }),
   getAlbumDetail: (maHopDong) => axiosClient.get(`${ENDPOINTS.ALBUM.DETAIL}/${maHopDong}`),
   updateAlbumSettings: (maHopDong, params) => axiosClient.put(`${ENDPOINTS.ALBUM.SETTINGS}/${maHopDong}/settings`, params),
   findAllLoaiHopDong: (params) => axiosClient.post(ENDPOINTS.LOAI_HOPDONG.LIST, params),
   createLoaiHopDong: (params) => axiosClient.post(ENDPOINTS.LOAI_HOPDONG.CREATE, params),
   updateLoaiHopDong: (params) => axiosClient.post(ENDPOINTS.LOAI_HOPDONG.UPDATE, params),
   removeLoaiHopDong: (params) => axiosClient.post(ENDPOINTS.LOAI_HOPDONG.REMOVE, params),
   getThiDuaStats: (params) => axiosClient.post(ENDPOINTS.THI_DUA.STATS, params),
   getStoreTarget: (params) => axiosClient.post(ENDPOINTS.THI_DUA.STORE_TARGET, params),
   updateStoreTarget: (params) => axiosClient.post(ENDPOINTS.THI_DUA.UPDATE_STORE_TARGET, params),
   updateBatchTargets: (params) => axiosClient.post(ENDPOINTS.THI_DUA.UPDATE_TARGETS, params),
   // SEPAY
   getSepayConfig: () => axiosClient.get(ENDPOINTS.SEPAY.CONFIG),
   updateSepayConfig: (params) => axiosClient.post(ENDPOINTS.SEPAY.CONFIG, params),
   getSepayQrInfo: (maHopDong, amount, sessionCode) => axiosClient.get(`${ENDPOINTS.SEPAY.QR_INFO}/${maHopDong}?amount=${amount || 0}${sessionCode ? `&sessionCode=${sessionCode}` : ''}`),
   checkSepayStatus: (maHopDong) => axiosClient.get(`${ENDPOINTS.SEPAY.CHECK_STATUS}/${maHopDong}`),
   getSepayNotifications: (since) => axiosClient.get(`${ENDPOINTS.SEPAY.NOTIFICATIONS}${since ? `?since=${since}` : ""}`),
   // BÁO CÁO KINH DOANH
   getBaoCaoKinhDoanh: (params) => axiosClient.post(ENDPOINTS.BAO_CAO.KINH_DOANH, params),
   getBaoCaoTongQuan: (params) => axiosClient.post(ENDPOINTS.BAO_CAO.TONG_QUAN, params),
   // ĐƠN VỊ NHẬN TIỀN
   findAllDonViNhanTien: (params) => axiosClient.post(ENDPOINTS.DON_VI_NHAN_TIEN.LIST, params),
   createDonViNhanTien: (params) => axiosClient.post(ENDPOINTS.DON_VI_NHAN_TIEN.CREATE, params),
   updateDonViNhanTien: (params) => axiosClient.post(ENDPOINTS.DON_VI_NHAN_TIEN.UPDATE, params),
   removeDonViNhanTien: (params) => axiosClient.post(ENDPOINTS.DON_VI_NHAN_TIEN.REMOVE, params),
   // VOUCHER CODE
   findAllVouchers: (params) => axiosClient.post(ENDPOINTS.VOUCHER.LIST, params),
   createVoucher: (params) => axiosClient.post(ENDPOINTS.VOUCHER.CREATE, params),
   updateVoucher: (id, params) => axiosClient.put(`${ENDPOINTS.VOUCHER.UPDATE}/${id}`, params),
   removeVoucher: (id) => axiosClient.delete(`${ENDPOINTS.VOUCHER.REMOVE}/${id}`),
   toggleVoucherStatus: (id) => axiosClient.post(`${ENDPOINTS.VOUCHER.TOGGLE_STATUS}/${id}`),
   getVoucherDetail: (id) => axiosClient.get(`${ENDPOINTS.VOUCHER.DETAIL}/${id}`),
   validateVoucher: (params) => axiosClient.post(ENDPOINTS.VOUCHER.VALIDATE, params),
   generateBatchCodes: (id, params) => axiosClient.post(`${ENDPOINTS.VOUCHER.GENERATE_CODES}/${id}`, params),
   getGeneratedCodes: (id, params) => axiosClient.get(`${ENDPOINTS.VOUCHER.CODES}/${id}`, { params }),
   deleteGeneratedCode: (id, codeId) => axiosClient.delete(`${ENDPOINTS.VOUCHER.CODES}/${id}/${codeId}`)
};

export default appService;

