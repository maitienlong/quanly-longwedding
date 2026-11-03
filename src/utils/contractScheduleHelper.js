import { isMakeupItem } from './makeupHelper.js';

/**
 * Kiểm tra xem một item có phải dịch vụ trang điểm hay không
 */
export const isMakeupService = (item) => {
    return isMakeupItem(item);
};

/**
 * Kiểm tra xem một item có phải trang phục (váy, vest, áo dài...) hay không
 */
export const isClothingService = (item) => {
    if (!item) return false;
    const loai = Number(item.loaiDichVu);
    if (loai === 1) return true;

    const code = String(item.maDichVu || '').toUpperCase();
    if (code.startsWith('CLOTHING_') || code.startsWith('TP_') || code.startsWith('VAY_') || code.startsWith('VEST_') || code.startsWith('AO_')) {
        return true;
    }

    const name = String(item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
    if (
        name.includes('váy') ||
        name.includes('vest') ||
        name.includes('áo dài') ||
        name.includes('trang phục') ||
        name.includes('bê lễ') ||
        name.includes('phụ kiện cưới')
    ) {
        return true;
    }

    return false;
};

/**
 * Kiểm tra xem một item có phải dịch vụ chụp hình / phóng sự / quay phim hay không
 */
export const isPhotoShootService = (item) => {
    if (!item) return false;
    // Không phải trang phục, không phải in ấn lab, không phải thiệp online, không phải makeup
    if (isClothingService(item)) return false;
    if (isMakeupService(item)) return false;

    const loai = Number(item.loaiDichVu);
    if (loai === 3) return false; // Ảnh Lab / In ấn
    if (loai === 5) return false; // Thiệp mời

    if (loai === 2) return true; // Gói dịch vụ

    const code = String(item.maDichVu || '').toUpperCase();
    if (
        code.startsWith('PRE-W') ||
        code.startsWith('PRE_') ||
        code.startsWith('CHUP_') ||
        code.startsWith('PHOTO_') ||
        code.startsWith('PS_') ||
        code.startsWith('SERVICE_') ||
        code.startsWith('VIDEO_') ||
        code.startsWith('FILM_')
    ) {
        return true;
    }

    const name = String(item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
    if (
        name.includes('chụp') ||
        name.includes('photo') ||
        name.includes('pre-wedding') ||
        name.includes('pre wedding') ||
        name.includes('phóng sự') ||
        name.includes('studio') ||
        name.includes('ngoại cảnh') ||
        name.includes('ảnh cưới') ||
        name.includes('ảnh thẻ') ||
        name.includes('ảnh bé') ||
        name.includes('ảnh gia đình') ||
        name.includes('gia đình') ||
        name.includes('quay phim') ||
        name.includes('video') ||
        name.includes('beauty') ||
        name.includes('lookbook')
    ) {
        return true;
    }

    return false;
};

/**
 * Kiểm tra xem một item có phải ảnh Lab / in ấn hay không
 */
export const isPhotoLabService = (item) => {
    if (!item) return false;
    const loai = Number(item.loaiDichVu);
    if (loai === 3) return true;

    const code = String(item.maDichVu || '').toUpperCase();
    if (code.startsWith('LAB_') || code.startsWith('IN_') || code.startsWith('ALBUM_') || code.startsWith('ANH_')) {
        return true;
    }

    const name = String(item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
    if (name.includes('in ảnh') || name.includes('ảnh ép gỗ') || name.includes('ảnh phóng') || name.includes('in lab')) {
        return true;
    }

    return false;
};

/**
 * Kiểm tra xem một item có phải thiệp cưới online hay không.
 * Chỉ đúng khi dịch vụ là loại 5 (Thiệp Cưới Online) hoặc có cờ isThiep rõ ràng.
 * Tuyệt đối không nhận nhầm các gói combo/chụp ảnh (loại 2), trang phục (loại 1), lab (loại 3) hay makeup (loại 4).
 */
export const isWeddingCardService = (item) => {
    if (!item) return false;
    const loai = Number(item.loaiDichVu);
    if (loai === 5) return true;

    // Các loại dịch vụ khác: 1 (Trang phục), 2 (Gói dịch vụ / Combo / Chụp), 3 (Ảnh Lab), 4 (Trang điểm)
    if (loai === 1 || loai === 2 || loai === 3 || loai === 4) return false;

    // Nếu dịch vụ thuộc nhóm trang phục, chụp ảnh, makeup hoặc in ấn lab thì tuyệt đối không phải thiệp
    if (isClothingService(item) || isPhotoShootService(item) || isMakeupService(item) || isPhotoLabService(item)) {
        return false;
    }

    if (item.isThiep === true) return true;

    const code = String(item.maDichVu || '').toUpperCase();
    if (code.startsWith('THIEP_') || code.startsWith('THIEP-') || code.startsWith('CARD_')) {
        return true;
    }

    const name = String(item.tenDichVuSnapshot || item.tenDichVu || '').toLowerCase();
    if (name.includes('thiệp cưới') || name.includes('thiep cuoi') || name.includes('thiệp online') || name.includes('mẫu thiệp')) {
        return true;
    }

    return false;
};

/**
 * Kiểm tra item có cần thiết lập lịch và phân công nhân sự hay không (trang điểm, chụp hình)
 */
export const requiresSchedule = (item) => {
    if (!item) return false;
    if (isClothingService(item)) return false;
    if (isWeddingCardService(item)) return false;
    if (isPhotoLabService(item)) return false;

    if (Number(item.soLuongLichChup) > 0 || Number(item.soLuongLichMake) > 0) return true;

    return isMakeupService(item) || isPhotoShootService(item);
};

/**
 * Lấy loại lịch: 'makeup' | 'photo' | 'other'
 */
export const getScheduleType = (item) => {
    if (isMakeupService(item)) return 'makeup';
    if (isPhotoShootService(item)) return 'photo';
    return 'other';
};

/**
 * Format timestamp sang string input datetime-local: YYYY-MM-DDTHH:mm
 */
export const formatDateTimeInput = (val) => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Format giờ: HH:mm
 */
export const getTimeStringFromDateTime = (val) => {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Đồng bộ danh sách lịch trình với giỏ hàng.
 * Đảm bảo gói dịch vụ combo (ví dụ combo 2 ngày chụp, 2 lượt make) hoặc dịch vụ riêng lẻ
 * tạo đúng số lượng lịch chụp ảnh và lịch trang điểm tương ứng đã set sẵn trong gói hoặc giỏ hàng.
 */
export const syncSchedulesWithCart = (existingSchedules = [], cart = []) => {
    const schedules = Array.isArray(existingSchedules) ? [...existingSchedules] : [];
    const validServiceIds = new Set();
    const resultSchedules = [];

    // Nhóm các lịch hiện tại theo serviceId và serviceType
    const schedulesByService = {};
    schedules.forEach(sch => {
        const key = sch.serviceId || 'MANUAL';
        if (!schedulesByService[key]) schedulesByService[key] = [];
        schedulesByService[key].push(sch);
    });

    // Duyệt từng item trong giỏ hàng
    cart.forEach((sp, idx) => {
        if (!requiresSchedule(sp)) return;

        const sId = sp.maDichVu || sp.dichVu?._id || sp._id || `svc-${idx}`;
        validServiceIds.add(sId);

        const baseName = sp.tenDichVuSnapshot || sp.tenDichVu || 'Dịch vụ';

        // Xác định số lượng lịch chụp (soLuongLichChup)
        let shootCount = 0;
        if (sp.soLuongLichChup !== undefined && sp.soLuongLichChup !== null) {
            shootCount = Math.max(0, Number(sp.soLuongLichChup));
        } else if (isPhotoShootService(sp)) {
            shootCount = 1;
        }

        // Xác định số lượng lịch make (soLuongLichMake)
        let makeCount = 0;
        if (sp.soLuongLichMake !== undefined && sp.soLuongLichMake !== null) {
            makeCount = Math.max(0, Number(sp.soLuongLichMake));
        } else if (isMakeupService(sp)) {
            makeCount = 1;
        }

        // Fallback an toàn nếu cả 2 đều bằng 0 nhưng dịch vụ yêu cầu lịch
        if (shootCount === 0 && makeCount === 0) {
            if (isMakeupService(sp)) makeCount = 1;
            else if (isPhotoShootService(sp)) shootCount = 1;
        }

        const currentForService = schedulesByService[sId] || [];
        const existingPhotoSchedules = currentForService.filter(s => s.serviceType === 'photo');
        const existingMakeSchedules = currentForService.filter(s => s.serviceType === 'makeup');

        // 1. Tạo hoặc cập nhật các lịch chụp hình
        for (let t = 0; t < shootCount; t++) {
            const schName = shootCount > 1 ? `${baseName} (Chụp ngày ${t + 1})` : `${baseName} (Chụp ảnh)`;
            if (existingPhotoSchedules[t]) {
                resultSchedules.push({
                    ...existingPhotoSchedules[t],
                    serviceId: sId,
                    serviceName: schName,
                    serviceType: 'photo',
                    luot: t + 1,
                    totalLuot: shootCount
                });
            } else {
                resultSchedules.push({
                    id: `sch-ph-${sId}-${t}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    serviceId: sId,
                    serviceName: schName,
                    serviceType: 'photo',
                    luot: t + 1,
                    totalLuot: shootCount,
                    ngayGio: '',
                    diaDiem: 'Tại Studio',
                    nhanVien: '',
                    ghiChu: ''
                });
            }
        }

        // 2. Tạo hoặc cập nhật các lịch trang điểm
        for (let m = 0; m < makeCount; m++) {
            const schName = makeCount > 1 ? `${baseName} (Makeup lượt ${m + 1})` : `${baseName} (Makeup)`;
            if (existingMakeSchedules[m]) {
                resultSchedules.push({
                    ...existingMakeSchedules[m],
                    serviceId: sId,
                    serviceName: schName,
                    serviceType: 'makeup',
                    luot: m + 1,
                    totalLuot: makeCount
                });
            } else {
                resultSchedules.push({
                    id: `sch-mk-${sId}-${m}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    serviceId: sId,
                    serviceName: schName,
                    serviceType: 'makeup',
                    luot: m + 1,
                    totalLuot: makeCount,
                    ngayGio: m === 0 && sp.ngayTrangDiem ? formatDateTimeInput(sp.ngayTrangDiem) : '',
                    diaDiem: sp.diaDiemTrangDiem || 'Tại Studio',
                    nhanVien: sp.thoMakeUp || '',
                    ghiChu: sp.ghiChuTrangDiem || ''
                });
            }
        }
    });

    // Giữ lại các lịch thủ công hoặc lịch legacy (nếu không gắn với dịch vụ nào trong giỏ hàng)
    schedules.forEach(sch => {
        if (sch.serviceId === 'LEGACY_SHOOT' || sch.serviceId === 'MANUAL_SHOOT' || sch.serviceId === 'MANUAL_MAKEUP' || String(sch.serviceId || '').startsWith('MANUAL_') || sch.serviceType === 'video' || sch.serviceType === 'bts' || sch.serviceType === 'cskh' || sch.serviceType === 'support') {
            resultSchedules.push(sch);
        }
    });

    return resultSchedules;
};
