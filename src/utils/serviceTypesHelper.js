export const DEFAULT_SERVICE_TYPES = [
    {
        id: 1,
        name: "Trang Phục",
        prefix: "CLOTHING_",
        icon: "👗",
        color: "#9333ea",
        badgeBg: "#f3e8ff",
        description: "Váy cưới, áo dài, vest chú rể, trang phục bê lễ"
    },
    {
        id: 2,
        name: "Gói Dịch Vụ",
        prefix: "SERVICE_",
        icon: "📦",
        color: "#2563eb",
        badgeBg: "#dbeafe",
        description: "Gói chụp studio, pre-wedding, phóng sự cưới trọn gói"
    },
    {
        id: 3,
        name: "Ảnh (Lab)",
        prefix: "LAB_",
        icon: "🖼️",
        color: "#059669",
        badgeBg: "#d1fae5",
        description: "Ảnh phóng cổng, ảnh để bàn, album photobook"
    },
    {
        id: 4,
        name: "Trang Điểm",
        prefix: "MAKEUP_",
        icon: "💄",
        color: "#db2777",
        badgeBg: "#fce7f3",
        description: "Trang điểm cô dâu ăn hỏi, tiệc cưới, makeup tiệc"
    },
    {
        id: 5,
        name: "Thiệp Cưới Online",
        prefix: "VIP_",
        icon: "💌",
        color: "#e11d48",
        badgeBg: "#ffe4e6",
        description: "Mẫu thiệp cưới trực tuyến tương tác cao cấp"
    }
];

let cache = [...DEFAULT_SERVICE_TYPES];

export const getServiceTypesCache = () => cache;

export const updateServiceTypesCache = (newTypes) => {
    if (Array.isArray(newTypes) && newTypes.length > 0) {
        cache = newTypes.map(t => ({
            id: Number(t.id),
            name: t.name || `Loại ${t.id}`,
            prefix: t.prefix || '',
            icon: t.icon || '📦',
            color: t.color || '#2563eb',
            badgeBg: t.badgeBg || '#dbeafe',
            description: t.description || '',
            serviceCount: t.serviceCount || 0
        }));
    }
    window.dispatchEvent(new Event('serviceTypesUpdated'));
};

export const getLoaiDichVuInfo = (typeId) => {
    const num = Number(typeId);
    const found = cache.find(t => t.id === num);
    if (found) return found;
    return {
        id: num,
        name: "Khác",
        prefix: "DV_",
        icon: "🏷️",
        color: "#64748b",
        badgeBg: "#f1f5f9",
        description: ""
    };
};

export const getLoaiDichVuLabel = (typeId) => {
    return getLoaiDichVuInfo(typeId).name;
};

/**
 * Xóa dấu tiếng Việt
 */
export const removeVietnameseTones = (str) => {
    if (!str) return '';
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));
    return str;
};

/**
 * Lấy các chữ cái đầu (Viết tắt) từ chuỗi tiếng Việt
 * VD: "Váy Cưới Hoàng Gia" -> "VCHG"
 *     "Gói Chụp Pre Wedding Đà Lạt" -> "GCPWDL"
 *     "Ảnh Ép Gỗ Cổng 60x90" -> "AEGC60X90"
 */
export const getVietnameseInitials = (str) => {
    if (!str) return '';
    const cleanStr = removeVietnameseTones(str).trim();
    const words = cleanStr.split(/[\s\-_+.,/]+/).filter(Boolean);
    return words.map(w => {
        // Nếu là số hoặc kích thước (VD: "60x90", "01", "2024")
        if (/^\d/.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase();
    }).join('');
};

/**
 * Tự động sinh mã dịch vụ theo tên dịch vụ (viết tắt) kèm prefix loại dịch vụ
 */
export const generateServiceCode = (serviceName, prefix = '', existingCodes = []) => {
    const initials = getVietnameseInitials(serviceName);
    if (!initials) return prefix || '';
    
    let baseCode = (prefix ? prefix : '') + initials;
    baseCode = baseCode.toUpperCase();

    // Nếu không trùng mã thì trả về ngay
    if (!existingCodes || existingCodes.length === 0) {
        return baseCode;
    }

    const codeSet = new Set(existingCodes.map(c => String(c).trim().toUpperCase()));
    if (!codeSet.has(baseCode)) {
        return baseCode;
    }

    // Nếu đã tồn tại, tự động thêm hậu tố -01, -02...
    let counter = 1;
    let candidate = `${baseCode}_${String(counter).padStart(2, '0')}`;
    while (codeSet.has(candidate)) {
        counter++;
        candidate = `${baseCode}_${String(counter).padStart(2, '0')}`;
    }
    return candidate;
};

/**
 * Trích xuất phần mã sau tiền tố đã biết
 */
export const extractCodeSuffix = (fullId, types = cache) => {
    if (!fullId) return "";
    const prefixes = (types || cache)
        .map(t => t.prefix)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length); // Ưu tiên prefix dài trước

    for (const prefix of prefixes) {
        if (fullId.toUpperCase().startsWith(prefix.toUpperCase())) {
            return fullId.slice(prefix.length);
        }
    }
    return fullId;
};
