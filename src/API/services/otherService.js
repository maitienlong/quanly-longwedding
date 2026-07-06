// src/api/services/userService.js
import axiosClient from "../axiosClient";
import { ENDPOINTS } from "../endpoints";

const appService = {
   LIST_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.LIST, params),
   CREATE_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.CREATE, params),
   UPDATE_HOPDONG: (params) => axiosClient.post(ENDPOINTS.HOPDONG.UPDATE, params),
   findAllTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.FINDALLTRANGPHUC, params),
   findDichVu: (params) => axiosClient.post(ENDPOINTS.DICHVU.FIND, params),
   ServiceAddProdcut: (params) => axiosClient.post(ENDPOINTS.DICHVU.CREATE, params),
   findKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.FIND, params),
   createKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.CREATE, params),

};

export default appService;
