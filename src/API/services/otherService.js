// src/api/services/userService.js
import axiosClient from "../axiosClient";
import { ENDPOINTS } from "../endpoints";

const appService = {
   findAllHopDong: (params) => axiosClient.post(ENDPOINTS.HOPDONG.FINDALLHOPDONG, params),
   findAllTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.FINDALLTRANGPHUC, params),
   findDichVu: (params) => axiosClient.post(ENDPOINTS.DICHVU.FIND, params),
   ServiceAddProdcut: (params) => axiosClient.post(ENDPOINTS.DICHVU.CREATE, params),
   findKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.FIND, params),

};

export default appService;
