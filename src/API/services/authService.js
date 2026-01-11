// src/api/services/userService.js
import axiosClient from "../axiosClient";
import { ENDPOINTS } from "../endpoints";

const userService = {
  login: (params) => axiosClient.post(ENDPOINTS.AUTH.LOGIN, params)
};

export default userService;
