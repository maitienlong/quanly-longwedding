/**
 * Helper quản lý Trạng thái tiến trình Hợp đồng:
 * 1. Chụp hình (Đang thực hiện / Hoàn thành)
 * 2. Hậu kỳ & In ấn:
 *    - Đã giao file gốc -> Khách đã chọn ảnh -> Đang chỉnh ảnh (nhặt da/blend màu) 
 *    -> Khách duyệt layout -> Đã gửi xưởng in -> Studio đã nhận hàng -> Bàn giao
 * 3. In ảnh (Đang thực hiện / Hoàn thành)
 * 4. Hoàn thành (Đang thực hiện / Hoàn tất hợp đồng)
 * Kèm trạng thái Bảo lưu / Hủy
 */

export const CONTRACT_STAGES = [
    {
        id: 1,
        key: 'chup_hinh',
        name: 'Chụp hình',
        shortName: 'Chụp hình',
        icon: '📸',
        color: '#d97706',       // Amber
        bgColor: '#fef3c7',
        borderColor: '#fde68a',
        description: 'Chụp ảnh tại phim trường / ngoại cảnh'
    },
    {
        id: 2,
        key: 'hau_ky',
        name: 'Hậu kỳ & In ấn',
        shortName: 'Hậu kỳ',
        icon: '🎨',
        color: '#2563eb',       // Blue
        bgColor: '#dbeafe',
        borderColor: '#bfdbfe',
        description: 'Chọn ảnh, retouch, dàn layout album & theo dõi xưởng in'
    },
    {
        id: 3,
        key: 'in_anh',
        name: 'In ảnh',
        shortName: 'In ảnh',
        icon: '🖼️',
        color: '#7c3aed',       // Purple
        bgColor: '#ede9fe',
        borderColor: '#ddd6fe',
        description: 'Gia công in ảnh phóng, in album & đóng khung'
    },
    {
        id: 4,
        key: 'hoan_thanh',
        name: 'Hoàn thành',
        shortName: 'Hoàn thành',
        icon: '🏁',
        color: '#059669',       // Emerald
        bgColor: '#d1fae5',
        borderColor: '#a7f3d0',
        description: 'Bàn giao sản phẩm & hoàn tất hợp đồng'
    }
];

export const SUB_STAGES = {
    // Luồng Hậu kỳ chuẩn Studio thực tế
    da_giao_file_goc: {
        id: 'da_giao_file_goc',
        name: 'Đã giao file gốc',
        shortName: 'Đã giao gốc',
        icon: '📁',
        color: '#0284c7',
        badgeBg: '#f0f9ff',
        badgeBorder: '#bae6fd'
    },
    khach_da_chon_anh: {
        id: 'khach_da_chon_anh',
        name: 'Khách đã chọn ảnh',
        shortName: 'Khách chọn xong',
        icon: '✅',
        color: '#059669',
        badgeBg: '#ecfdf5',
        badgeBorder: '#a7f3d0'
    },
    cho_chinh: {
        id: 'cho_chinh',
        name: 'Chờ chỉnh',
        shortName: 'Chờ chỉnh',
        icon: '⏳',
        color: '#ea580c',
        badgeBg: '#fff7ed',
        badgeBorder: '#fed7aa'
    },
    dang_chinh_anh: {
        id: 'dang_chinh_anh',
        name: 'Đang chỉnh màu / Da',
        shortName: 'Đang chỉnh ảnh',
        icon: '🎨',
        color: '#2563eb',
        badgeBg: '#eff6ff',
        badgeBorder: '#bfdbfe'
    },
    dang_chinh: {
        id: 'dang_chinh',
        name: 'Đang Chỉnh',
        shortName: 'Đang Chỉnh',
        icon: '🎨',
        color: '#2563eb',
        badgeBg: '#eff6ff',
        badgeBorder: '#bfdbfe'
    },
    cho_khach_duyet_layout: {
        id: 'cho_khach_duyet_layout',
        name: 'Khách duyệt layout',
        shortName: 'Duyệt layout',
        icon: '📖',
        color: '#7c3aed',
        badgeBg: '#f5f3ff',
        badgeBorder: '#ddd6fe'
    },
    cho_khach_duyet: {
        id: 'cho_khach_duyet',
        name: 'Khách duyệt',
        shortName: 'Khách duyệt',
        icon: '💬',
        color: '#7c3aed',
        badgeBg: '#f5f3ff',
        badgeBorder: '#ddd6fe'
    },
    khach_da_duyet_layout: {
        id: 'khach_da_duyet_layout',
        name: 'Đã chốt layout',
        shortName: 'Chốt layout',
        icon: '👌',
        color: '#0d9488',
        badgeBg: '#f0fdfa',
        badgeBorder: '#99f6e4'
    },
    da_gui_xuong_in: {
        id: 'da_gui_xuong_in',
        name: 'Đã gửi xưởng in',
        shortName: 'Đã gửi in',
        icon: '🖨️',
        color: '#ea580c',
        badgeBg: '#fff7ed',
        badgeBorder: '#fed7aa'
    },
    studio_da_nhan_hang: {
        id: 'studio_da_nhan_hang',
        name: 'Đã nhận tại studio',
        shortName: 'Đã về hàng',
        icon: '📦',
        color: '#16a34a',
        badgeBg: '#f0fdf4',
        badgeBorder: '#bbf7d0'
    },
    da_tra_khach: {
        id: 'da_tra_khach',
        name: 'Đã bàn giao khách',
        shortName: 'Đã trả khách',
        icon: '🤝',
        color: '#059669',
        badgeBg: '#ecfdf5',
        badgeBorder: '#a7f3d0'
    },
    hoan_thanh: {
        id: 'hoan_thanh',
        name: 'Hoàn thành',
        shortName: 'Hoàn thành',
        icon: '✓',
        color: '#059669',
        badgeBg: '#f0fdf4',
        badgeBorder: '#bbf7d0'
    },
    bao_luu: {
        id: 'bao_luu',
        name: 'Bảo lưu',
        shortName: 'Bảo lưu',
        icon: '⏸️',
        color: '#64748b',
        badgeBg: '#f8fafc',
        badgeBorder: '#cbd5e1'
    },
    huy: {
        id: 'huy',
        name: 'Đã hủy',
        shortName: 'Đã hủy',
        icon: '❌',
        color: '#ef4444',
        badgeBg: '#fef2f2',
        badgeBorder: '#fca5a5'
    },
    dang_hau_ky: {
        id: 'dang_chinh',
        name: 'Đang Chỉnh',
        shortName: 'Đang Chỉnh',
        icon: '🎨',
        color: '#2563eb',
        badgeBg: '#eff6ff',
        badgeBorder: '#bfdbfe'
    },
    khach_duyet_anh: {
        id: 'cho_khach_duyet',
        name: 'Chờ khách duyệt',
        shortName: 'Chờ khách duyệt',
        icon: '💬',
        color: '#7c3aed',
        badgeBg: '#f5f3ff',
        badgeBorder: '#ddd6fe'
    },
    dang_thuc_hien: {
        id: 'dang_thuc_hien',
        name: 'Đang thực hiện',
        shortName: 'Đang làm',
        icon: '⏳',
        color: '#d97706',
        badgeBg: '#fffbeb',
        badgeBorder: '#fde68a'
    }
};

export const HAU_KY_SUB_STAGES = [
    {
        id: 'cho_chinh',
        name: '1. Chờ chỉnh',
        shortName: 'Chờ chỉnh',
        icon: '⏳',
        color: '#ea580c',
        bg: '#fff7ed',
        border: '#fed7aa',
        badgeBg: 'rgba(234, 88, 12, 0.1)',
        desc: 'Đang chờ thợ nhận việc / chuẩn bị chỉnh sửa'
    },
    {
        id: 'dang_chinh',
        name: '2. Đang chỉnh',
        shortName: 'Đang chỉnh',
        icon: '🎨',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        badgeBg: 'rgba(37, 99, 235, 0.1)',
        desc: 'Thợ Photoshop đang blend màu, nhặt da & làm layout'
    },
    {
        id: 'cho_khach_duyet',
        name: '3. Khách duyệt',
        shortName: 'Khách duyệt',
        icon: '💬',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        badgeBg: 'rgba(124, 58, 237, 0.1)',
        desc: 'Đã gửi bản chỉnh/layout cho dâu rể xem và duyệt'
    },
    {
        id: 'hoan_thanh',
        name: '4. Hoàn thành',
        shortName: 'Hoàn thành',
        icon: '✅',
        color: '#0d9488',
        bg: '#f0fdfa',
        border: '#99f6e4',
        badgeBg: 'rgba(13, 148, 136, 0.1)',
        desc: 'Khách đã duyệt ưng ý & hoàn tất giai đoạn hậu kỳ'
    }
];

/**
 * Kiểm tra xem hợp đồng đã được xếp lịch chụp hay chưa
 */
export const isUnscheduledShooting = (hd) => {
    if (!hd) return false;
    const stageNum = Number(hd.giaiDoan) || 1;
    if (stageNum === 4) return false;
    if (hd.subGiaiDoan === 'bao_luu' || hd.subGiaiDoan === 'huy') return false;
    if (hd.contractType === 'SINGLE_SERVICE') return false; // Dịch vụ nhanh không bắt buộc lịch chụp
    return !hd.cacNgay?.ngayChup;
};

/**
 * Lấy đầy đủ thông tin hiển thị trạng thái hợp đồng
 * Quy chuẩn:
 * - Giai đoạn 1 (Chụp hình), 3 (In ảnh), 4 (Hoàn thành): Chỉ có 1 trạng thái chính duy nhất
 * - Giai đoạn 2 (Hậu kỳ): Có 4 trạng thái phụ (Chờ làm, Đang chỉnh, Chờ khách duyệt, Hoàn thành)
 */
export const getContractStatusInfo = (hd) => {
    if (!hd) {
        return {
            stage: 1,
            stageConfig: CONTRACT_STAGES[0],
            subStage: 'dang_thuc_hien',
            subStageConfig: SUB_STAGES.dang_thuc_hien,
            label: 'Chụp hình',
            badgeText: '📸 Chụp hình',
            color: '#d97706',
            bgColor: '#fef3c7',
            rowBgColor: '#fffbeb',
            borderColor: '#fde68a',
            isComplete: false
        };
    }

    if (hd.subGiaiDoan === 'bao_luu') {
        return {
            stage: Number(hd.giaiDoan) || 1,
            stageConfig: CONTRACT_STAGES[0],
            subStage: 'bao_luu',
            subStageConfig: SUB_STAGES.bao_luu,
            label: 'Hợp đồng Bảo lưu',
            badgeText: '⏸️ Đang bảo lưu',
            color: '#475569',
            bgColor: '#e2e8f0',
            rowBgColor: '#f1f5f9',
            borderColor: '#cbd5e1',
            isComplete: false
        };
    }

    if (hd.subGiaiDoan === 'huy') {
        return {
            stage: Number(hd.giaiDoan) || 1,
            stageConfig: CONTRACT_STAGES[0],
            subStage: 'huy',
            subStageConfig: SUB_STAGES.huy,
            label: 'Hợp đồng Đã hủy',
            badgeText: '❌ Đã hủy',
            color: '#e11d48',
            bgColor: '#ffe4e6',
            rowBgColor: '#fff1f2',
            borderColor: '#fda4af',
            isComplete: false
        };
    }

    if (isUnscheduledShooting(hd)) {
        return {
            stage: 1,
            stageConfig: CONTRACT_STAGES[0],
            subStage: hd.subGiaiDoan || 'dang_thuc_hien',
            subStageConfig: SUB_STAGES[hd.subGiaiDoan] || SUB_STAGES.dang_thuc_hien,
            label: 'Chưa xếp lịch chụp',
            badgeText: '⚠️ Chưa xếp lịch',
            color: '#dc2626',
            bgColor: '#fee2e2',
            rowBgColor: '#fef2f2',
            borderColor: '#fca5a5',
            isUnscheduled: true,
            isComplete: false
        };
    }

    let rawStage = Number(hd.giaiDoan) || 1;
    if (rawStage > 4) rawStage = 4;
    if (rawStage < 1) rawStage = 1;

    let sub = hd.subGiaiDoan || 'dang_thuc_hien';

    const stageConfig = CONTRACT_STAGES.find(s => s.id === rawStage) || CONTRACT_STAGES[0];
    let subConfig = SUB_STAGES[sub] || SUB_STAGES.dang_thuc_hien;

    const isFullyCompleted = rawStage === 4;

    let label = stageConfig.shortName;
    let badgeText = `${stageConfig.icon} ${stageConfig.shortName}`;
    let color = stageConfig.color;
    let bgColor = stageConfig.bgColor;
    let rowBgColor = '#fffbeb';
    let borderColor = stageConfig.borderColor;

    if (rawStage === 1) {
        // Giai đoạn 1: Chỉ có 1 trạng thái chính "Chụp hình"
        label = 'Chụp hình';
        badgeText = '📸 Chụp hình';
        color = '#d97706';
        bgColor = '#fef3c7';
        rowBgColor = '#fffbeb';
        borderColor = '#fde68a';
    } else if (rawStage === 2) {
        // Giai đoạn 2 (Hậu kỳ): Có 4 trạng thái phụ (Chờ chỉnh, Đang chỉnh, Khách duyệt, Hoàn thành)
        if (['cho_chinh', 'da_giao_file_goc', 'khach_da_chon_anh'].includes(sub)) {
            sub = 'cho_chinh';
            subConfig = SUB_STAGES.cho_chinh;
            label = 'Hậu kỳ (Chờ chỉnh)';
            badgeText = '🎨 Hậu kỳ • Chờ chỉnh';
            color = '#ea580c';
            bgColor = '#ffedd5';
            rowBgColor = '#fff7ed';
            borderColor = '#fed7aa';
        } else if (['cho_khach_duyet', 'khach_duyet_anh', 'cho_khach_duyet_layout', 'khach_da_duyet_layout'].includes(sub)) {
            sub = 'cho_khach_duyet';
            subConfig = SUB_STAGES.cho_khach_duyet;
            label = 'Hậu kỳ (Khách duyệt)';
            badgeText = '🎨 Hậu kỳ • Khách duyệt';
            color = '#7c3aed';
            bgColor = '#ede9fe';
            rowBgColor = '#f5f3ff';
            borderColor = '#ddd6fe';
        } else if (sub === 'hoan_thanh') {
            subConfig = SUB_STAGES.hoan_thanh;
            label = 'Hậu kỳ (Hoàn thành)';
            badgeText = '🎨 Hậu kỳ • Hoàn thành';
            color = '#0d9488';
            bgColor = '#ccfbf1';
            rowBgColor = '#f0fdfa';
            borderColor = '#99f6e4';
        } else {
            sub = 'dang_chinh';
            subConfig = SUB_STAGES.dang_chinh;
            label = 'Hậu kỳ (Đang chỉnh)';
            badgeText = '🎨 Hậu kỳ • Đang chỉnh';
            color = '#2563eb';
            bgColor = '#dbeafe';
            rowBgColor = '#eff6ff';
            borderColor = '#bfdbfe';
        }
    } else if (rawStage === 3) {
        // Giai đoạn 3: Chỉ có 1 trạng thái chính "In ảnh"
        label = 'In ảnh';
        badgeText = '🖼️ In ảnh';
        color = '#9333ea';
        bgColor = '#f3e8ff';
        rowBgColor = '#faf5ff';
        borderColor = '#e9d5ff';
    } else if (rawStage === 4) {
        // Giai đoạn 4: Chỉ có 1 trạng thái chính "Hoàn thành"
        label = 'Đã hoàn tất hợp đồng';
        badgeText = '✅ Hoàn thành';
        color = '#059669';
        bgColor = '#d1fae5';
        rowBgColor = '#ecfdf5';
        borderColor = '#a7f3d0';
    }

    return {
        stage: rawStage,
        stageConfig,
        subStage: sub,
        subStageConfig: subConfig,
        label,
        badgeText,
        color,
        bgColor,
        rowBgColor,
        borderColor,
        isComplete: isFullyCompleted
    };
};

/**
 * Danh sách chú giải màu sắc dòng hợp đồng (hiển thị trên đầu bảng & hỗ trợ bấm lọc nhanh)
 */
export const CONTRACT_ROW_COLOR_LEGEND = [
    { id: 'all', label: 'Tất cả', color: '#334155', bg: '#f8fafc', border: '#cbd5e1' },
    { id: 'no_schedule', label: 'Chưa xếp lịch', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { id: '1', label: '1. Chụp hình', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    { id: '2_cho_chinh', label: '2. Hậu kỳ: Chờ chỉnh', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    { id: '2_dang_chinh', label: '2. Hậu kỳ: Đang chỉnh', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { id: '2_cho_khach_duyet', label: '2. Hậu kỳ: Khách duyệt', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { id: '2_hoan_thanh', label: '2. Hậu kỳ: Hoàn thành', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    { id: '3', label: '3. In ảnh', color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff' },
    { id: '4', label: '4. Hoàn thành', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { id: 'bao_luu', label: 'Bảo lưu', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
    { id: 'huy', label: 'Đã hủy', color: '#e11d48', bg: '#fff1f2', border: '#fda4af' }
];

/**
 * Danh sách bộ lọc trạng thái nhanh
 */
export const QUICK_STATUS_OPTIONS = [
    { id: 'all', label: 'Tất cả trạng thái' },
    { id: 'no_schedule', label: '🔴 Chưa xếp lịch chụp' },
    { id: '1', label: '📸 1. Chụp hình' },
    { id: '2_cho_chinh', label: '⏳ 2. Hậu kỳ: Chờ chỉnh' },
    { id: '2_dang_chinh', label: '🎨 2. Hậu kỳ: Đang chỉnh' },
    { id: '2_cho_khach_duyet', label: '💬 2. Hậu kỳ: Khách duyệt' },
    { id: '2_hoan_thanh', label: '✅ 2. Hậu kỳ: Hoàn thành' },
    { id: '3', label: '🖼️ 3. In ảnh' },
    { id: '4', label: '✅ 4. Hoàn thành' },
    { id: 'bao_luu', label: '⏸️ Đang bảo lưu' },
    { id: 'huy', label: '❌ Đã hủy' }
];

/**
 * SLA tiêu chuẩn số ngày tối đa cho từng công đoạn
 */
export const STAGE_SLA_DAYS = {
    1: 3,  // Chụp hình: tối đa 3 ngày sau ngày chụp để bàn giao ảnh gốc
    2: 7,  // Hậu kỳ: tối đa 7 ngày để hoàn thiện & gửi khách duyệt
    3: 5,  // In ảnh: tối đa 5 ngày xưởng in gia công & giao về studio
    4: 3   // Bàn giao: tối đa 3 ngày sau khi nhận hàng để bàn giao cho khách
};

const formatDateSafe = (dateVal) => {
    if (!dateVal) return '';
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return '';
    }
};

/**
 * Tính số ngày hợp đồng đang nằm ở giai đoạn hiện tại & cảnh báo quá hạn SLA chi tiết
 */
export const getStageSlaInfo = (hd) => {
    if (!hd) {
        return {
            daysInStage: 0,
            slaLimit: 0,
            isOverdue: false,
            isNearDeadline: false,
            text: '',
            shortText: '',
            issue: '',
            tooltip: ''
        };
    }

    if (hd.subGiaiDoan === 'bao_luu') {
        return {
            daysInStage: 0,
            slaLimit: 0,
            isOverdue: false,
            isNearDeadline: false,
            text: 'Đang bảo lưu',
            shortText: 'Bảo lưu',
            issue: 'Đang bảo lưu',
            badgeColor: '#64748b',
            badgeBg: '#f1f5f9',
            tooltip: 'Hợp đồng hiện đang trong trạng thái tạm ngưng / bảo lưu.'
        };
    }
    if (hd.subGiaiDoan === 'huy') {
        return {
            daysInStage: 0,
            slaLimit: 0,
            isOverdue: false,
            isNearDeadline: false,
            text: 'Đã hủy',
            shortText: 'Đã hủy',
            issue: 'Đã hủy',
            badgeColor: '#ef4444',
            badgeBg: '#fef2f2',
            tooltip: 'Hợp đồng đã bị hủy.'
        };
    }

    const stageNum = Number(hd.giaiDoan) || 1;
    const isCompleted = stageNum === 4 && hd.subGiaiDoan === 'hoan_thanh';
    if (isCompleted) {
        return {
            daysInStage: 0,
            slaLimit: STAGE_SLA_DAYS[4] || 3,
            isOverdue: false,
            isNearDeadline: false,
            text: 'Đã hoàn tất',
            shortText: 'Hoàn tất',
            issue: 'Đã hoàn tất',
            badgeColor: '#059669',
            badgeBg: '#d1fae5',
            tooltip: 'Hợp đồng đã hoàn thành toàn bộ các khâu và bàn giao đầy đủ cho khách hàng.'
        };
    }

    const slaLimit = STAGE_SLA_DAYS[stageNum] || 5;
    const now = new Date();

    // 1. Kiểm tra ngày chụp hình trong tương lai (với Stage 1)
    if (stageNum === 1 && hd.cacNgay?.ngayChup) {
        const shootDate = new Date(hd.cacNgay.ngayChup);
        if (!isNaN(shootDate.getTime()) && shootDate.getTime() > now.getTime()) {
            const daysUntilShoot = Math.ceil((shootDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
                daysInStage: 0,
                slaLimit,
                isOverdue: false,
                isNearDeadline: daysUntilShoot <= 1,
                text: `Chờ chụp (còn ${daysUntilShoot} ngày)`,
                shortText: `Chờ chụp (${daysUntilShoot}N)`,
                issue: 'Chờ đến ngày chụp',
                badgeColor: '#0284c7',
                badgeBg: '#e0f2fe',
                tooltip: `Lịch chụp dự kiến: ${formatDateSafe(hd.cacNgay.ngayChup)} (còn ${daysUntilShoot} ngày nữa).`
            };
        }
    }

    // 2. Xác định ngày bắt đầu tính tiến trình giai đoạn
    let startDate = null;
    if (stageNum === 1 && hd.cacNgay?.ngayChup) {
        startDate = new Date(hd.cacNgay.ngayChup);
    } else if (Array.isArray(hd.lichSuGiaiDoan) && hd.lichSuGiaiDoan.length > 0) {
        for (let i = hd.lichSuGiaiDoan.length - 1; i >= 0; i--) {
            const item = hd.lichSuGiaiDoan[i];
            if (Number(item.giaiDoan) === stageNum) {
                startDate = new Date(item.thoiGian);
                break;
            }
        }
    }

    if (!startDate || isNaN(startDate.getTime())) {
        if (stageNum === 3 && hd.cacNgay?.ngayChuyenInAnh) {
            startDate = new Date(hd.cacNgay.ngayChuyenInAnh);
        } else {
            startDate = new Date(hd.updatedAt || hd.ngayHopDong || hd.createdAt || Date.now());
        }
    }

    const diffMs = now.getTime() - (isNaN(startDate.getTime()) ? now.getTime() : startDate.getTime());
    const daysInStage = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    const isStageOverdue = daysInStage > slaLimit;
    const stageOverdueDays = isStageOverdue ? (daysInStage - slaLimit) : 0;
    const isNearDeadline = !isStageOverdue && daysInStage >= (slaLimit - 1);

    // 3. Kiểm tra hạn trả ảnh cho khách (ngayTraAnh)
    let isCustomerTraAnhOverdue = false;
    let traAnhOverdueDays = 0;
    let traAnhDateStr = '';
    if (hd.cacNgay?.ngayTraAnh) {
        const traAnhDate = new Date(hd.cacNgay.ngayTraAnh);
        if (!isNaN(traAnhDate.getTime())) {
            traAnhDateStr = formatDateSafe(traAnhDate);
            traAnhOverdueDays = Math.floor((now.getTime() - traAnhDate.getTime()) / (1000 * 60 * 60 * 24));
            if (traAnhOverdueDays > 0) {
                isCustomerTraAnhOverdue = true;
            }
        }
    }

    const isOverdue = isStageOverdue || isCustomerTraAnhOverdue;

    // 4. Xác định chi tiết vấn đề & thông báo rõ ràng
    let stageName = 'Chụp hình';
    let issueReason = '';
    let shortIssueReason = '';
    let detailedDesc = '';

    const hasLinkGoc = Boolean(hd.linkAnhGoc || hd.tiendo?.linkAnhGoc || hd.linkAnhChup);
    const thoPhotographer = hd.thoChupHinh || hd.nguoiPhucVu?.thoChupHinh || '';
    const thoRetouch = hd.thoChinhAnh || hd.nguoiPhucVu?.thoChinhAnh || '';
    const sub = hd.subGiaiDoan || 'dang_thuc_hien';

    if (stageNum === 1) {
        stageName = 'Chụp hình';
        if (!hd.cacNgay?.ngayChup) {
            issueReason = 'Chưa xếp lịch chụp';
            shortIssueReason = 'Chưa xếp lịch';
            detailedDesc = `Hợp đồng đã tạo ${daysInStage} ngày nhưng chưa xếp lịch chụp cho khách (Quy chuẩn SLA: tối đa ${slaLimit} ngày).`;
        } else if (!hasLinkGoc) {
            issueReason = 'Chưa giao file ảnh gốc';
            shortIssueReason = 'Chưa giao gốc';
            detailedDesc = `Buổi chụp diễn ra ngày ${formatDateSafe(hd.cacNgay.ngayChup)} (${daysInStage} ngày trước, SLA: ${slaLimit} ngày). Thợ chụp ${thoPhotographer ? '(' + thoPhotographer + ') ' : ''}chưa tải lên link file ảnh gốc để chuyển qua khâu Hậu kỳ.`;
        } else {
            issueReason = 'Chưa chuyển tiếp sang Hậu kỳ';
            shortIssueReason = 'Chưa chuyển hậu kỳ';
            detailedDesc = `Buổi chụp diễn ra ${daysInStage} ngày trước, đã có link ảnh gốc nhưng chưa chuyển tiến trình sang giai đoạn Hậu kỳ.`;
        }
    } else if (stageNum === 2) {
        stageName = 'Hậu kỳ';
        if (['cho_chinh', 'da_giao_file_goc', 'khach_da_chon_anh'].includes(sub)) {
            if (!thoRetouch) {
                issueReason = 'Chưa phân công thợ chỉnh';
                shortIssueReason = 'Chưa giao thợ';
                detailedDesc = `Hợp đồng đã ở khâu Chờ chỉnh ${daysInStage} ngày (SLA: ${slaLimit} ngày) nhưng chưa chỉ định thợ Photoshop nhận việc.`;
            } else {
                issueReason = 'Chờ thợ nhận việc & chỉnh sửa';
                shortIssueReason = 'Chờ thợ chỉnh';
                detailedDesc = `Thợ chỉnh ${thoRetouch} chưa bắt đầu xử lý. Thời gian chờ đã kéo dài ${daysInStage} ngày (SLA: ${slaLimit} ngày).`;
            }
        } else if (['dang_chinh', 'dang_hau_ky', 'dang_chinh_anh', 'dang_thuc_hien'].includes(sub)) {
            issueReason = 'Thợ đang chỉnh ảnh quá thời hạn';
            shortIssueReason = 'Đang chỉnh trễ';
            detailedDesc = `Thợ Photoshop ${thoRetouch ? '(' + thoRetouch + ') ' : ''}đang chỉnh ảnh ${daysInStage} ngày (SLA chuẩn: ${slaLimit} ngày) chưa hoàn thành gửi duyệt layout.`;
        } else if (['cho_khach_duyet', 'khach_duyet_anh', 'cho_khach_duyet_layout', 'khach_da_duyet_layout'].includes(sub)) {
            issueReason = 'Chờ khách duyệt layout / bản chỉnh';
            shortIssueReason = 'Chờ khách duyệt';
            detailedDesc = `Đã gửi ảnh/layout cho khách xem ${daysInStage} ngày (SLA: ${slaLimit} ngày) nhưng khách chưa phản hồi duyệt. Cần CSKH liên hệ nhắc khách.`;
        } else if (sub === 'hoan_thanh') {
            issueReason = 'Hậu kỳ xong nhưng chưa chuyển In';
            shortIssueReason = 'Chưa chuyển in';
            detailedDesc = `Hậu kỳ đã hoàn thành ${daysInStage} ngày trước nhưng chưa bấm chuyển tiếp sang bước In ảnh.`;
        } else {
            issueReason = 'Tiến độ hậu kỳ trễ hẹn';
            shortIssueReason = 'Trễ hậu kỳ';
            detailedDesc = `Khâu Hậu kỳ đã kéo dài ${daysInStage} ngày (SLA chuẩn: ${slaLimit} ngày).`;
        }
    } else if (stageNum === 3) {
        stageName = 'In ảnh';
        issueReason = 'Chờ xưởng in gia công giao hàng';
        shortIssueReason = 'Chờ xưởng in';
        detailedDesc = `Hợp đồng đã gửi in ${daysInStage} ngày (SLA chuẩn: ${slaLimit} ngày) nhưng xưởng in chưa bàn giao sản phẩm về studio.`;
    } else if (stageNum === 4) {
        stageName = 'Bàn giao';
        issueReason = 'Chưa bàn giao sản phẩm cho khách';
        shortIssueReason = 'Chưa trả khách';
        detailedDesc = `Sản phẩm đã về studio ${daysInStage} ngày (SLA: ${slaLimit} ngày) nhưng chưa liên hệ bàn giao cho khách hàng.`;
    }

    let text = `${daysInStage} ngày`;
    let shortText = `${daysInStage}N`;
    let badgeColor = '#059669';
    let badgeBg = '#ecfdf5';

    if (isOverdue) {
        badgeColor = '#dc2626';
        badgeBg = '#fef2f2';

        if (isCustomerTraAnhOverdue && traAnhOverdueDays >= stageOverdueDays) {
            text = `Quá hạn trả ảnh khách: trễ ${traAnhOverdueDays} ngày (Kẹt: ${stageName})`;
            shortText = `Trễ trả khách (${traAnhOverdueDays}N)`;
        } else {
            text = `Quá hạn ${stageName}: ${issueReason} (trễ ${stageOverdueDays || traAnhOverdueDays} ngày)`;
            shortText = `Quá hạn ${stageName} (${stageOverdueDays || traAnhOverdueDays}N)`;
        }
    } else if (isNearDeadline) {
        text = `Sắp đến hạn ${stageName} (${daysInStage}/${slaLimit} ngày)`;
        shortText = `Sắp đến hạn (${daysInStage}/${slaLimit}N)`;
        badgeColor = '#d97706';
        badgeBg = '#fef3c7';
    } else {
        text = `Tiến độ tốt: ${stageName} (${daysInStage}/${slaLimit} ngày)`;
        shortText = `Tiến độ tốt (${daysInStage}/${slaLimit}N)`;
    }

    const tooltipLines = [
        `⏱️ THÔNG TIN TIẾN ĐỘ & QUY CHUẨN SLA:`,
        `• Giai đoạn hiện tại: [Bước ${stageNum}] ${stageName}`,
        `• Thời gian tại bước này: ${daysInStage} ngày (Quy chuẩn SLA: ${slaLimit} ngày)`,
        isOverdue
            ? `• ⚠️ TÌNH TRẠNG QUÁ HẠN: ${issueReason} (Trễ ${stageOverdueDays || traAnhOverdueDays} ngày)`
            : (isNearDeadline ? `• ⏳ TÌNH TRẠNG: Sắp chạm mốc SLA (${daysInStage}/${slaLimit} ngày)` : `• ✅ TÌNH TRẠNG: Đúng hạn SLA`),
        detailedDesc ? `• Chi tiết: ${detailedDesc}` : ''
    ];

    if (isCustomerTraAnhOverdue) {
        tooltipLines.push(`• 🚨 CẢNH BÁO: Đã quá Ngày hẹn trả ảnh khách (${traAnhDateStr}) ${traAnhOverdueDays} ngày!`);
    } else if (traAnhDateStr) {
        tooltipLines.push(`• Ngày hẹn trả ảnh khách: ${traAnhDateStr}`);
    }

    const tooltip = tooltipLines.filter(Boolean).join('\n');

    return {
        daysInStage,
        slaLimit,
        isOverdue,
        isNearDeadline,
        text,
        shortText,
        issue: issueReason,
        detailedDesc,
        tooltip,
        badgeColor,
        badgeBg
    };
};
