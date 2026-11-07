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
   updatePostProduction: (params) => axiosClient.post(ENDPOINTS.HOPDONG.UPDATE_POST_PRODUCTION, params),
   addAddonItem: (params) => axiosClient.post(ENDPOINTS.HOPDONG.ADD_ADDON, params),
   updateContractWithAudit: (params) => axiosClient.post(ENDPOINTS.HOPDONG.UPDATE_AUDIT, params),
   getReminders: (params) => axiosClient.get(ENDPOINTS.HOPDONG.REMINDERS, { params }),

   // TRANG PHỤC & VÁY CƯỚI (INVENTORY & CONFLICT GUARD)
   findAllTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.LIST, params),
   listTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.LIST, params),
   createTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.CREATE, params),
   updateTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.UPDATE, params),
   removeTrangPhuc: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.REMOVE, params),
   checkCostumeConflict: (params) => axiosClient.post(ENDPOINTS.TRANGPHUC.CHECK_CONFLICT, params),
   getCostumeCalendar: () => axiosClient.get(ENDPOINTS.TRANGPHUC.CALENDAR),

   // QUẢN LÝ LEAD (N8N / MESSENGER / WEB)
   listLeads: (params) => axiosClient.post(ENDPOINTS.LEAD.LIST, params),
   createLead: (params) => axiosClient.post(ENDPOINTS.LEAD.CREATE, params),
   updateLead: (params) => axiosClient.post(ENDPOINTS.LEAD.UPDATE, params),
   convertLeadToContract: (params) => axiosClient.post(ENDPOINTS.LEAD.CONVERT, params),

   findDichVu: (params) => axiosClient.post(ENDPOINTS.DICHVU.FIND, params),
   ServiceAddProdcut: (params) => axiosClient.post(ENDPOINTS.DICHVU.CREATE, params),
   ServiceUpdateProduct: (params) => axiosClient.post(ENDPOINTS.DICHVU.UPDATE, params),
   ServiceRemoveProduct: (params) => axiosClient.post(ENDPOINTS.DICHVU.REMOVE, params),
   syncInvitationTemplates: (params) => axiosClient.post(ENDPOINTS.DICHVU.SYNC_TEMPLATES, params),
   listPhotoSizes: () => axiosClient.post(ENDPOINTS.DICHVU.PHOTO_SIZES_LIST, {}),
   createPhotoSize: (params) => axiosClient.post(ENDPOINTS.DICHVU.PHOTO_SIZES_CREATE, params),
   findKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.FIND, params),
   createKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.CREATE, params),
   LIST_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.LIST, params),
   CREATE_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.CREATE, params),
   UPDATE_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.UPDATE, params),
   REMOVE_CHITIEU: (params) => axiosClient.post(ENDPOINTS.CHITIEU.REMOVE, params),
   createUser: (params) => axiosClient.post(ENDPOINTS.AUTH.CREATE, params),
   updateUser: (params) => axiosClient.post(ENDPOINTS.AUTH.UPDATE, params),
   updateUserPermissions: (params) => axiosClient.post(ENDPOINTS.AUTH.UPDATE_PERMISSIONS, params),
   removeUser: (params) => axiosClient.post(ENDPOINTS.AUTH.REMOVE, params),
   findUsers: (params) => axiosClient.post(ENDPOINTS.AUTH.LIST, params),
   updateKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.UPDATE, params),
   removeKhachHang: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.REMOVE, params),
   getFacebookInfo: (params) => axiosClient.post(ENDPOINTS.KHACHHANG.GET_FACEBOOK_INFO, params),
   saveLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.SAVE, params),
   findAllLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.FIND_ALL, params),
   findByContractLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.FIND_BY_CONTRACT, params),
   removeLichSoanDo: (params) => axiosClient.post(ENDPOINTS.LICH_SOAN_DO.REMOVE, params),
   // ALBUM & CLIENT PORTAL
   syncAlbum: (params) => axiosClient.post(ENDPOINTS.ALBUM.SYNC, params),
   listAlbums: (params) => axiosClient.get(ENDPOINTS.ALBUM.LIST, { params }),
   getAlbumDetail: (maHopDong) => axiosClient.get(`${ENDPOINTS.ALBUM.DETAIL}/${maHopDong}`),
   updateAlbumSettings: (maHopDong, params) => axiosClient.put(`${ENDPOINTS.ALBUM.SETTINGS}/${maHopDong}/settings`, params),
   getPortalInfo: (maHopDong, token) => axiosClient.get(`${ENDPOINTS.ALBUM.PORTAL}/${maHopDong}`, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   portalPhotoAction: (maHopDong, params, token) => axiosClient.post(`${ENDPOINTS.ALBUM.PORTAL}/${maHopDong}/photo-action`, params, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   portalCompleteSelection: (maHopDong, params, token) => axiosClient.post(`${ENDPOINTS.ALBUM.PORTAL}/${maHopDong}/complete`, params, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   generatePortalToken: (maHopDong) => axiosClient.get(`/api/album/portal-token/${maHopDong}`),
   findAllLoaiDichVu: (params) => axiosClient.post(ENDPOINTS.LOAI_DICHVU.LIST, params),
   createLoaiDichVu: (params) => axiosClient.post(ENDPOINTS.LOAI_DICHVU.CREATE, params),
   updateLoaiDichVu: (params) => axiosClient.post(ENDPOINTS.LOAI_DICHVU.UPDATE, params),
   removeLoaiDichVu: (params) => axiosClient.post(ENDPOINTS.LOAI_DICHVU.REMOVE, params),
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
   // BÁO CÁO KINH DOANH & KHÁCH HÀNG
   getBaoCaoKinhDoanh: (params) => axiosClient.post(ENDPOINTS.BAO_CAO.KINH_DOANH, params),
   getBaoCaoTongQuan: (params) => axiosClient.post(ENDPOINTS.BAO_CAO.TONG_QUAN, params),
   getLichSuThanhToan: (params) => axiosClient.post(ENDPOINTS.BAO_CAO.LICH_SU_THANH_TOAN, params),
   getThongKeKhachHang: (params) => axiosClient.post(ENDPOINTS.BAO_CAO.THONG_KE_KHACH_HANG, params),
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
   deleteGeneratedCode: (id, codeId) => axiosClient.delete(`${ENDPOINTS.VOUCHER.CODES}/${id}/${codeId}`),
   // BOOKING & RESOURCE AVAILABILITY (MOD-04, LW2-031)
   getBookingAvailability: (params) => axiosClient.get('/api/v2/bookings/availability', { params }),
   checkContractScheduleConflicts: (payload) => axiosClient.post('/api/v2/bookings/check-contract-conflicts', payload),
   listBookings: (params) => axiosClient.get('/api/v2/bookings', { params }),
   getBookingDetail: (id) => axiosClient.get(`/api/v2/bookings/${id}`),
   createBooking: (data) => axiosClient.post('/api/v2/bookings', data),
   updateBooking: (id, data) => axiosClient.patch(`/api/v2/bookings/${id}`, data),
   confirmBooking: (id, payload) => axiosClient.post(`/api/v2/bookings/${id}/confirm`, payload),
   cancelBooking: (id, payload) => axiosClient.post(`/api/v2/bookings/${id}/cancel`, payload),
   // WARDROBE RESERVATION & CHECK-IN/OUT (MOD-05, LW2-032)
   getWardrobeConflicts: (params) => axiosClient.get('/api/v2/wardrobe/conflicts', { params }),
   listWardrobeReservations: (params) => axiosClient.get('/api/v2/wardrobe/reservations', { params }),
   createWardrobeReservation: (data) => axiosClient.post('/api/v2/wardrobe/reservations', data),
   checkOutWardrobe: (id, payload) => axiosClient.post(`/api/v2/wardrobe/reservations/${id}/check-out`, payload),
   checkInWardrobe: (id, payload) => axiosClient.post(`/api/v2/wardrobe/reservations/${id}/check-in`, payload),
   cancelWardrobeReservation: (id, payload) => axiosClient.post(`/api/v2/wardrobe/reservations/${id}/cancel`, payload),
   recordWardrobeMaintenance: (itemId, payload) => axiosClient.post(`/api/v2/wardrobe/${itemId}/maintenance`, payload),
   // WORKFLOW TASKS & OUTBOX NOTIFICATIONS (MOD-09, LW2-040)
   listTasks: (params) => axiosClient.get('/api/v2/tasks', { params }),
   updateTask: (id, payload) => axiosClient.patch(`/api/v2/tasks/${id}`, payload),
   instantiateContractWorkflow: (contractId) => axiosClient.post(`/api/v2/tasks/contracts/${contractId}/workflow/instantiate`),
   listNotifications: () => axiosClient.get('/api/v2/notifications/notifications'),
   processNotificationOutbox: (payload) => axiosClient.post('/api/v2/notifications/notifications/outbox/process', payload),
   // PHOTO PROOFING, VERSIONING & RETOUCH PINS (MOD-06, LW2-041)
   addRetouchPin: (albumIdOrMaHopDong, payload, token) => axiosClient.post(`/api/v2/albums/${albumIdOrMaHopDong}/retouch-notes`, payload, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   approveAlbumReview: (albumIdOrMaHopDong, payload, token) => axiosClient.post(`/api/v2/albums/${albumIdOrMaHopDong}/approve`, payload, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   uploadAlbumReviewVersion: (albumIdOrMaHopDong, payload) => axiosClient.post(`/api/v2/albums/${albumIdOrMaHopDong}/versions`, payload),
   getAlbumReviewVersions: (albumIdOrMaHopDong, token) => axiosClient.get(`/api/v2/albums/${albumIdOrMaHopDong}/versions`, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   updatePhotoSelections: (albumIdOrMaHopDong, payload, token) => axiosClient.put(`/api/v2/albums/${albumIdOrMaHopDong}/selections`, payload, {
       headers: token ? { 'x-portal-token': token } : {}
   }),
   // PRINT DELIVERABLES, FACTORY TRACKING & QC (MOD-07, LW2-050)
   listPrintDeliverables: (params) => axiosClient.get('/api/v2/print-deliverables', { params }),
   getPrintDeliverableDetail: (id) => axiosClient.get(`/api/v2/print-deliverables/${id}`),
   createPrintDeliverable: (payload) => axiosClient.post('/api/v2/print-deliverables', payload),
   updatePrintDeliverable: (id, payload) => axiosClient.put(`/api/v2/print-deliverables/${id}`, payload),
   sendDeliverableToFactory: (id, payload) => axiosClient.post(`/api/v2/print-deliverables/${id}/send-to-factory`, payload),
   receiveDeliverableFromFactory: (id, payload) => axiosClient.post(`/api/v2/print-deliverables/${id}/receive`, payload),
   inspectDeliverableQC: (id, payload) => axiosClient.post(`/api/v2/print-deliverables/${id}/qc-inspect`, payload),
   overrideDeliverableQC: (id, payload) => axiosClient.post(`/api/v2/print-deliverables/${id}/qc-override`, payload),
   handoverDeliverableToClient: (id, payload) => axiosClient.post(`/api/v2/print-deliverables/${id}/handover`, payload),
   syncContractDeliverables: (contractId) => axiosClient.post(`/api/v2/print-deliverables/contracts/${contractId}/sync`),
   // DOUBLE-ENTRY FINANCIAL LEDGER & RECONCILIATION (MOD-08, T-LEDGER01, T-REPORT01)
   listFinancialLedger: (params) => axiosClient.get('/api/v2/finance/ledger', { params }),
   getContractFinancialLedger: (maHopDong) => axiosClient.get(`/api/v2/finance/ledger/contract/${maHopDong}`),
   runFinancialReconciliation: (payload) => axiosClient.post('/api/v2/finance/reconcile', payload),
   listReconciliationRuns: (params) => axiosClient.get('/api/v2/finance/reconciliation-runs', { params }),
   getReconciliationRunDetail: (id) => axiosClient.get(`/api/v2/finance/reconciliation-runs/${id}`),
   getUnifiedFinancialSummary: (params) => axiosClient.get('/api/v2/finance/unified-summary', { params })
};

export default appService;
