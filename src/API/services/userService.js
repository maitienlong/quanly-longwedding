// src/api/services/userService.js
import axiosClient from "../axiosClient";
import { ENDPOINTS } from "../endpoints";

const userService = {
  getAll: (params) => axiosClient.get(ENDPOINTS.USER.LIST, { params }),
  getById: (id) => axiosClient.get(ENDPOINTS.USER.DETAIL(id)),
  create: (data) => axiosClient.post(ENDPOINTS.USER.LIST, data),
  update: (id, data) => axiosClient.put(ENDPOINTS.USER.DETAIL(id), data),
  delete: (id) => axiosClient.delete(ENDPOINTS.USER.DETAIL(id)),
};

export default userService;
