import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { useAuth } from '../Login/AuthContext/AuthContext';
import { useContractTypes } from '../../hooks/useContractTypes';
import { formatLunarDateShort, formatLunarDateFull } from '../../utils/lunarDateUtils';
import DetailHopDongKhachHangDialog from '../HopDong/DetailHopDongKhachHangDialog';
import { extractContractMakeupSchedules } from '../../utils/makeupHelper';
import './tongquan.css';

// Currency & Date Formatters
const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
};

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatTimeDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function TongQuan() {
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();
    const { getDichVuChinhLabel } = useContractTypes();

    // Raw Data State
    const [hopDongs, setHopDongs] = useState([]);
    const [chiTieus, setChiTieus] = useState([]);
    const [lichSoanDos, setLichSoanDos] = useState([]);

    // Filters for 7-day schedule
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'chup' | 'photoshop' | 'soando' | 'cuoihoi'
    const [selectedDayOffset, setSelectedDayOffset] = useState('all'); // 'all' | 0, 1, 2, ... 6
    const [scheduleKeyword, setScheduleKeyword] = useState('');

    // Filter for Overdue table
    const [overdueType, setOverdueType] = useState('all'); // 'all' | 'chup' | 'photoshop'

    // Modal Contract Detail Dialog
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [reminders, setReminders] = useState(null);
    const [unifiedSummary, setUnifiedSummary] = useState(null);

    // Fetch all required data
    const loadAllData = useCallback((showSpinner = true) => {
        if (showSpinner) showLoading("Đang tải dữ liệu tổng quan...");
        Promise.allSettled([
            otherService.LIST_HOPDONG({}),
            otherService.LIST_CHITIEU({}),
            otherService.findAllLichSoanDo({}),
            otherService.getReminders({}),
            otherService.getUnifiedFinancialSummary ? otherService.getUnifiedFinancialSummary({ periodType: 'month' }) : Promise.resolve(null)
        ])
        .then(([resHD, resCT, resSD, resRem, resUnified]) => {
            if (resHD.status === 'fulfilled' && resHD.value?.data?.hopDong) {
                setHopDongs(resHD.value.data.hopDong);
            }
            if (resCT.status === 'fulfilled' && resCT.value?.data?.chiTieu) {
                setChiTieus(resCT.value.data.chiTieu);
            }
            if (resSD.status === 'fulfilled' && resSD.value?.data?.lichSoanDo) {
                setLichSoanDos(resSD.value.data.lichSoanDo);
            }
            if (resRem.status === 'fulfilled' && resRem.value?.data?.data) {
                setReminders(resRem.value.data.data);
            }
            if (resUnified?.status === 'fulfilled' && resUnified.value?.data?.data) {
                setUnifiedSummary(resUnified.value.data.data);
            }
        })
        .catch(err => {
            console.error("Lỗi tải dữ liệu tổng quan:", err);
            toast.error("Không thể tải toàn bộ dữ liệu: " + err.message);
        })
        .finally(() => {
            if (showSpinner) hideLoading();
        });
    }, [showLoading, hideLoading]);

    useEffect(() => {
        loadAllData(true);
    }, [loadAllData]);

    const handleOpenContractDetail = (hd) => {
        if (!hd) return;
        const fullHD = hopDongs.find(item => item._id === hd._id || item.maHopDong === hd.maHopDong) || hd;
        setSelectedContract(fullHD);
        setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = (hasUpdated) => {
        setOpenDetailDialog(false);
        if (hasUpdated === true) {
            loadAllData(false);
        }
    };

    // =========================================================================
    // 1. CHỈ SỐ THÁNG NÀY (Hợp đồng phát sinh, Thực thu, Chi tiêu, Dòng tiền)
    // =========================================================================
    const monthlyStats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // a) Hợp đồng phát sinh trong tháng
        const newContractsInMonth = hopDongs.filter(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return false;
            const dateStr = hd.ngayHopDong || hd.createdAt;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d >= startOfMonth && d <= endOfMonth;
        });

        const countNewContracts = newContractsInMonth.length;
        const totalValueNewContracts = newContractsInMonth.reduce((sum, hd) => {
            const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
            return sum + val;
        }, 0);

        // b) Tổng tiền khách thanh toán trong tháng này (Thực thu)
        let totalPaidInMonth = 0;
        let countPaymentTransactions = 0;

        hopDongs.forEach(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return;
            const payments = hd.thanhToan?.cacLuotThanhToan;
            if (Array.isArray(payments) && payments.length > 0) {
                payments.forEach(p => {
                    if (p.date) {
                        const d = new Date(p.date);
                        if (d >= startOfMonth && d <= endOfMonth) {
                            totalPaidInMonth += Number(p.amount) || 0;
                            countPaymentTransactions++;
                        }
                    }
                });
            } else {
                const dateStr = hd.ngayHopDong || hd.createdAt;
                if (dateStr) {
                    const d = new Date(dateStr);
                    if (d >= startOfMonth && d <= endOfMonth) {
                        const paid = Number(hd.thanhToan?.khachHangDaThanhToan) || 0;
                        if (paid > 0) {
                            totalPaidInMonth += paid;
                            countPaymentTransactions++;
                        }
                    }
                }
            }
        });

        // c) Tổng tiền chi tiêu trong tháng này
        let totalExpensesInMonth = 0;
        let countExpenses = 0;
        chiTieus.forEach(ct => {
            const dateStr = ct.date || ct.createdAt;
            if (dateStr) {
                const d = new Date(dateStr);
                if (d >= startOfMonth && d <= endOfMonth) {
                    totalExpensesInMonth += Number(ct.amount) || 0;
                    countExpenses++;
                }
            }
        });

        // d) Dòng tiền ròng (Thực thu - Chi tiêu)
        const netCashflow = totalPaidInMonth - totalExpensesInMonth;

        if (unifiedSummary) {
            return {
                monthLabel: `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`,
                countNewContracts: unifiedSummary.soLuongHopDong ?? countNewContracts,
                totalValueNewContracts: unifiedSummary.tongTienHopDong ?? totalValueNewContracts,
                newContractsInMonth,
                totalPaidInMonth: unifiedSummary.soTienDaThuTrongKy ?? unifiedSummary.soTienDaThu ?? totalPaidInMonth,
                countPaymentTransactions,
                totalExpensesInMonth: unifiedSummary.tongTienKhoanChi ?? totalExpensesInMonth,
                countExpenses,
                netCashflow: (unifiedSummary.soTienDaThuTrongKy ?? unifiedSummary.soTienDaThu ?? totalPaidInMonth) - (unifiedSummary.tongTienKhoanChi ?? totalExpensesInMonth)
            };
        }

        return {
            monthLabel: `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`,
            countNewContracts,
            totalValueNewContracts,
            newContractsInMonth,
            totalPaidInMonth,
            countPaymentTransactions,
            totalExpensesInMonth,
            countExpenses,
            netCashflow
        };
    }, [hopDongs, chiTieus, unifiedSummary]);

    // =========================================================================
    // 2. BẢNG TỔNG HỢP HỢP ĐỒNG TRỄ LỊCH (Chụp & Photoshop)
    // =========================================================================
    const overdueContracts = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const list = [];

        hopDongs.forEach(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return;
            const giaiDoan = Number(hd.giaiDoan) || 1;

            // 1. Trễ lịch chụp (Ngày chụp < Hôm nay & chưa xong chụp)
            const isChupDone = giaiDoan > 1 || (giaiDoan === 1 && hd.subGiaiDoan === 'hoan_thanh');
            if (hd.cacNgay?.ngayChup && !isChupDone) {
                const dateChup = new Date(hd.cacNgay.ngayChup);
                if (!isNaN(dateChup.getTime()) && dateChup.getTime() < today.getTime()) {
                    const diffDays = Math.max(1, Math.floor((today.getTime() - dateChup.getTime()) / (1000 * 60 * 60 * 24)));
                    list.push({
                        id: `overdue-chup-${hd._id}`,
                        type: 'chup',
                        typeLabel: 'Trễ Chụp',
                        badgeClass: 'tag-chup-white',
                        contract: hd,
                        maHopDong: hd.maHopDong,
                        clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                        clientPhone: hd.khachHang1?.soDienThoai || '',
                        targetDate: dateChup,
                        daysOverdue: diffDays,
                        assignedStaff: hd.nguoiPhucVu?.thoChupHinh || 'Chưa phân công',
                        stageLabel: 'Đang chụp'
                    });
                }
            }

            // 2. Trễ lịch photoshop (Ngày hẹn chỉnh ảnh / Trả ảnh < Hôm nay & chưa xong hậu kỳ)
            const isHauKyDone = giaiDoan > 2 || (giaiDoan === 2 && hd.subGiaiDoan === 'hoan_thanh');
            const datePhotoshopStr = hd.cacNgay?.ngayChinhAnh || hd.cacNgay?.ngayTraAnh;
            if (datePhotoshopStr && !isHauKyDone) {
                const datePhotoshop = new Date(datePhotoshopStr);
                if (!isNaN(datePhotoshop.getTime()) && datePhotoshop.getTime() < today.getTime()) {
                    const diffDays = Math.max(1, Math.floor((today.getTime() - datePhotoshop.getTime()) / (1000 * 60 * 60 * 24)));
                    list.push({
                        id: `overdue-photo-${hd._id}`,
                        type: 'photoshop',
                        typeLabel: 'Trễ PTS',
                        badgeClass: 'tag-photoshop-white',
                        contract: hd,
                        maHopDong: hd.maHopDong,
                        clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                        clientPhone: hd.khachHang1?.soDienThoai || '',
                        targetDate: datePhotoshop,
                        daysOverdue: diffDays,
                        assignedStaff: hd.nguoiPhucVu?.thoChinhAnh || 'Chưa phân công',
                        stageLabel: 'Đang hậu kỳ'
                    });
                }
            }
        });

        list.sort((a, b) => b.daysOverdue - a.daysOverdue);

        const countChup = list.filter(item => item.type === 'chup').length;
        const countPhoto = list.filter(item => item.type === 'photoshop').length;

        return {
            all: list,
            countChup,
            countPhoto,
            filtered: list.filter(item => {
                if (overdueType === 'chup') return item.type === 'chup';
                if (overdueType === 'photoshop') return item.type === 'photoshop';
                return true;
            })
        };
    }, [hopDongs, overdueType]);

    // =========================================================================
    // 3. TỔNG HỢP LỊCH 7 NGÀY TỚI (Lịch chụp, Photoshop, Soạn đồ, Cưới/Hỏi)
    // =========================================================================
    const sevenDaysData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysList = [];
        const DAY_NAMES = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const isTomorrow = i === 1;
            const isToday = i === 0;

            daysList.push({
                offset: i,
                date: d,
                dateStr: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
                lunarStr: formatLunarDateShort(d),
                lunarFullStr: formatLunarDateFull(d),
                dayName: isToday ? 'Hôm nay' : isTomorrow ? 'Ngày mai' : DAY_NAMES[d.getDay()],
                isToday,
                isTomorrow,
                eventsCount: 0
            });
        }

        const windowStart = today.getTime();
        const windowEnd = new Date(today);
        windowEnd.setDate(today.getDate() + 6);
        windowEnd.setHours(23, 59, 59, 999);
        const windowEndTime = windowEnd.getTime();

        const events = [];

        // ================= XỬ LÝ LỊCH CỦA TỪNG HỢP ĐỒNG =================
        hopDongs.forEach(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return;
            if (hd.trangThai === 'da_huy' || hd.status === 'cancelled') return;

            const giaiDoan = Number(hd.giaiDoan) || 1;
            const isStage1Done = giaiDoan > 1 || (giaiDoan === 1 && hd.subGiaiDoan === 'hoan_thanh');

            // ---------------------------------------------------------
            // 1. LỊCH CHỤP HÌNH (Photo Shoot)
            // ---------------------------------------------------------
            if (Array.isArray(hd.serviceSchedules)) {
                // Ưu tiên cao nhất: Lấy chính xác từ danh sách nhiệm vụ serviceSchedules
                const photoTasks = hd.serviceSchedules.filter(s => s.serviceType === 'photo');
                // Nếu hợp đồng có serviceSchedules nhưng photoTasks rỗng (người dùng đã xóa lịch chụp) -> Không hiển thị bất kỳ lịch chụp nào!
                photoTasks.forEach((task, pIdx) => {
                    if (!task.ngayGio) return;
                    const eventDate = new Date(task.ngayGio);
                    if (isNaN(eventDate.getTime())) return;
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        // Nếu đã qua giai đoạn chụp và ca này diễn ra trong quá khứ -> bỏ qua
                        if (isStage1Done && t < today.getTime()) return;

                        events.push({
                            id: `ev-chup-${hd._id}-${task.id || pIdx}`,
                            type: 'chup',
                            typeLabel: task.serviceName || (photoTasks.length > 1 ? `Lịch Chụp (Lượt ${task.luot || pIdx + 1})` : 'Lịch Chụp'),
                            typeIcon: 'fa-solid fa-camera',
                            badgeClass: 'tag-chup-white',
                            date: eventDate,
                            timeStr: formatTimeDisplay(task.ngayGio) || '08:00',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: task.diaDiem || hd.cacNgay?.diaDiemChup || getDichVuChinhLabel(hd.dichVuChinh) || 'Tại Studio',
                            staffInfo: [
                                { role: 'Chụp', name: task.nhanVien || (photoTasks.length === 1 ? hd.nguoiPhucVu?.thoChupHinh : '') || 'Chưa phân công', icon: 'fa-solid fa-camera' }
                            ]
                        });
                    }
                });
            } else if (Array.isArray(hd.lichChup) && hd.lichChup.length > 0) {
                // Fallback nếu có mảng lichChup riêng
                hd.lichChup.forEach((lc, lcIdx) => {
                    const dateVal = lc.ngayGio || lc.ngayChup;
                    if (!dateVal) return;
                    const eventDate = new Date(dateVal);
                    if (isNaN(eventDate.getTime())) return;
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        if (isStage1Done && t < today.getTime()) return;

                        events.push({
                            id: `ev-chup-${hd._id}-${lc.id || lcIdx}`,
                            type: 'chup',
                            typeLabel: lc.tenDichVu || 'Lịch Chụp',
                            typeIcon: 'fa-solid fa-camera',
                            badgeClass: 'tag-chup-white',
                            date: eventDate,
                            timeStr: lc.gioChup || formatTimeDisplay(dateVal) || '08:00',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: lc.diaDiem || hd.cacNgay?.diaDiemChup || 'Tại Studio',
                            staffInfo: [
                                { role: 'Chụp', name: lc.thoChupHinh || lc.nhanVien || hd.nguoiPhucVu?.thoChupHinh, icon: 'fa-solid fa-camera' }
                            ].filter(s => !!s.name)
                        });
                    }
                });
            } else if (hd.cacNgay?.ngayChup && !isStage1Done) {
                // Fallback chỉ dành cho hợp đồng cũ chưa có serviceSchedules VÀ chưa hoàn thành giai đoạn chụp
                const eventDate = new Date(hd.cacNgay.ngayChup);
                if (!isNaN(eventDate.getTime())) {
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        events.push({
                            id: `ev-chup-${hd._id}`,
                            type: 'chup',
                            typeLabel: 'Lịch Chụp',
                            typeIcon: 'fa-solid fa-camera',
                            badgeClass: 'tag-chup-white',
                            date: eventDate,
                            timeStr: hd.cacNgay?.gioChup || formatTimeDisplay(hd.cacNgay.ngayChup) || '08:00',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: hd.cacNgay?.diaDiemChup || hd.goiChup || getDichVuChinhLabel(hd.dichVuChinh) || 'Tại Studio',
                            staffInfo: [
                                { role: 'Chụp', name: hd.nguoiPhucVu?.thoChupHinh, icon: 'fa-solid fa-camera' },
                                { role: 'Make', name: hd.nguoiPhucVu?.thoMakeUp, icon: 'fa-solid fa-wand-magic-sparkles' }
                            ].filter(s => !!s.name)
                        });
                    }
                }
            }

            // ---------------------------------------------------------
            // 2. LỊCH PHOTOSHOP (Hậu kỳ)
            // ---------------------------------------------------------
            const isPtsDone = giaiDoan > 2 || (giaiDoan === 2 && hd.subGiaiDoan === 'hoan_thanh');
            const photoDateStr = hd.cacNgay?.ngayChinhAnh || hd.cacNgay?.ngayTraAnh;
            if (photoDateStr && !isPtsDone) {
                const eventDate = new Date(photoDateStr);
                if (!isNaN(eventDate.getTime())) {
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        events.push({
                            id: `ev-photo-${hd._id}`,
                            type: 'photoshop',
                            typeLabel: 'Lịch Photoshop',
                            typeIcon: 'fa-solid fa-wand-magic-sparkles',
                            badgeClass: 'tag-photoshop-white',
                            date: eventDate,
                            timeStr: formatTimeDisplay(photoDateStr) || 'Hẹn trong ngày',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: 'Hậu kỳ Studio',
                            staffInfo: [
                                { role: 'PTS', name: hd.nguoiPhucVu?.thoChinhAnh, icon: 'fa-solid fa-palette' }
                            ].filter(s => !!s.name)
                        });
                    }
                }
            }

            // ---------------------------------------------------------
            // 3. LỊCH CƯỚI & ĂN HỎI
            // ---------------------------------------------------------
            if (hd.cacNgay?.ngayAnHoi) {
                const eventDate = new Date(hd.cacNgay.ngayAnHoi);
                if (!isNaN(eventDate.getTime())) {
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        events.push({
                            id: `ev-anhoi-${hd._id}`,
                            type: 'cuoihoi',
                            typeLabel: 'Lịch Ăn Hỏi',
                            typeIcon: 'fa-solid fa-ring',
                            badgeClass: 'tag-cuoihoi-white',
                            date: eventDate,
                            timeStr: formatTimeDisplay(hd.cacNgay.ngayAnHoi) || 'Lễ hỏi',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Cặp đôi',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: hd.diaDiemCuoi || 'Tư gia',
                            staffInfo: []
                        });
                    }
                }
            }

            if (hd.cacNgay?.ngayCuoi) {
                const eventDate = new Date(hd.cacNgay.ngayCuoi);
                if (!isNaN(eventDate.getTime())) {
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        events.push({
                            id: `ev-cuoi-${hd._id}`,
                            type: 'cuoihoi',
                            typeLabel: 'Lịch Tiệc Cưới',
                            typeIcon: 'fa-solid fa-heart',
                            badgeClass: 'tag-cuoihoi-white',
                            date: eventDate,
                            timeStr: formatTimeDisplay(hd.cacNgay.ngayCuoi) || 'Tiệc cưới',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Cặp đôi',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: hd.diaDiemCuoi || 'Trung tâm tiệc cưới',
                            staffInfo: []
                        });
                    }
                }
            }

            // ---------------------------------------------------------
            // 4. LỊCH TRANG ĐIỂM (Makeup)
            // ---------------------------------------------------------
            if (Array.isArray(hd.serviceSchedules)) {
                // Ưu tiên cao nhất: Lấy từ serviceSchedules
                const makeTasks = hd.serviceSchedules.filter(s => s.serviceType === 'makeup');
                makeTasks.forEach((task, mIdx) => {
                    if (!task.ngayGio) return;
                    const eventDate = new Date(task.ngayGio);
                    if (isNaN(eventDate.getTime())) return;
                    const t = eventDate.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        events.push({
                            id: `ev-make-${hd._id}-${task.id || mIdx}`,
                            type: 'trangdiem',
                            typeLabel: task.serviceName || (makeTasks.length > 1 ? `Trang Điểm (Lượt ${task.luot || mIdx + 1})` : 'Lịch Trang Điểm'),
                            typeIcon: 'fa-solid fa-paintbrush',
                            badgeClass: 'tag-trangdiem-white',
                            date: eventDate,
                            timeStr: formatTimeDisplay(task.ngayGio) || '07:00',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: task.diaDiem || 'Tại nhà riêng / Studio',
                            staffInfo: [
                                { role: 'Make-up', name: task.nhanVien || (makeTasks.length === 1 ? hd.nguoiPhucVu?.thoMakeUp : '') || 'Chưa phân công', icon: 'fa-solid fa-wand-magic-sparkles' }
                            ],
                            note: task.ghiChu || ''
                        });
                    }
                });
            } else {
                // Hợp đồng cũ chưa có serviceSchedules: trích xuất theo contractMakeupList
                const contractMakeupList = extractContractMakeupSchedules(hd);
                contractMakeupList.forEach((mk, mIdx) => {
                    const t = mk.date.getTime();
                    if (t >= windowStart && t <= windowEndTime) {
                        events.push({
                            id: `ev-make-${hd._id}-${mk.id || mIdx}`,
                            type: 'trangdiem',
                            typeLabel: mk.tenDichVu || 'Lịch Trang Điểm',
                            typeIcon: 'fa-solid fa-paintbrush',
                            badgeClass: 'tag-trangdiem-white',
                            date: mk.date,
                            timeStr: mk.timeStr || formatTimeDisplay(mk.date) || '07:00',
                            contract: hd,
                            maHopDong: hd.maHopDong,
                            clientName: hd.khachHang1?.tenKhachHang || 'Khách hàng',
                            clientPhone: hd.khachHang1?.soDienThoai || '',
                            location: mk.diaDiem || 'Tại nhà riêng / Studio',
                            staffInfo: [
                                { role: 'Make-up', name: mk.thoMakeUp || hd.nguoiPhucVu?.thoMakeUp || 'Chưa phân công', icon: 'fa-solid fa-wand-magic-sparkles' }
                            ],
                            note: mk.ghiChu || ''
                        });
                    }
                });
            }
        });

                // Lịch Soạn Đồ
        lichSoanDos.forEach(sd => {
            const targetDateStr = sd.ngaySoan || sd.ngayMuon;
            if (targetDateStr) {
                const eventDate = new Date(targetDateStr);
                const t = eventDate.getTime();
                if (t >= windowStart && t <= windowEndTime) {
                    const matchedHD = hopDongs.find(h => h.maHopDong === sd.maHopDong || h._id === sd.hopDongId || h._id === sd.hopDongId?._id);
                    events.push({
                        id: `ev-soando-${sd._id || sd.maHopDong}`,
                        type: 'soando',
                        typeLabel: 'Lịch Soạn Đồ',
                        typeIcon: 'fa-solid fa-shirt',
                        badgeClass: 'tag-soando-white',
                        date: eventDate,
                        timeStr: formatTimeDisplay(targetDateStr) || 'Soạn trang phục',
                        contract: matchedHD || { maHopDong: sd.maHopDong },
                        maHopDong: sd.maHopDong,
                        clientName: matchedHD?.khachHang1?.tenKhachHang || sd.khachHang || 'Khách thuê đồ',
                        clientPhone: matchedHD?.khachHang1?.soDienThoai || '',
                        location: `Trạng thái: ${sd.trangThai || 'Chưa soạn'}`,
                        staffInfo: [
                            { role: 'Kiểm đồ', name: sd.nguoiKiem, icon: 'fa-solid fa-user-check' }
                        ].filter(s => !!s.name)
                    });
                }
            }
        });

        events.sort((a, b) => a.date.getTime() - b.date.getTime());

        daysList.forEach(day => {
            const dayStart = new Date(day.date).setHours(0, 0, 0, 0);
            const dayEnd = new Date(day.date).setHours(23, 59, 59, 999);
            day.eventsCount = events.filter(e => {
                const et = e.date.getTime();
                return et >= dayStart && et <= dayEnd;
            }).length;
        });

        return {
            daysList,
            allEvents: events
        };
    }, [hopDongs, lichSoanDos, getDichVuChinhLabel]);

    // Sự kiện được lọc theo tab danh mục dịch vụ đang chọn
    const categoryFilteredEvents = useMemo(() => {
        if (selectedCategory === 'all') return sevenDaysData.allEvents;
        return sevenDaysData.allEvents.filter(ev => ev.type === selectedCategory);
    }, [sevenDaysData.allEvents, selectedCategory]);

    // Số lượng lịch của từng ngày theo danh mục đang chọn
    const dayEventCounts = useMemo(() => {
        const counts = {};
        sevenDaysData.daysList.forEach(day => {
            const dayStart = new Date(day.date).setHours(0, 0, 0, 0);
            const dayEnd = new Date(day.date).setHours(23, 59, 59, 999);
            counts[day.offset] = categoryFilteredEvents.filter(e => {
                const et = e.date.getTime();
                return et >= dayStart && et <= dayEnd;
            }).length;
        });
        return counts;
    }, [sevenDaysData.daysList, categoryFilteredEvents]);

    // Filtered events for 7 days
    const filteredEvents = useMemo(() => {
        return categoryFilteredEvents.filter(ev => {
            if (selectedDayOffset !== 'all') {
                const targetDay = sevenDaysData.daysList[selectedDayOffset];
                if (targetDay) {
                    const start = new Date(targetDay.date).setHours(0, 0, 0, 0);
                    const end = new Date(targetDay.date).setHours(23, 59, 59, 999);
                    const et = ev.date.getTime();
                    if (et < start || et > end) return false;
                }
            }

            if (scheduleKeyword.trim()) {
                const kw = scheduleKeyword.toLowerCase();
                const matchCode = ev.maHopDong?.toLowerCase().includes(kw);
                const matchName = ev.clientName?.toLowerCase().includes(kw);
                const matchPhone = ev.clientPhone?.toLowerCase().includes(kw);
                const matchStaff = ev.staffInfo.some(s => s.name?.toLowerCase().includes(kw));
                return matchCode || matchName || matchPhone || matchStaff;
            }

            return true;
        });
    }, [categoryFilteredEvents, sevenDaysData.daysList, selectedDayOffset, scheduleKeyword]);

    // Helper: is Tomorrow or Today
    const getEventDayHighlight = (eventDate) => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const isTomorrow = eventDate.getDate() === tomorrow.getDate() && 
                           eventDate.getMonth() === tomorrow.getMonth() && 
                           eventDate.getFullYear() === tomorrow.getFullYear();

        const isToday = eventDate.getDate() === today.getDate() && 
                        eventDate.getMonth() === today.getMonth() && 
                        eventDate.getFullYear() === today.getFullYear();

        return { isTomorrow, isToday };
    };

    return (
        <div className="tq-container">
            {/* Top Clean Header */}
            <div className="tq-header">
                <div className="tq-title-group">
                    <div className="tq-title">
                        <span className="tq-title-icon"><i className="fa-solid fa-chart-pie"></i></span>
                        TỔNG QUAN HỆ THỐNG
                    </div>
                    <div className="tq-subtitle">
                        <span>Xin chào, <strong>{user?.fullname || user?.hoTen || 'Quản lý'}</strong></span>
                        <span>•</span>
                        <span>Báo cáo {monthlyStats.monthLabel}</span>
                    </div>
                </div>

                <div className="tq-header-actions">
                    <div className="tq-date-pill">
                        <i className="fa-regular fa-calendar-days" style={{ color: '#0284c7' }}></i>
                        <span>{formatDateDisplay(new Date())}</span>
                        <span>({formatLunarDateFull(new Date())})</span>
                    </div>

                    <button 
                        className="tq-refresh-btn" 
                        onClick={() => loadAllData(true)}
                        title="Tải lại dữ liệu"
                    >
                        <i className="fa-solid fa-rotate"></i>
                        <span>Làm mới</span>
                    </button>
                </div>
            </div>

            {/* CẢNH BÁO TỰ ĐỘNG THÔNG MINH TRƯỚC NGÀY TRỌNG ĐẠI (T-3, T-1, QUÁ HẠN) */}
            {reminders && (
                (reminders.upcomingShoots?.length > 0 || 
                 reminders.upcomingMakeups?.length > 0 || 
                 reminders.upcomingDressPickups?.length > 0 ||
                 reminders.overdueDressReturns?.length > 0 ||
                 reminders.overduePostProductions?.length > 0) && (
                    <div className="tq-reminders-banner" style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%)',
                        border: '1px solid #bfdbfe',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                                <strong style={{ fontSize: '0.95rem', color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Cảnh Báo Vận Hành & Nhắc Lịch Tự Động (T-3, T-1)
                                </strong>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hệ thống tự động rà soát từ CSDL Hợp đồng</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                            {/* 1. Váy cưới T-3 / T-1 */}
                            {reminders.upcomingDressPickups?.length > 0 && (
                                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: '1px solid #fbcfe8', borderLeft: '4px solid #ec4899' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#be185d', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>👗</span> Hẹn Lấy Váy/Đồ (3 Ngày Tới): {reminders.upcomingDressPickups.length} khách
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                                        {reminders.upcomingDressPickups.slice(0, 2).map((u, i) => (
                                            <div key={i}>• <strong>{u.tenKhachHang}</strong> ({u.maHopDong})</div>
                                        ))}
                                        {reminders.upcomingDressPickups.length > 2 && <span style={{ color: '#9333ea' }}>+{reminders.upcomingDressPickups.length - 2} khách khác...</span>}
                                    </div>
                                </div>
                            )}

                            {/* 2. Chụp ảnh ngày mai T-1 */}
                            {reminders.upcomingShoots?.length > 0 && (
                                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: '1px solid #fde68a', borderLeft: '4px solid #d97706' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>📸</span> Lịch Chụp Ngày Mai (T-1): {reminders.upcomingShoots.length} ca
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                                        {reminders.upcomingShoots.slice(0, 2).map((s, i) => (
                                            <div key={i}>• <strong>{s.tenKhachHang}</strong> ({s.gioChup || '08:00'} - Thợ: {s.thoChup || 'Chưa gán'})</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. Trang điểm ngày mai T-1 */}
                            {reminders.upcomingMakeups?.length > 0 && (
                                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: '1px solid #ddd6fe', borderLeft: '4px solid #7c3aed' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>💄</span> Makeup Tiệc/Hỏi Ngày Mai: {reminders.upcomingMakeups.length} dâu
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                                        {reminders.upcomingMakeups.slice(0, 2).map((m, i) => (
                                            <div key={i}>• <strong>{m.tenKhachHang}</strong> (Make: {m.thoMake || 'Chưa gán'})</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. Quá hạn trả đồ cưới */}
                            {reminders.overdueDressReturns?.length > 0 && (
                                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>⚠️</span> Quá Hạn Trả Đồ Studio: {reminders.overdueDressReturns.length} HĐ
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                                        {reminders.overdueDressReturns.slice(0, 2).map((o, i) => (
                                            <div key={i}>• <strong>{o.tenKhachHang}</strong> ({o.soDienThoai})</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. Hậu kỳ quá hạn trả ảnh */}
                            {reminders.overduePostProductions?.length > 0 && (
                                <div style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', border: '1px solid #fed7aa', borderLeft: '4px solid #ea580c' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>⌛</span> Hậu Kỳ Quá Hạn Trả: {reminders.overduePostProductions.length} bộ ảnh
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>
                                        {reminders.overduePostProductions.slice(0, 2).map((p, i) => (
                                            <div key={i}>• <strong>{p.tenKhachHang}</strong> ({p.maHopDong})</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}

            {/* =========================================================================
               ⭐ HÀNG 1: 3 CỘT CÂN ĐỐI NHAU (CHỈ SỐ THÁNG - LỊCH TRÌNH 7 NGÀY - HỢP ĐỒNG TRỄ HẠN) ⭐
               ========================================================================= */}
            <div className="tq-top-row-3cols">
                {/* CỘT 1: BẢNG CHỈ SỐ HOẠT ĐỘNG TRONG THÁNG */}
                <div className="tq-white-panel tq-stats-panel">
                    <div className="tq-panel-header">
                        <div className="tq-panel-title">
                            <i className="fa-solid fa-chart-simple" style={{ color: '#10b981' }}></i>
                            <span>CHỈ SỐ HOẠT ĐỘNG TRONG THÁNG</span>
                        </div>
                        <span className="tq-section-badge">{monthlyStats.monthLabel}</span>
                    </div>

                    {/* 4 Thẻ chỉ số xếp 2x2 trong cột trái */}
                    <div className="tq-stats-inner-grid">
                        {/* 1. Hợp đồng phát sinh */}
                        <div className="tq-stat-mini-card mini-contract">
                            <div className="tq-stat-mini-top">
                                <span className="tq-stat-mini-label">HĐ Phát Sinh Mới</span>
                                <div className="tq-stat-mini-icon">
                                    <i className="fa-solid fa-file-signature"></i>
                                </div>
                            </div>
                            <div className="tq-stat-mini-value">
                                {monthlyStats.countNewContracts} <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>HĐ</span>
                            </div>
                            <div className="tq-stat-mini-sub">
                                <span>Tổng giá trị HĐ:</span>
                                <strong style={{ color: '#059669' }}>{formatCurrency(monthlyStats.totalValueNewContracts)}</strong>
                            </div>
                        </div>

                        {/* 2. Tiền khách thanh toán */}
                        <div className="tq-stat-mini-card mini-revenue">
                            <div className="tq-stat-mini-top">
                                <span className="tq-stat-mini-label">Khách Thanh Toán</span>
                                <div className="tq-stat-mini-icon">
                                    <i className="fa-solid fa-hand-holding-dollar"></i>
                                </div>
                            </div>
                            <div className="tq-stat-mini-value">
                                {formatCurrency(monthlyStats.totalPaidInMonth)}
                            </div>
                            <div className="tq-stat-mini-sub">
                                <span>Số giao dịch:</span>
                                <strong>{monthlyStats.countPaymentTransactions} lượt thu</strong>
                            </div>
                        </div>

                        {/* 3. Tổng tiền chi tiêu */}
                        <div className="tq-stat-mini-card mini-expense">
                            <div className="tq-stat-mini-top">
                                <span className="tq-stat-mini-label">Chi Tiêu Xuất Quỹ</span>
                                <div className="tq-stat-mini-icon">
                                    <i className="fa-solid fa-receipt"></i>
                                </div>
                            </div>
                            <div className="tq-stat-mini-value">
                                {formatCurrency(monthlyStats.totalExpensesInMonth)}
                            </div>
                            <div className="tq-stat-mini-sub">
                                <span>Số khoản chi:</span>
                                <strong>{monthlyStats.countExpenses} phiếu</strong>
                            </div>
                        </div>

                        {/* 4. Dòng tiền ròng */}
                        <div className="tq-stat-mini-card mini-net">
                            <div className="tq-stat-mini-top">
                                <span className="tq-stat-mini-label">Dòng Tiền Ròng</span>
                                <div className="tq-stat-mini-icon">
                                    <i className="fa-solid fa-scale-balanced"></i>
                                </div>
                            </div>
                            <div className="tq-stat-mini-value" style={{ color: monthlyStats.netCashflow >= 0 ? '#059669' : '#dc2626' }}>
                                {formatCurrency(monthlyStats.netCashflow)}
                            </div>
                            <div className="tq-stat-mini-sub">
                                <span>Tình trạng quỹ:</span>
                                <strong style={{ color: monthlyStats.netCashflow >= 0 ? '#059669' : '#dc2626' }}>
                                    {monthlyStats.netCashflow >= 0 ? 'Thặng dư an toàn' : 'Cần kiểm soát'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Dòng tóm tắt thu chi phía dưới của bảng chỉ số */}
                    <div className="tq-stats-bottom-summary">
                        <span>
                            Thu: <strong style={{ color: '#0284c7' }}>{formatCurrency(monthlyStats.totalPaidInMonth)}</strong> | Chi: <strong style={{ color: '#e11d48' }}>{formatCurrency(monthlyStats.totalExpensesInMonth)}</strong>
                        </span>
                        <span>
                            Chênh lệch: <strong style={{ color: monthlyStats.netCashflow >= 0 ? '#059669' : '#dc2626' }}>{formatCurrency(monthlyStats.netCashflow)}</strong>
                        </span>
                    </div>
                </div>

                {/* CỘT 2: BẢNG LỊCH SẮP TỚI TRONG VÒNG 7 NGÀY */}
                <div className="tq-white-panel tq-schedule-panel">
                    <div className="tq-panel-header">
                        <div className="tq-panel-title">
                            <i className="fa-solid fa-calendar-days" style={{ color: '#0284c7' }}></i>
                            <span>LỊCH TRÌNH 7 NGÀY TỚI ({categoryFilteredEvents.length})</span>
                        </div>
                        <span className="tq-section-badge">
                            {selectedDayOffset === 'all' ? 'Toàn bộ 7 ngày' : sevenDaysData.daysList[selectedDayOffset]?.dayName}
                        </span>
                    </div>

                    {/* Thanh 7 ngày tới */}
                    <div className="tq-days-strip-white">
                        <div 
                            className={`tq-day-item-white ${selectedDayOffset === 'all' ? 'active' : ''} ${categoryFilteredEvents.length > 0 ? 'has-events' : ''}`}
                            onClick={() => setSelectedDayOffset('all')}
                            title="Xem toàn bộ lịch trình 7 ngày tới"
                        >
                            <span className="tq-day-title-white">Toàn bộ</span>
                            <span className="tq-day-date-white">7 Ngày</span>
                            <span className="tq-day-lunar-white" style={{ visibility: 'hidden' }}>00/00 âm</span>
                            <span className="tq-day-count-badge-white">{categoryFilteredEvents.length}</span>
                        </div>

                        {sevenDaysData.daysList.map(d => {
                            const count = dayEventCounts[d.offset] ?? d.eventsCount;
                            const hasEvents = count > 0;

                            return (
                                <div 
                                    key={d.offset}
                                    className={`tq-day-item-white ${selectedDayOffset === d.offset ? 'active' : ''} ${d.isTomorrow ? 'is-tomorrow-pill' : ''} ${hasEvents ? 'has-events' : ''}`}
                                    onClick={() => setSelectedDayOffset(d.offset)}
                                    title={`Dương lịch: ${d.dateStr} • Âm lịch: ${d.lunarFullStr}`}
                                >
                                    <span className="tq-day-title-white">
                                        {d.isTomorrow ? 'Ngày mai' : d.dayName}
                                    </span>
                                    <span className="tq-day-date-white">{d.dateStr}</span>
                                    <span className="tq-day-lunar-white">{d.lunarStr} âm</span>
                                    <span className="tq-day-count-badge-white">{count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Toolbar tab danh mục & tìm kiếm */}
                    <div className="tq-schedule-toolbar-white">
                        <div className="tq-category-tabs-white">
                            <button 
                                className={`tq-tab-btn-white ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                Tất cả
                            </button>
                            <button 
                                className={`tq-tab-btn-white ${selectedCategory === 'chup' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('chup')}
                            >
                                <i className="fa-solid fa-camera"></i>
                                Chụp
                            </button>
                            <button 
                                className={`tq-tab-btn-white ${selectedCategory === 'photoshop' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('photoshop')}
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                PTS
                            </button>
                            <button 
                                className={`tq-tab-btn-white ${selectedCategory === 'trangdiem' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('trangdiem')}
                            >
                                <i className="fa-solid fa-paintbrush"></i>
                                Trang điểm
                            </button>
                            <button 
                                className={`tq-tab-btn-white ${selectedCategory === 'soando' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('soando')}
                            >
                                <i className="fa-solid fa-shirt"></i>
                                Soạn đồ
                            </button>
                            <button 
                                className={`tq-tab-btn-white ${selectedCategory === 'cuoihoi' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('cuoihoi')}
                            >
                                <i className="fa-solid fa-heart"></i>
                                Cưới/Hỏi
                            </button>
                        </div>

                        <div className="tq-search-box-white">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text"
                                className="tq-search-input-white"
                                placeholder="Tìm khách, mã HĐ, thợ..."
                                value={scheduleKeyword}
                                onChange={(e) => setScheduleKeyword(e.target.value)}
                            />
                            {scheduleKeyword && (
                                <i 
                                    className="fa-solid fa-xmark" 
                                    style={{ cursor: 'pointer', color: '#94a3b8' }}
                                    onClick={() => setScheduleKeyword('')}
                                ></i>
                            )}
                        </div>
                    </div>

                    {/* Danh sách thẻ lịch hẹn (Ngày mai bôi màu xanh) */}
                    <div className="tq-schedule-list-white">
                        {filteredEvents.length === 0 ? (
                            <div className="tq-empty-box-white">
                                <i className="fa-regular fa-calendar-xmark"></i>
                                <span>Không có lịch nào phù hợp trong 7 ngày tới</span>
                            </div>
                        ) : (
                            filteredEvents.map(ev => {
                                const { isTomorrow, isToday } = getEventDayHighlight(ev.date);

                                return (
                                    <div 
                                        key={ev.id}
                                        className={`tq-schedule-card-white ${isTomorrow ? 'is-tomorrow' : ''}`}
                                        onClick={() => handleOpenContractDetail(ev.contract)}
                                    >
                                        <div className="tq-card-head-white">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span className={`tq-card-type-tag-white ${ev.badgeClass}`}>
                                                    <i className={ev.typeIcon}></i>
                                                    {ev.typeLabel}
                                                </span>
                                                {isTomorrow && (
                                                    <span className="tq-badge-tomorrow-white">
                                                        <i className="fa-solid fa-bell"></i>
                                                        NGÀY MAI
                                                    </span>
                                                )}
                                                {isToday && (
                                                    <span className="tq-badge-today-white">
                                                        HÔM NAY
                                                    </span>
                                                )}
                                            </div>

                                            <span className="tq-card-code-white">#{ev.maHopDong}</span>
                                        </div>

                                        <div className="tq-card-body-white">
                                            <div className="tq-card-client-white">
                                                {ev.clientName}
                                                {ev.clientPhone && (
                                                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400 }}> • {ev.clientPhone}</span>
                                                )}
                                            </div>

                                            <div className="tq-card-datetime-white">
                                                <i className="fa-regular fa-clock" style={{ color: isTomorrow ? '#0284c7' : '#eab308' }}></i>
                                                <strong>{formatDateDisplay(ev.date)}</strong>
                                                <span>{ev.timeStr}</span>
                                                <span style={{ color: '#94a3b8' }}>({formatLunarDateShort(ev.date)})</span>
                                            </div>
                                            {ev.location && (
                                                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                                    <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', fontSize: '0.72rem', flexShrink: 0 }}></i>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.location}>{ev.location}</span>
                                                </div>
                                            )}
                                            {ev.note && (
                                                <div style={{ fontSize: '0.73rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <i className="fa-regular fa-note-sticky" style={{ color: '#8b5cf6', fontSize: '0.72rem', flexShrink: 0 }}></i>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.note}>{ev.note}</span>
                                                </div>
                                            )}
                                        </div>

                                        {ev.staffInfo && ev.staffInfo.length > 0 && (
                                            <div className="tq-card-staff-white">
                                                {ev.staffInfo.map((st, idx) => (
                                                    <span key={idx} className={`tq-staff-pill-white ${st.name === 'Chưa phân công' ? 'unassigned' : ''}`}>
                                                        <i className={st.icon}></i>
                                                        <strong>{st.role}:</strong> {st.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                                {/* CỘT 3: BẢNG HỢP ĐỒNG TRỄ HẠN */}
<div className="tq-white-panel tq-overdue-alert-panel">
                    <div className="tq-panel-header">
                        <div className="tq-panel-title">
                            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }}></i>
                            <span>HỢP ĐỒNG TRỄ HẠN ({overdueContracts.all.length})</span>
                        </div>

                        <div className="tq-overdue-filter-group">
                            <button 
                                className={`tq-pill-btn-white ${overdueType === 'all' ? 'active' : ''}`}
                                onClick={() => setOverdueType('all')}
                            >
                                Tất cả ({overdueContracts.all.length})
                            </button>
                            <button 
                                className={`tq-pill-btn-white ${overdueType === 'chup' ? 'active' : ''}`}
                                onClick={() => setOverdueType('chup')}
                            >
                                Chụp ({overdueContracts.countChup})
                            </button>
                            <button 
                                className={`tq-pill-btn-white ${overdueType === 'photoshop' ? 'active' : ''}`}
                                onClick={() => setOverdueType('photoshop')}
                            >
                                PTS ({overdueContracts.countPhoto})
                            </button>
                        </div>
                    </div>

                    <div className="tq-panel-scroll-body">
                        {overdueContracts.filtered.length === 0 ? (
                            <div className="tq-empty-box-white">
                                <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>
                                <span style={{ color: '#059669', fontWeight: 600 }}>Tuyệt vời! Không có hợp đồng nào bị trễ hạn</span>
                            </div>
                        ) : (
                            <table className="tq-table-white">
                                <thead>
                                    <tr>
                                        <th style={{ width: '22%' }}>Mã HĐ</th>
                                        <th style={{ width: '32%' }}>Khách hàng</th>
                                        <th style={{ width: '24%' }}>Hạn & Mức trễ</th>
                                        <th style={{ width: '14%' }}>Phụ trách</th>
                                        <th style={{ width: '8%', textAlign: 'center' }}>Xem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueContracts.filtered.map(item => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 700, color: '#0284c7' }}>
                                                #{item.maHopDong}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.clientName}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.clientPhone || '-'}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '2px' }}>
                                                    {formatDateDisplay(item.targetDate)}
                                                </div>
                                                <span className="tq-badge-delayed-white">
                                                    <i className="fa-solid fa-clock"></i>
                                                    Trễ {item.daysOverdue} ngày
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 600 }}>
                                                    {item.assignedStaff}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                                    {item.typeLabel}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="tq-btn-action-white"
                                                    onClick={() => handleOpenContractDetail(item.contract)}
                                                    title="Xem chi tiết hợp đồng"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

        {/* Modal Detail Hop Dong */}
            {openDetailDialog && selectedContract && (
                <DetailHopDongKhachHangDialog
                    open={openDetailDialog}
                    onClose={handleCloseDetailDialog}
                    data={selectedContract}
                />
            )}
        </div>
    );
}

export default TongQuan;
