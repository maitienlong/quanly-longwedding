import { SolarDate, LunarDate } from 'lunar-date-vn';

/**
 * Lấy đối tượng LunarDate từ ngày dương lịch (Date hoặc string hoặc timestamp)
 */
export const getLunarDate = (solarDateInput) => {
    if (!solarDateInput) return null;
    const date = new Date(solarDateInput);
    if (isNaN(date.getTime())) return null;
    try {
        const solarDate = new SolarDate(date);
        return solarDate.toLunarDate();
    } catch (err) {
        console.error("Error converting to LunarDate:", err);
        return null;
    }
};

/**
 * Định dạng ngày âm lịch ngắn gọn (ví dụ: "15/6" hoặc "1/6 N")
 */
export const formatLunarDateShort = (solarDateInput) => {
    const lunar = getLunarDate(solarDateInput);
    if (!lunar) return "";
    return `${lunar.day}/${lunar.month}${lunar.leap_month ? ' N' : ''}`;
};

/**
 * Định dạng ngày âm lịch đầy đủ (ví dụ: "Ngày 14 tháng 6, năm Bính Ngọ")
 */
export const formatLunarDateFull = (solarDateInput) => {
    const lunar = getLunarDate(solarDateInput);
    if (!lunar) return "";
    return `Ngày ${lunar.day} tháng ${lunar.month}${lunar.leap_month ? ' Nhuận' : ''}, năm ${lunar.getYearName()}`;
};

/**
 * Chuyển đổi từ ngày Âm lịch sang ngày Dương lịch (trả về Date object)
 */
export const convertLunarToSolar = (lunarDay, lunarMonth, lunarYear, isLeapMonth = false) => {
    try {
        const lunar = new LunarDate({ day: 1, month: 1, year: lunarYear });
        lunar.setDate({ 
            day: Number(lunarDay), 
            month: Number(lunarMonth), 
            year: Number(lunarYear), 
            leap_month: !!isLeapMonth 
        });
        const solarDateObj = lunar.toSolarDate();
        return solarDateObj ? solarDateObj.toDate() : null;
    } catch (err) {
        console.error("Error converting Lunar to Solar:", err);
        return null;
    }
};

/**
 * Trả về thông tin chi tiết ngày để làm Tooltip
 */
export const getDetailedLunarInfo = (solarDateInput) => {
    const date = new Date(solarDateInput);
    if (isNaN(date.getTime())) return null;
    
    const lunar = getLunarDate(date);
    if (!lunar) return null;

    // Định dạng thứ
    const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayOfWeek = dayNames[date.getDay()];
    
    // Định dạng ngày Dương lịch: DD/MM/YYYY
    const pad = (n) => n.toString().padStart(2, '0');
    const solarStr = `${dayOfWeek}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

    // Chi tiết giờ hoàng đạo
    const luckyHours = lunar.getLuckyHours() || [];
    const luckyHoursStr = luckyHours
        .map(h => `${h.name} (${pad(h.time[0])}h-${pad(h.time[1])}h)`)
        .join(', ');

    return {
        solarStr,
        lunarDay: lunar.day,
        lunarMonth: lunar.month,
        lunarYear: lunar.year,
        isLeapMonth: lunar.leap_month,
        yearName: lunar.getYearName(),
        monthName: lunar.getMonthName(),
        dayName: lunar.getDayName(),
        solarTerm: lunar.getSolarTerm(),
        luckyHoursStr,
        fullLunarStr: `Ngày ${lunar.day} tháng ${lunar.month}${lunar.leap_month ? ' Nhuận' : ''} năm ${lunar.getYearName()}`
    };
};
