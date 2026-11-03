/**
 * Helper tính toán Lương, Thưởng, Hoa hồng và Chỉ tiêu KPI nhân viên - Long Wedding Studio
 */

export const formatMoney = (amount) => {
    return (Number(amount) || 0).toLocaleString('vi-VN') + ' đ';
};

export const formatShortMoney = (amount) => {
    const num = Number(amount) || 0;
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + ' tr';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + ' k';
    }
    return num.toLocaleString('vi-VN') + ' đ';
};

/**
 * Kiểm tra xem hợp đồng có được phân công cho nhân viên hay không
 */
export const isContractAssignedToUser = (contract, user) => {
    if (!contract || !user) return false;
    const fn = (user.fullname || user.hoTen || '').trim().toLowerCase();
    const un = (user.username || '').trim().toLowerCase();

    const checkMatch = (val) => {
        if (!val) return false;
        const clean = String(val).trim().toLowerCase();
        return clean === fn || clean === un || (fn && (clean.includes(fn) || fn.includes(clean))) || (un && (clean.includes(un) || un.includes(clean)));
    };

    const npv = contract.nguoiPhucVu || {};
    if (
        checkMatch(npv.thoChupHinh) ||
        checkMatch(npv.thoMakeUp) ||
        checkMatch(npv.thoChinhAnh) ||
        checkMatch(npv.banHang) ||
        checkMatch(npv.phucVu) ||
        checkMatch(contract.createBy) ||
        checkMatch(contract.nguoiTao) ||
        checkMatch(contract.nhanVien) ||
        checkMatch(contract.nhanVienSale) ||
        checkMatch(contract.nhanVienTuVan)
    ) {
        return true;
    }

    // Kiểm tra trong lịch trình nhiệm vụ chi tiết
    if (Array.isArray(contract.serviceSchedules)) {
        if (contract.serviceSchedules.some(s => checkMatch(s.nhanVien))) return true;
    }
    if (Array.isArray(contract.lichChup)) {
        if (contract.lichChup.some(s => checkMatch(s.nhanVien) || checkMatch(s.thoChupHinh))) return true;
    }
    if (Array.isArray(contract.lichTrangDiem)) {
        if (contract.lichTrangDiem.some(s => checkMatch(s.nhanVien) || checkMatch(s.thoMakeUp))) return true;
    }

    return false;
};

/**
 * Lấy danh sách vai trò của nhân viên trong hợp đồng
 */
export const getAssignedRoles = (contract, user) => {
    if (!contract || !user) return [];
    const fn = (user.fullname || user.hoTen || '').trim().toLowerCase();
    const un = (user.username || '').trim().toLowerCase();

    const checkMatch = (val) => {
        if (!val) return false;
        const clean = String(val).trim().toLowerCase();
        return clean === fn || clean === un || (fn && (clean.includes(fn) || fn.includes(clean))) || (un && (clean.includes(un) || un.includes(clean)));
    };

    const roles = [];
    const npv = contract.nguoiPhucVu || {};

    if (checkMatch(npv.thoChupHinh)) roles.push('📸 Chụp hình');
    if (checkMatch(npv.thoMakeUp)) roles.push('💄 Make-up');
    if (checkMatch(npv.thoChinhAnh)) roles.push('🎨 Chỉnh ảnh');
    if (checkMatch(npv.banHang) || checkMatch(contract.nhanVienSale) || checkMatch(contract.nhanVienTuVan)) roles.push('💼 Tư vấn');
    if (checkMatch(npv.phucVu)) roles.push('👥 Phục vụ');

    // Kiểm tra thêm trong serviceSchedules
    if (Array.isArray(contract.serviceSchedules)) {
        contract.serviceSchedules.forEach(s => {
            if (checkMatch(s.nhanVien)) {
                if (s.serviceType === 'photo' && !roles.includes('📸 Chụp hình')) roles.push('📸 Chụp hình');
                if (s.serviceType === 'makeup' && !roles.includes('💄 Make-up')) roles.push('💄 Make-up');
                if (s.serviceType === 'video' && !roles.includes('🎥 Quay phim')) roles.push('🎥 Quay phim');
                if (s.serviceType === 'bts' && !roles.includes('🎬 Hậu trường')) roles.push('🎬 Hậu trường');
                if (s.serviceType === 'cskh' && !roles.includes('💼 Tư vấn')) roles.push('💼 Tư vấn');
            }
        });
    }

    return roles.length > 0 ? roles : ['Tham gia thực hiện'];
};

/**
 * Tính hoa hồng cho một hợp đồng cụ thể dựa trên chính sách của nhân viên
 */
export const calculateContractCommission = (contract, emp) => {
    if (!emp || !contract) return { amount: 0, ruleLabel: 'Chưa cài đặt', type: 0, rate: 0 };
    const val = Number(contract.thanhToan?.tongGiaTriSauGiam || contract.thanhToan?.tongGiaTri || 0);
    const typeId = Number(contract.dichVuChinh || 0);

    // 1. Kiểm tra cấu hình hoa hồng đặc thù theo loại hợp đồng
    const customList = Array.isArray(emp.hoaHongTheoLoaiHD) ? emp.hoaHongTheoLoaiHD : [];
    const customRule = customList.find(c => Number(c.loaiHopDongId) === typeId);

    if (customRule && customRule.mucHoaHong !== undefined && customRule.mucHoaHong !== null && customRule.mucHoaHong !== '') {
        const ruleRate = Number(customRule.mucHoaHong) || 0;
        if (Number(customRule.loaiHoaHong) === 1) { // % Doanh số
            return {
                amount: Math.round((val * ruleRate) / 100),
                ruleLabel: `${ruleRate}% Doanh số`,
                type: 1,
                rate: ruleRate
            };
        } else { // VNĐ cố định / hợp đồng
            return {
                amount: ruleRate,
                ruleLabel: `${formatMoney(ruleRate)} / HĐ`,
                type: 0,
                rate: ruleRate
            };
        }
    }

    // 2. Fallback sang mức hoa hồng mặc định của nhân viên
    const defRate = Number(emp.luongHoaHong) || 0;
    if (Number(emp.loaiHoaHong) === 1) {
        return {
            amount: Math.round((val * defRate) / 100),
            ruleLabel: `${defRate}% Doanh số (Mặc định)`,
            type: 1,
            rate: defRate
        };
    } else if (defRate > 0) {
        return {
            amount: defRate,
            ruleLabel: `${formatMoney(defRate)} / HĐ (Mặc định)`,
            type: 0,
            rate: defRate
        };
    }

    return {
        amount: 0,
        ruleLabel: 'Không có hoa hồng',
        type: 0,
        rate: 0
    };
};

/**
 * Tính toán bảng lương & tổng hợp thu nhập tháng của nhân viên
 */
export const calculateUserSalaryBreakdown = (userProfile, userStats, myMonthContracts = []) => {
    const luongCoBan = Number(userProfile?.luongCoBan || 0);
    const chiTieuThang = Number(userProfile?.chiTieuThang || userStats?.target || 20);
    const workCount = myMonthContracts.length > 0 ? myMonthContracts.length : (userStats?.workCount ?? userStats?.countWork ?? 0);

    let tongDoanhSo = 0;
    let hoaHongTotal = 0;
    const contractDetails = [];

    if (Array.isArray(myMonthContracts) && myMonthContracts.length > 0) {
        myMonthContracts.forEach(contract => {
            const val = Number(contract.thanhToan?.tongGiaTriSauGiam || contract.thanhToan?.tongGiaTri || 0);
            tongDoanhSo += val;
            const comm = calculateContractCommission(contract, userProfile);
            hoaHongTotal += comm.amount;
            contractDetails.push({
                contract,
                value: val,
                commission: comm.amount,
                ruleLabel: comm.ruleLabel,
                roles: getAssignedRoles(contract, userProfile)
            });
        });
    } else {
        hoaHongTotal = Number(userStats?.hoaHongEst || userStats?.hoaHong || 0);
        tongDoanhSo = Number(userStats?.revenue || userStats?.tongDoanhSo || 0);
    }

    const percentCompletion = chiTieuThang > 0 ? Math.round((workCount / chiTieuThang) * 100) : 0;
    const isExceeded = workCount > chiTieuThang;
    const exceededCount = Math.max(0, workCount - chiTieuThang);

    // Tính thưởng vượt chỉ tiêu (mỗi hợp đồng vượt + 200.000 đ hoặc theo mốc thi đua)
    let bonusEst = userStats?.bonusEst || 0;
    if (!bonusEst && isExceeded) {
        bonusEst = exceededCount * 200000;
    }
    if (percentCompletion >= 150) {
        bonusEst = Math.max(bonusEst, Math.max(500000, Math.round(hoaHongTotal * 0.15)));
    } else if (percentCompletion >= 120) {
        bonusEst = Math.max(bonusEst, Math.max(300000, Math.round(hoaHongTotal * 0.10)));
    } else if (percentCompletion >= 100) {
        bonusEst = Math.max(bonusEst, Math.max(100000, Math.round(hoaHongTotal * 0.05)));
    }

    const tongThuNhap = luongCoBan + hoaHongTotal + bonusEst;

    return {
        luongCoBan,
        hoaHongTotal,
        bonusEst,
        tongThuNhap,
        workCount,
        chiTieuThang,
        percentCompletion,
        isExceeded,
        exceededCount,
        tongDoanhSo,
        contractDetails
    };
};

