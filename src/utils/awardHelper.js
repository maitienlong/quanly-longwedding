// src/utils/awardHelper.js
// Quản lý và lưu trữ danh hiệu / huy hiệu được Quản trị viên tặng cho nhân viên

const STORAGE_KEY = 'longwedding_employee_awards';

// Danh sách danh hiệu mẫu gợi ý sẵn cho Quản trị viên
export const PRESET_AWARDS = [
    { title: "🎖️ Nhân Viên Chính Thức", color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
    { title: "⭐ Nhân Viên Xuất Sắc", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { title: "👑 Chiến Binh Doanh Số", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    { title: "💎 Cống Hiến & Tận Tâm", color: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff" },
    { title: "📸 Phù Thủy Nhiếp Ảnh", color: "#0369a1", bg: "#f0f9ff", border: "#7dd3fc" },
    { title: "💄 Bàn Tay Vàng Makeup", color: "#be185d", bg: "#fdf2f8", border: "#fbcfe8" },
    { title: "🎨 Phù Thủy Hậu Kỳ", color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
    { title: "🌟 Ngôi Sao Chăm Chỉ", color: "#ca8a04", bg: "#fefce8", border: "#fef08a" },
    { title: "🚀 Vua Chốt Hợp Đồng", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    { title: "🥇 Quán Quân Thi Đua", color: "#b45309", bg: "#fef3c7", border: "#fbbf24" },
    { title: "❤️ Gương Mặt Thân Thiện", color: "#c026d3", bg: "#fdf4ff", border: "#f5d0fe" }
];

// Lấy danh sách danh hiệu của nhân viên
export const getEmployeeAwards = (username, empData = null) => {
    if (!username) return ["🎖️ Nhân Viên Chính Thức"];
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const map = stored ? JSON.parse(stored) : {};
        const localAwards = map[username.toLowerCase()];
        
        if (Array.isArray(localAwards) && localAwards.length > 0) {
            return localAwards;
        }

        if (empData && Array.isArray(empData.danhHieu) && empData.danhHieu.length > 0) {
            return empData.danhHieu;
        }
    } catch (e) {
        console.error("Lỗi đọc danh hiệu nhân viên:", e);
    }

    return ["🎖️ Nhân Viên Chính Thức"];
};

// Lưu danh sách danh hiệu cho nhân viên
export const saveEmployeeAwards = (username, awardsList) => {
    if (!username) return;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const map = stored ? JSON.parse(stored) : {};
        const cleanList = Array.isArray(awardsList) && awardsList.length > 0 ? awardsList : ["🎖️ Nhân Viên Chính Thức"];
        map[username.toLowerCase()] = cleanList;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        return cleanList;
    } catch (e) {
        console.error("Lỗi lưu danh hiệu nhân viên:", e);
    }
};
