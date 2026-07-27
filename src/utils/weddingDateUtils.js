import { SolarDate } from 'lunar-date-vn';

// Danh sách Can Chi
export const CAN_LIST = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI_LIST = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// 12 Trực
export const TRUC_LIST = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thâu', 'Khai', 'Bế'];

/**
 * Tính Can Chi năm sinh từ năm Dương lịch
 */
export const getCanChiByYear = (year) => {
    if (!year || isNaN(year)) return null;
    const canIndex = (year - 4) % 10;
    const chiIndex = (year - 4) % 12;
    const can = CAN_LIST[(canIndex + 10) % 10];
    const chi = CHI_LIST[(chiIndex + 12) % 12];
    return {
        can,
        chi,
        name: `${can} ${chi}`,
        canIndex: (canIndex + 10) % 10,
        chiIndex: (chiIndex + 12) % 12
    };
};

/**
 * Tính tuổi âm và kiểm tra Kim Lâu cho Cô Dâu
 */
export const checkKimLau = (brideBirthYear, targetYear = new Date().getFullYear()) => {
    if (!brideBirthYear) return null;
    const lunarAge = (targetYear - Number(brideBirthYear)) + 1;
    const remainder = lunarAge % 9;
    
    // Các tuổi dư 1, 3, 6, 8 phạm Kim Lâu (trừ các tuổi ngoại lệ trong dân gian như 70+)
    const isPham = [1, 3, 6, 8].includes(remainder) && lunarAge < 70;
    
    let typeName = "";
    let advice = "";
    if (remainder === 1) {
        typeName = "Kim Lâu Thân (Kỵ bản thân)";
        advice = "Phạm Kim Lâu Thân. Nếu cưới trong năm nay nên cưới sau ngày Đông Chí hoặc sau sinh nhật Âm lịch của cô dâu.";
    } else if (remainder === 3) {
        typeName = "Kim Lâu Thê (Kỵ chồng)";
        advice = "Phạm Kim Lâu Thê. Nên chọn ngày giờ thật Đại Cát hoặc chờ qua sinh nhật Âm lịch.";
    } else if (remainder === 6) {
        typeName = "Kim Lâu Tử (Kỵ con cái)";
        advice = "Phạm Kim Lâu Tử. Nên cưới hỏi vào các tháng Đại Lợi.";
    } else if (remainder === 8) {
        typeName = "Kim Lâu Súc (Kỵ kinh tế gia đình)";
        advice = "Phạm Kim Lâu Súc. Có thể làm lễ cưới xin dâu hai lần để giải hạn.";
    }

    return {
        lunarAge,
        isKimLau: isPham,
        typeName,
        advice
    };
};

/**
 * Kiểm tra Xung / Hợp giữa 2 Địa Chi
 */
export const checkChiRelationship = (chi1Name, chi2Name) => {
    if (!chi1Name || !chi2Name) return { type: 'neutral', text: '' };
    
    const idx1 = CHI_LIST.indexOf(chi1Name);
    const idx2 = CHI_LIST.indexOf(chi2Name);

    if (idx1 === -1 || idx2 === -1) return { type: 'neutral', text: '' };

    // Lục xung (Xung đối 6 vị trí)
    if (Math.abs(idx1 - idx2) === 6) {
        return { type: 'xung', level: 'heavy', text: `Lục xung (${chi1Name} xung ${chi2Name})` };
    }

    // Tam hợp: (Thân 8, Tý 0, Thìn 4), (Tỵ 5, Dậu 9, Sửu 1), (Dần 2, Ngọ 6, Tuất 10), (Hợi 11, Mão 3, Mùi 7)
    const tamHopGroups = [
        ['Thân', 'Tý', 'Thìn'],
        ['Tỵ', 'Dậu', 'Sửu'],
        ['Dần', 'Ngọ', 'Tuất'],
        ['Hợi', 'Mão', 'Mùi']
    ];
    for (const group of tamHopGroups) {
        if (group.includes(chi1Name) && group.includes(chi2Name)) {
            return { type: 'hop', level: 'tam_hop', text: `Tam Hợp (${chi1Name} hợp ${chi2Name})` };
        }
    }

    // Lục hợp
    const lucHopPairs = [
        ['Tý', 'Sửu'], ['Dần', 'Hợi'], ['Mão', 'Tuất'],
        ['Thìn', 'Dậu'], ['Tỵ', 'Thân'], ['Ngọ', 'Mùi']
    ];
    for (const pair of lucHopPairs) {
        if ((pair[0] === chi1Name && pair[1] === chi2Name) || (pair[1] === chi1Name && pair[0] === chi2Name)) {
            return { type: 'hop', level: 'luc_hop', text: `Lục Hợp (${chi1Name} hợp ${chi2Name})` };
        }
    }

    return { type: 'neutral', text: 'Bình hòa' };
};

/**
 * Tính Trực ngày (12 Trực) dựa theo tháng âm lịch và chi của ngày
 */
export const getTruc = (lunarMonth, dayChiName) => {
    // Tháng 1 (Dần: index 2), Tháng 2 (Mão: index 3), ..., Tháng 11 (Tý: index 0), Tháng 12 (Sửu: index 1)
    const monthChiIndexMap = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]; 
    const monthChiIdx = monthChiIndexMap[lunarMonth] || 0;
    const dayChiIdx = CHI_LIST.indexOf(dayChiName);

    if (dayChiIdx === -1) return { name: 'Bình', isGoodForWedding: true, desc: 'Bình hòa' };

    const trucIdx = (dayChiIdx - monthChiIdx + 12) % 12;
    const trucName = TRUC_LIST[trucIdx];

    // Đánh giá Trực đối với cưới hỏi
    const trucEval = {
        'Thành': { isGood: true, score: 30, desc: 'Trực Thành: Cực kỳ Đại Cát cho cưới hỏi, hôn sự vẹn toàn.' },
        'Định': { isGood: true, score: 25, desc: 'Trực Định: Rất tốt cho việc lập gia thất, đính hôn.' },
        'Khai': { isGood: true, score: 25, desc: 'Trực Khai: Tốt cho mở đầu cuộc sống mới, thành thân.' },
        'Chấp': { isGood: true, score: 20, desc: 'Trực Chấp: Tốt cho lễ ăn hỏi, đính hôn.' },
        'Mãn': { isGood: true, score: 18, desc: 'Trực Mãn: Tròn đầy, dạt dào hạnh phúc.' },
        'Bình': { isGood: true, score: 10, desc: 'Trực Bình: Bình hòa, làm lễ tốt.' },
        'Trừ': { isGood: true, score: 10, desc: 'Trực Trừ: Tẩy trừ điều xấu, dùng được.' },
        'Kiến': { isGood: true, score: 10, desc: 'Trực Kiến: Khởi đầu công việc.' },
        'Nguy': { isGood: false, score: -10, desc: 'Trực Nguy: Nên cẩn trọng.' },
        'Thâu': { isGood: false, score: -15, desc: 'Trực Thâu: Hạn chế nạp tài cưới xin.' },
        'Bế': { isGood: false, score: -25, desc: 'Trực Bế: Không tốt cho lễ cưới hỏi.' },
        'Phá': { isGood: false, score: -40, desc: 'Trực Phá: Tối kỵ cho cưới hỏi, dạm ngõ.' }
    };

    return {
        name: trucName,
        ...(trucEval[trucName] || { isGood: true, score: 0, desc: '' })
    };
};

/**
 * Kiểm tra Ngày Hoàng Đạo
 */
export const checkHoangDao = (lunarMonth, dayChiName) => {
    // Các địa chi Hoàng Đạo theo tháng âm lịch
    const hoangDaoMap = {
        1: ['Tý', 'Sửu', 'Tỵ', 'Mùi', 'Tuất', 'Hợi'],
        7: ['Tý', 'Sửu', 'Tỵ', 'Mùi', 'Tuất', 'Hợi'],
        2: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
        8: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Tuất', 'Hợi'],
        3: ['Tý', 'Sửu', 'Mão', 'Tỵ', 'Mùi', 'Dậu'],
        9: ['Tý', 'Sửu', 'Mão', 'Tỵ', 'Mùi', 'Dậu'],
        4: ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
        10: ['Sửu', 'Thìn', 'Ngọ', 'Mùi', 'Tuất', 'Hợi'],
        5: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
        11: ['Dần', 'Thìn', 'Tỵ', 'Thân', 'Dậu', 'Hợi'],
        6: ['Mão', 'Tỵ', 'Mùi', 'Thân', 'Tuất', 'Hợi'],
        12: ['Mão', 'Tỵ', 'Mùi', 'Thân', 'Tuất', 'Hợi']
    };

    const goodChis = hoangDaoMap[lunarMonth] || [];
    const isHoangDao = goodChis.includes(dayChiName);

    return {
        isHoangDao,
        name: isHoangDao ? 'Ngày Hoàng Đạo' : 'Ngày Hắc Đạo',
        score: isHoangDao ? 30 : -15
    };
};

/**
 * Kiểm tra các ngày kỵ tuyệt đối (Tam Nương, Nguyệt Kỵ, Dương Công Kỵ)
 */
export const checkForbiddenDays = (lunarDay, lunarMonth) => {
    const forbidden = [];

    // Tam Nương: 3, 7, 13, 18, 22, 27
    if ([3, 7, 13, 18, 22, 27].includes(lunarDay)) {
        forbidden.push('Ngày Tam Nương (Tối kỵ cưới hỏi, xuất hành)');
    }

    // Nguyệt Kỵ: 5, 14, 23
    if ([5, 14, 23].includes(lunarDay)) {
        forbidden.push('Ngày Nguyệt Kỵ (Mùng 5, 14, 23 kỵ cưới hỏi)');
    }

    // Dương Công Kỵ Nhật
    const duongCongKyMap = {
        1: 13, 2: 11, 3: 9, 4: 7, 5: 5, 6: 3,
        7: 8, 8: 27, 9: 25, 10: 23, 11: 21, 12: 19
    };
    if (duongCongKyMap[lunarMonth] === lunarDay) {
        forbidden.push('Dương Công Kỵ Nhật (Ngày mụ kỵ hạp hựu)');
    }

    return {
        isForbidden: forbidden.length > 0,
        reasons: forbidden
    };
};

/**
 * Phân tích và đánh giá Ngày Đẹp Cưới Hỏi
 */
export const evaluateWeddingDate = (solarDateInput, groomBirthYear = null, brideBirthYear = null, eventType = 'cuoi_hoi') => {
    const date = new Date(solarDateInput);
    if (isNaN(date.getTime())) return null;

    try {
        const solarDate = new SolarDate(date);
        const lunar = solarDate.toLunarDate();
        if (!lunar) return null;

        const dayOfWeekNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const dayOfWeek = dayOfWeekNames[date.getDay()];

        const pad = (n) => n.toString().padStart(2, '0');
        const solarStr = `${dayOfWeek}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
        
        const dayName = lunar.getDayName(); // e.g. "Đinh Tỵ"
        const monthName = lunar.getMonthName();
        const yearName = lunar.getYearName();

        // Tách lấy Chi của ngày (từ thứ 2: "Đinh Tỵ" -> "Tỵ")
        const dayChiName = dayName ? dayName.split(' ')[1] || dayName : '';

        // 1. Kiểm tra Ngày Kỵ
        const forbidden = checkForbiddenDays(lunar.day, lunar.month);

        // 2. Kiểm tra Hoàng Đạo
        const hoangDao = checkHoangDao(lunar.month, dayChiName);

        // 3. Kiểm tra Trực
        const truc = getTruc(lunar.month, dayChiName);

        // 4. Phân tích Xung / Hợp tuổi Cô Dâu & Chú Rể
        let groomRelation = null;
        let brideRelation = null;
        let groomCanChi = null;
        let brideCanChi = null;

        if (groomBirthYear) {
            groomCanChi = getCanChiByYear(groomBirthYear);
            if (groomCanChi) {
                groomRelation = checkChiRelationship(dayChiName, groomCanChi.chi);
            }
        }

        if (brideBirthYear) {
            brideCanChi = getCanChiByYear(brideBirthYear);
            if (brideCanChi) {
                brideRelation = checkChiRelationship(dayChiName, brideCanChi.chi);
            }
        }

        // Kiểm tra Kim Lâu
        const kimLauInfo = brideBirthYear ? checkKimLau(brideBirthYear, date.getFullYear()) : null;

        // TÍNH ĐIỂM TỔNG HỢP (Base 50 điểm)
        let score = 50;

        if (hoangDao.isHoangDao) score += hoangDao.score;
        else score += hoangDao.score;

        score += truc.score;

        if (forbidden.isForbidden) {
            score -= 50 * forbidden.reasons.length;
        }

        // Điểm Xung / Hợp tuổi
        if (groomRelation) {
            if (groomRelation.type === 'hop') score += 15;
            if (groomRelation.type === 'xung') score -= 25;
        }
        if (brideRelation) {
            if (brideRelation.type === 'hop') score += 15;
            if (brideRelation.type === 'xung') score -= 25;
        }

        // Điểm thưởng cho Ngày Cuối Tuần (Thứ 7, CN) để tiện tổ chức tiệc
        if (date.getDay() === 0 || date.getDay() === 6) {
            score += 5;
        }

        // Quy đổi ra Số Sao (1-5 Stars)
        let stars = 3;
        let ratingLabel = "Khá";
        let badgeColor = "#2196f3"; // Blue

        if (score >= 80 && !forbidden.isForbidden) {
            stars = 5;
            ratingLabel = "Đại Cát (Cực kỳ tốt)";
            badgeColor = "#e91e63"; // Pink / Red
        } else if (score >= 60 && !forbidden.isForbidden) {
            stars = 4;
            ratingLabel = "Tốt (Nên chọn)";
            badgeColor = "#4caf50"; // Green
        } else if (score >= 40 && !forbidden.isForbidden) {
            stars = 3;
            ratingLabel = "Khá (Dùng được)";
            badgeColor = "#1976d2"; // Blue
        } else if (score >= 20 || forbidden.isForbidden) {
            stars = 2;
            ratingLabel = "Trung Bình / Hạn chế";
            badgeColor = "#ff9800"; // Orange
        } else {
            stars = 1;
            ratingLabel = "Kỵ (Nên tránh)";
            badgeColor = "#f44336"; // Red
        }

        // Lấy Giờ Hoàng Đạo
        const luckyHours = lunar.getLuckyHours() || [];
        const luckyHoursStr = luckyHours
            .map(h => `${h.name} (${pad(h.time[0])}h-${pad(h.time[1])}h)`)
            .join(', ');

        // Tổng hợp lý do tốt/xấu
        const positivePoints = [];
        const warningPoints = [];

        if (hoangDao.isHoangDao) positivePoints.push("Ngày Hoàng Đạo (Vừa lòng chư thiên)");
        if (truc.isGood) positivePoints.push(truc.desc);

        if (groomRelation && groomRelation.type === 'hop') positivePoints.push(`Hợp tuổi chú rể (${groomRelation.text})`);
        if (brideRelation && brideRelation.type === 'hop') positivePoints.push(`Hợp tuổi cô dâu (${brideRelation.text})`);

        if (forbidden.isForbidden) {
            forbidden.reasons.forEach(r => warningPoints.push(r));
        }

        if (groomRelation && groomRelation.type === 'xung') warningPoints.push(`Xung tuổi chú rể (${groomRelation.text})`);
        if (brideRelation && brideRelation.type === 'xung') warningPoints.push(`Xung tuổi cô dâu (${brideRelation.text})`);
        if (!hoangDao.isHoangDao) warningPoints.push("Ngày Hắc Đạo");
        if (!truc.isGood) warningPoints.push(truc.desc);

        return {
            solarDateObj: date,
            solarDateStr: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
            solarStr,
            lunarDay: lunar.day,
            lunarMonth: lunar.month,
            lunarYear: lunar.year,
            lunarStr: `Ngày ${lunar.day}/${lunar.month}${lunar.leap_month ? ' (Nhuận)' : ''}`,
            fullLunarStr: `Ngày ${lunar.day} tháng ${lunar.month}${lunar.leap_month ? ' Nhuận' : ''}, năm ${yearName}`,
            dayName,
            monthName,
            yearName,
            dayChiName,
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
            hoangDao,
            truc,
            forbidden,
            score,
            stars,
            ratingLabel,
            badgeColor,
            groomCanChi,
            brideCanChi,
            groomRelation,
            brideRelation,
            kimLauInfo,
            luckyHoursStr,
            positivePoints,
            warningPoints
        };
    } catch (err) {
        console.error("Error evaluating wedding date:", err);
        return null;
    }
};

/**
 * Tổng hợp danh sách ngày đẹp cưới hỏi trong một tháng Dương lịch
 */
export const getWeddingDatesInMonth = (year, month, groomBirthYear = null, brideBirthYear = null, minStars = 1) => {
    const results = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const evalRes = evaluateWeddingDate(dateStr, groomBirthYear, brideBirthYear);
        if (evalRes && evalRes.stars >= minStars) {
            results.push(evalRes);
        }
    }

    // Sắp xếp ngày ưu tiên ngày dương tăng dần
    results.sort((a, b) => a.solarDateObj.getTime() - b.solarDateObj.getTime());

    return results;
};

/**
 * Tạo văn bản tư vấn mẫu để gửi Zalo / SMS cho Dâu Rể
 */
export const generateConsultingText = (weddingDateInfo) => {
    if (!weddingDateInfo) return "";
    
    let text = `💖 LONG WEDDING - TƯ VẤN NGÀY ĐẸP CƯỚI HỎI 💖\n`;
    text += `------------------------------------\n`;
    text += `📅 Dương lịch: ${weddingDateInfo.solarStr}\n`;
    text += `🌙 Âm lịch: ${weddingDateInfo.fullLunarStr}\n`;
    text += `✨ Can Chi: Ngày ${weddingDateInfo.dayName}, Tháng ${weddingDateInfo.monthName}\n`;
    text += `🌟 Đánh giá: ${'⭐'.repeat(weddingDateInfo.stars)} (${weddingDateInfo.ratingLabel})\n`;
    text += `🔮 Trực ngày: ${weddingDateInfo.truc.name} - ${weddingDateInfo.hoangDao.name}\n`;

    if (weddingDateInfo.positivePoints.length > 0) {
        text += `✅ Điểm tốt: ${weddingDateInfo.positivePoints.join('; ')}\n`;
    }

    if (weddingDateInfo.warningPoints.length > 0) {
        text += `⚠️ Lưu ý: ${weddingDateInfo.warningPoints.join('; ')}\n`;
    }

    text += `⏰ Giờ Hoàng Đạo (Giờ đẹp làm lễ): ${weddingDateInfo.luckyHoursStr || 'Đang cập nhật'}\n`;
    text += `------------------------------------\n`;
    text += `Chúc hai bạn chọn được ngày lành tháng tốt, trăm năm hạnh phúc! 💕`;

    return text;
};
