import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Chip,
    Card,
    CardContent,
    Typography,
    Stack,
    IconButton,
    Alert,
    Tabs,
    Tab,
    FormControlLabel,
    Checkbox,
    CircularProgress
} from '@mui/material';
import { toast } from 'sonner';
import axios from 'axios';
import {
    getWeddingDatesInMonth,
    checkKimLau,
    getCanChiByYear,
    generateConsultingText
} from '../utils/weddingDateUtils';
import {
    formatLunarDateFull,
    convertLunarToSolar,
    getDetailedLunarInfo
} from '../utils/lunarDateUtils';

export default function SystemClockCalendarModal({
    open,
    onClose,
    defaultTab = 0,
    initialYear = new Date().getFullYear(),
    initialMonth = new Date().getMonth() + 1
}) {
    // 0: Ngày đẹp Cưới Hỏi, 1: Chuyển đổi Lịch Âm, 2: Giờ của Server
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Đồng bộ lại tab mỗi khi mở modal
    useEffect(() => {
        if (open) {
            setActiveTab(defaultTab);
        }
    }, [open, defaultTab]);

    // ==========================================
    // TAB 1: NGÀY ĐẸP CƯỚI HỎI (TỪ LỊCH CỬA HÀNG)
    // ==========================================
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [groomYear, setGroomYear] = useState('');
    const [brideYear, setBrideYear] = useState('');
    const [starFilter, setStarFilter] = useState(1); // 1: Tất cả, 4: >= 4 sao, 5: 5 sao
    const [viewTab, setViewTab] = useState(0); // 0: Dạng thẻ, 1: Dạng bảng

    const groomCanChi = useMemo(() => getCanChiByYear(groomYear), [groomYear]);
    const brideCanChi = useMemo(() => getCanChiByYear(brideYear), [brideYear]);
    const kimLau = useMemo(() => brideYear ? checkKimLau(brideYear, selectedYear) : null, [brideYear, selectedYear]);

    const allDates = useMemo(() => {
        return getWeddingDatesInMonth(selectedYear, selectedMonth, groomYear ? Number(groomYear) : null, brideYear ? Number(brideYear) : null, 1);
    }, [selectedYear, selectedMonth, groomYear, brideYear]);

    const filteredDates = useMemo(() => {
        return allDates.filter(d => d.stars >= starFilter);
    }, [allDates, starFilter]);

    const stats = useMemo(() => {
        const daiCat = allDates.filter(d => d.stars === 5).length;
        const tot = allDates.filter(d => d.stars === 4).length;
        const kha = allDates.filter(d => d.stars === 3).length;
        const avoids = allDates.filter(d => d.stars <= 2).length;
        return { daiCat, tot, kha, avoids, total: allDates.length };
    }, [allDates]);

    const handleCopySingle = (dateInfo) => {
        const text = generateConsultingText(dateInfo);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            toast.success(`Đã sao chép tư vấn ngày ${dateInfo.solarStr}!`);
        } else {
            toast.error('Trình duyệt không hỗ trợ sao chép tự động.');
        }
    };

    const handleCopyMonthSummary = () => {
        const goodDates = allDates.filter(d => d.stars >= 4);
        if (goodDates.length === 0) {
            toast.warning('Không có ngày đẹp (>= 4 sao) trong tháng này.');
            return;
        }

        let text = `💍 TỔNG HỢP NGÀY ĐẸP CƯỚI HỎI THÁNG ${selectedMonth}/${selectedYear} 💍\n`;
        if (groomCanChi || brideCanChi) {
            text += `👥 Cặp đôi: ${groomCanChi ? `Chú rể ${groomCanChi.name} (${groomYear})` : ''} ${brideCanChi ? `- Cô dâu ${brideCanChi.name} (${brideYear})` : ''}\n`;
        }
        text += `--------------------------------------------------\n\n`;

        goodDates.forEach((d, idx) => {
            text += `${idx + 1}. ${d.solarStr} (${d.fullLunarStr})\n`;
            text += `   ⭐ Đánh giá: ${'⭐'.repeat(d.stars)} [${d.ratingLabel}]\n`;
            text += `   🔮 Trực: ${d.truc.name} | ${d.hoangDao.name}\n`;
            if (d.positivePoints.length > 0) {
                text += `   ✅ Lý do: ${d.positivePoints.join(', ')}\n`;
            }
            text += `   ⏰ Giờ Hoàng Đạo: ${d.luckyHoursStr}\n\n`;
        });

        text += `--------------------------------------------------\n`;
        text += `Studio LONG WEDDING chúc hai bạn lựa chọn được ngày lành ngập tràn may mắn & hạnh phúc!`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            toast.success(`Đã sao chép danh sách ${goodDates.length} ngày đẹp Tháng ${selectedMonth}/${selectedYear}!`);
        }
    };

    // ==========================================
    // TAB 2: CHUYỂN ĐỔI LỊCH ÂM - DƯƠNG
    // ==========================================
    const [lunarConvertTab, setLunarConvertTab] = useState(0); // 0: Dương -> Âm, 1: Âm -> Dương
    const [solarInputDate, setSolarInputDate] = useState(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    });

    const [lunarInputDay, setLunarInputDay] = useState(new Date().getDate());
    const [lunarInputMonth, setLunarInputMonth] = useState(new Date().getMonth() + 1);
    const [lunarInputYear, setLunarInputYear] = useState(new Date().getFullYear());
    const [lunarInputLeap, setLunarInputLeap] = useState(false);

    const solarToLunarDetails = useMemo(() => {
        if (!solarInputDate) return null;
        return getDetailedLunarInfo(solarInputDate);
    }, [solarInputDate]);

    const lunarToSolarResult = useMemo(() => {
        const solarDateObj = convertLunarToSolar(lunarInputDay, lunarInputMonth, lunarInputYear, lunarInputLeap);
        if (!solarDateObj) return null;
        return {
            solarDateObj,
            details: getDetailedLunarInfo(solarDateObj)
        };
    }, [lunarInputDay, lunarInputMonth, lunarInputYear, lunarInputLeap]);

    // ==========================================
    // TAB 3: GIỜ CỦA SERVER & HIỆU CHUẨN
    // ==========================================
    const [serverOffsetMs, setServerOffsetMs] = useState(0);
    const [latencyMs, setLatencyMs] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Timer nhịp đập 1 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Giờ server tính theo offset
    const currentServerDate = useMemo(() => {
        return new Date(currentTime.getTime() + serverOffsetMs);
    }, [currentTime, serverOffsetMs]);

    // Hàm đồng bộ giờ từ máy chủ
    const syncServerTime = useCallback(async () => {
        setIsSyncing(true);
        const tStart = performance.now();
        let synced = false;

        // 1. Thử gửi request đến API backend của hệ thống
        try {
            const apiBase = process.env.REACT_APP_API_URL || 'https://api.longwedding.vn';
            const res = await axios.get(`${apiBase}/auth/findUsers`, {
                timeout: 4000,
                headers: { 'Cache-Control': 'no-cache' }
            });
            const tEnd = performance.now();
            const measuredPing = Math.round(tEnd - tStart);
            setLatencyMs(measuredPing);

            const serverDateHeader = res.headers && (res.headers['date'] || res.headers['Date']);
            if (serverDateHeader) {
                const sTime = new Date(serverDateHeader).getTime() + Math.round(measuredPing / 2);
                const offset = sTime - Date.now();
                setServerOffsetMs(offset);
                setLastSyncTime(new Date());
                synced = true;
                toast.success(`Đã đồng bộ giờ từ máy chủ Studio (${measuredPing}ms)`);
            }
        } catch (err) {
            const tEnd = performance.now();
            const measuredPing = Math.round(tEnd - tStart);
            setLatencyMs(measuredPing);

            if (err.response && err.response.headers && (err.response.headers['date'] || err.response.headers['Date'])) {
                const dateHeader = err.response.headers['date'] || err.response.headers['Date'];
                const sTime = new Date(dateHeader).getTime() + Math.round(measuredPing / 2);
                const offset = sTime - Date.now();
                setServerOffsetMs(offset);
                setLastSyncTime(new Date());
                synced = true;
                toast.success(`Đã đồng bộ giờ máy chủ thành công (${measuredPing}ms)`);
            }
        }

        // 2. Dự phòng: Nếu CORS chặn Header Date, truy vấn timeapi chuẩn Asia/Ho_Chi_Minh
        if (!synced) {
            try {
                const timeRes = await axios.get('https://timeapi.io/api/time/current/zone?timeZone=Asia%2FHo_Chi_Minh', { timeout: 5000 });
                if (timeRes.data && timeRes.data.dateTime) {
                    const serverDt = new Date(timeRes.data.dateTime).getTime();
                    const offset = serverDt - Date.now();
                    setServerOffsetMs(offset);
                    setLastSyncTime(new Date());
                    synced = true;
                    toast.success('Đã hiệu chuẩn giờ chuẩn Việt Nam GMT+7 thành công!');
                }
            } catch (fallbackErr) {
                console.warn("Dự phòng timeapi không phản hồi:", fallbackErr);
            }
        }

        if (!synced) {
            // Giữ offset hiện tại hoặc 0
            setLastSyncTime(new Date());
            toast.info('Hệ thống đang hoạt động với giờ thiết bị chuẩn.');
        }

        setIsSyncing(false);
    }, []);

    // Tự động đồng bộ giờ khi mở tab 2 (Giờ server)
    useEffect(() => {
        if (open && activeTab === 2 && !lastSyncTime) {
            syncServerTime();
        }
    }, [open, activeTab, lastSyncTime, syncServerTime]);

    // Định dạng giờ hiển thị
    const formatTime24 = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const formatDateVN = (d) => {
        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const pad = (n) => String(n).padStart(2, '0');
        return `${dayNames[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '20px',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header Dialog */}
            <DialogTitle style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: '#fff',
                padding: '18px 24px',
                position: 'relative',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                boxShadow: '0 4px 12px rgba(236,72,153,0.35)'
                            }}
                        >
                            <i className="fa-solid fa-clock" style={{ fontSize: '1.25rem' }}></i>
                        </Box>
                        <Box>
                            <Typography variant="h6" style={{ fontWeight: 800, letterSpacing: '0.3px', lineHeight: 1.2 }}>
                                TIỆN ÍCH LỊCH & THỜI GIAN HỆ THỐNG
                            </Typography>
                            <Typography variant="caption" style={{ color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                                Ngày đẹp phong thủy • Chuyển đổi Âm - Dương • Giờ chuẩn máy chủ
                            </Typography>
                        </Box>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ color: '#94a3b8', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                        <i className="fa-solid fa-xmark" style={{ fontSize: '1.2rem' }}></i>
                    </IconButton>
                </Box>

                {/* Tabs điều hướng chính */}
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    sx={{
                        mt: 2,
                        minHeight: 44,
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#ec4899',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        },
                        '& .MuiTab-root': {
                            color: '#94a3b8',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            minHeight: 44,
                            py: 1,
                            px: 2,
                            transition: 'all 0.2s',
                            '&.Mui-selected': {
                                color: '#38bdf8'
                            }
                        }
                    }}
                >
                    <Tab
                        icon={<i className="fa-solid fa-heart" style={{ marginRight: 6, color: activeTab === 0 ? '#ec4899' : undefined }}></i>}
                        iconPosition="start"
                        label="Ngày đẹp Cưới Hỏi"
                    />
                    <Tab
                        icon={<i className="fa-solid fa-moon" style={{ marginRight: 6, color: activeTab === 1 ? '#fbbf24' : undefined }}></i>}
                        iconPosition="start"
                        label="Chuyển đổi Lịch Âm"
                    />
                    <Tab
                        icon={<i className="fa-solid fa-server" style={{ marginRight: 6, color: activeTab === 2 ? '#10b981' : undefined }}></i>}
                        iconPosition="start"
                        label="Giờ của Server"
                    />
                </Tabs>
            </DialogTitle>

            {/* Nội dung chi tiết các Tabs */}
            <DialogContent style={{ padding: '20px 24px', backgroundColor: '#f8fafc' }}>
                {/* ================================================= */}
                {/* TAB 0: NGÀY ĐẸP CƯỚI HỎI                           */}
                {/* ================================================= */}
                {activeTab === 0 && (
                    <Box>
                        {/* Bộ lọc tháng, năm, tuổi */}
                        <Box
                            p={2}
                            mb={2}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '14px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                            }}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6} sm={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Tháng Dương</InputLabel>
                                        <Select
                                            value={selectedMonth}
                                            label="Tháng Dương"
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Năm Dương</InputLabel>
                                        <Select
                                            value={selectedYear}
                                            label="Năm Dương"
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        >
                                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                                                <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        label="Năm sinh Chú Rể"
                                        placeholder="VD: 1996"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={groomYear}
                                        onChange={(e) => setGroomYear(e.target.value)}
                                        helperText={groomCanChi ? `Can Chi: ${groomCanChi.name}` : ''}
                                    />
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        label="Năm sinh Cô Dâu"
                                        placeholder="VD: 1998"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={brideYear}
                                        onChange={(e) => setBrideYear(e.target.value)}
                                        helperText={brideCanChi ? `Can Chi: ${brideCanChi.name}` : ''}
                                    />
                                </Grid>
                            </Grid>

                            {/* Tiêu chí lọc sao & Nút sao chép */}
                            <Box display="flex" flexWrap="wrap" gap={1.5} mt={2} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Typography variant="body2" style={{ fontWeight: 700, color: '#475569' }}>
                                        Lọc:
                                    </Typography>
                                    <Chip
                                        label="Tất cả ngày"
                                        color={starFilter === 1 ? "primary" : "default"}
                                        onClick={() => setStarFilter(1)}
                                        clickable
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Chip
                                        label="⭐ Ngày Đẹp (≥ 4 sao)"
                                        color={starFilter === 4 ? "secondary" : "default"}
                                        onClick={() => setStarFilter(4)}
                                        clickable
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Chip
                                        label="🌟 Đại Cát (5 sao)"
                                        color={starFilter === 5 ? "success" : "default"}
                                        onClick={() => setStarFilter(5)}
                                        clickable
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Stack>

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    onClick={handleCopyMonthSummary}
                                    startIcon={<i className="fa-solid fa-copy"></i>}
                                    style={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                                >
                                    Sao chép tháng {selectedMonth}/{selectedYear}
                                </Button>
                            </Box>
                        </Box>

                        {/* Cảnh báo Kim Lâu */}
                        {kimLau && (
                            <Box mb={2}>
                                {kimLau.isKimLau ? (
                                    <Alert severity="warning" style={{ borderRadius: '10px' }}>
                                        <strong>Cảnh báo Kim Lâu:</strong> Cô dâu sinh năm {brideYear} ({brideCanChi?.name}) năm {selectedYear} được {kimLau.lunarAge} tuổi Âm ➔ <strong>{kimLau.typeName}</strong>. {kimLau.advice}
                                    </Alert>
                                ) : (
                                    <Alert severity="success" style={{ borderRadius: '10px' }}>
                                        <strong>Tuổi Cô Dâu:</strong> Cô dâu sinh năm {brideYear} ({brideCanChi?.name}) năm {selectedYear} được {kimLau.lunarAge} tuổi Âm ➔ Không phạm Kim Lâu, rất đẹp để làm lễ cưới hỏi!
                                    </Alert>
                                )}
                            </Box>
                        )}

                        {/* Thống kê nhanh */}
                        <Box
                            display="flex"
                            gap={1.5}
                            mb={2}
                            p={1.5}
                            style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        >
                            <Box flex={1} textAlign="center">
                                <Typography variant="caption" color="textSecondary">Tổng số ngày</Typography>
                                <Typography variant="h6" fontWeight="bold">{stats.total}</Typography>
                            </Box>
                            <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #f1f5f9' }}>
                                <Typography variant="caption" style={{ color: '#ec4899', fontWeight: 'bold' }}>🌟 Đại Cát (5★)</Typography>
                                <Typography variant="h6" fontWeight="bold" style={{ color: '#ec4899' }}>{stats.daiCat}</Typography>
                            </Box>
                            <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #f1f5f9' }}>
                                <Typography variant="caption" style={{ color: '#10b981', fontWeight: 'bold' }}>⭐ Ngày Tốt (4★)</Typography>
                                <Typography variant="h6" fontWeight="bold" style={{ color: '#10b981' }}>{stats.tot}</Typography>
                            </Box>
                            <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #f1f5f9' }}>
                                <Typography variant="caption" color="textSecondary">Khá (3★)</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">{stats.kha}</Typography>
                            </Box>
                            <Box flex={1} textAlign="center" style={{ borderLeft: '1px solid #f1f5f9' }}>
                                <Typography variant="caption" color="error">Kỵ / Tránh</Typography>
                                <Typography variant="h6" fontWeight="bold" color="error">{stats.avoids}</Typography>
                            </Box>
                        </Box>

                        {/* Tabs chế độ xem Thẻ / Bảng */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#334155' }}>
                                Danh sách ngày đẹp Tháng {selectedMonth}/{selectedYear} ({filteredDates.length} ngày)
                            </Typography>
                            <Tabs value={viewTab} onChange={(_, v) => setViewTab(v)} size="small">
                                <Tab label="Dạng Thẻ" style={{ textTransform: 'none', fontWeight: 700 }} />
                                <Tab label="Dạng Bảng" style={{ textTransform: 'none', fontWeight: 700 }} />
                            </Tabs>
                        </Box>

                        {/* Danh sách thẻ hoặc bảng */}
                        {filteredDates.length === 0 ? (
                            <Box textAlign="center" py={4} color="#888">
                                Không có ngày phù hợp với tiêu chí lọc đã chọn.
                            </Box>
                        ) : viewTab === 0 ? (
                            /* DẠNG THẺ */
                            <Grid container spacing={2}>
                                {filteredDates.map((item, idx) => (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <Card style={{
                                            borderRadius: '12px',
                                            border: item.stars >= 4 ? `2px solid ${item.badgeColor}` : '1px solid #e2e8f0',
                                            boxShadow: item.stars >= 4 ? '0 4px 12px rgba(236,72,153,0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
                                            position: 'relative'
                                        }}>
                                            <CardContent style={{ padding: '16px' }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                                    <Box>
                                                        <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0f172a' }}>
                                                            {item.solarStr}
                                                        </Typography>
                                                        <Typography variant="caption" style={{ color: '#d97706', fontWeight: 700, display: 'block' }}>
                                                            🌙 {item.fullLunarStr}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={`${'★'.repeat(item.stars)} ${item.ratingLabel}`}
                                                        size="small"
                                                        style={{
                                                            backgroundColor: item.badgeColor,
                                                            color: '#fff',
                                                            fontWeight: 800,
                                                            fontSize: '0.72rem'
                                                        }}
                                                    />
                                                </Box>

                                                <Box display="flex" gap={0.8} flexWrap="wrap" my={1}>
                                                    <Chip label={`Trực ${item.truc.name}`} variant="outlined" size="small" color={item.truc.isGood ? "success" : "default"} />
                                                    <Chip label={item.hoangDao.name} variant="outlined" size="small" color={item.hoangDao.isHoangDao ? "secondary" : "default"} />
                                                    <Chip label={`Ngày ${item.dayName}`} variant="outlined" size="small" />
                                                </Box>

                                                {(item.groomRelation || item.brideRelation) && (
                                                    <Box display="flex" gap={0.8} my={0.8} flexWrap="wrap">
                                                        {item.groomRelation && (
                                                            <Chip
                                                                label={`Chú rể: ${item.groomRelation.text}`}
                                                                size="small"
                                                                color={item.groomRelation.type === 'hop' ? 'success' : item.groomRelation.type === 'xung' ? 'error' : 'default'}
                                                            />
                                                        )}
                                                        {item.brideRelation && (
                                                            <Chip
                                                                label={`Cô dâu: ${item.brideRelation.text}`}
                                                                size="small"
                                                                color={item.brideRelation.type === 'hop' ? 'success' : item.brideRelation.type === 'xung' ? 'error' : 'default'}
                                                            />
                                                        )}
                                                    </Box>
                                                )}

                                                {item.positivePoints.length > 0 && (
                                                    <Box mt={1} style={{ fontSize: '0.8rem', color: '#16a34a' }}>
                                                        <strong>Tốt:</strong> {item.positivePoints.join(', ')}
                                                    </Box>
                                                )}
                                                {item.warningPoints.length > 0 && (
                                                    <Box mt={0.5} style={{ fontSize: '0.8rem', color: '#dc2626' }}>
                                                        <strong>Lưu ý:</strong> {item.warningPoints.join(', ')}
                                                    </Box>
                                                )}

                                                <Box mt={1} pt={1} style={{ borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#475569' }}>
                                                    ⏰ <strong>Giờ đẹp:</strong> {item.luckyHoursStr}
                                                </Box>

                                                <Box display="flex" justifyContent="flex-end" mt={1.5}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleCopySingle(item)}
                                                        startIcon={<i className="fa-solid fa-copy"></i>}
                                                        style={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}
                                                    >
                                                        Sao chép tư vấn
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            /* DẠNG BẢNG */
                            <Box style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 14px' }}>Ngày Dương</th>
                                            <th style={{ padding: '10px 14px' }}>Ngày Âm</th>
                                            <th style={{ padding: '10px 14px' }}>Đánh giá</th>
                                            <th style={{ padding: '10px 14px' }}>Trực & Hoàng đạo</th>
                                            <th style={{ padding: '10px 14px' }}>Giờ Hoàng Đạo</th>
                                            <th style={{ padding: '10px 14px', textAlign: 'right' }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDates.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '10px 14px', fontWeight: 700 }}>
                                                    {item.solarStr}
                                                    {item.isWeekend && <span style={{ color: '#ec4899', marginLeft: '6px' }}>(Cuối tuần)</span>}
                                                </td>
                                                <td style={{ padding: '10px 14px', color: '#d97706', fontWeight: 600 }}>
                                                    {item.lunarStr}
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Ngày {item.dayName}</div>
                                                </td>
                                                <td style={{ padding: '10px 14px' }}>
                                                    <Chip
                                                        label={`${'★'.repeat(item.stars)} ${item.ratingLabel}`}
                                                        size="small"
                                                        style={{ backgroundColor: item.badgeColor, color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '10px 14px' }}>
                                                    <div>Trực {item.truc.name} - {item.hoangDao.name}</div>
                                                    {item.warningPoints.length > 0 && (
                                                        <div style={{ color: '#dc2626', fontSize: '0.72rem' }}>{item.warningPoints[0]}</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#475569' }}>
                                                    {item.luckyHoursStr}
                                                </td>
                                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleCopySingle(item)}
                                                        title="Sao chép văn bản tư vấn"
                                                    >
                                                        <i className="fa-solid fa-copy"></i>
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        )}
                    </Box>
                )}

                {/* ================================================= */}
                {/* TAB 1: CHUYỂN ĐỔI LỊCH ÂM                           */}
                {/* ================================================= */}
                {activeTab === 1 && (
                    <Box>
                        {/* Tab con: Dương sang Âm hoặc Âm sang Dương */}
                        <Box display="flex" gap={1.5} mb={2.5}>
                            <Button
                                variant={lunarConvertTab === 0 ? "contained" : "outlined"}
                                color="primary"
                                onClick={() => setLunarConvertTab(0)}
                                style={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
                            >
                                ☀️ Dương lịch ➔ 🌙 Âm lịch
                            </Button>
                            <Button
                                variant={lunarConvertTab === 1 ? "contained" : "outlined"}
                                color="secondary"
                                onClick={() => setLunarConvertTab(1)}
                                style={{ flex: 1, textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
                            >
                                🌙 Âm lịch ➔ ☀️ Dương lịch
                            </Button>
                        </Box>

                        {lunarConvertTab === 0 ? (
                            /* DƯƠNG SANG ÂM */
                            <Box display="flex" flexDirection="column" gap={2}>
                                <TextField
                                    label="Chọn ngày Dương lịch cần tra cứu"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    value={solarInputDate}
                                    onChange={(e) => setSolarInputDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ bgcolor: '#fff', borderRadius: '8px' }}
                                />

                                {solarToLunarDetails ? (
                                    <Box
                                        p={2.5}
                                        style={{
                                            backgroundColor: '#fff',
                                            borderRadius: '14px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} pb={1} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#0284c7' }}>
                                                ✨ KẾT QUẢ ĐỔI SANG ÂM LỊCH
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => {
                                                    const copyStr = `Dương lịch: ${solarToLunarDetails.solarStr}\nÂm lịch: ${solarToLunarDetails.fullLunarStr}\nCan Chi: Ngày ${solarToLunarDetails.dayName}, tháng ${solarToLunarDetails.monthName}, năm ${solarToLunarDetails.yearName}\nTiết khí: ${solarToLunarDetails.solarTerm || 'Không có'}\nGiờ hoàng đạo: ${solarToLunarDetails.luckyHoursStr}`;
                                                    navigator.clipboard?.writeText(copyStr);
                                                    toast.success('Đã sao chép kết quả chuyển đổi!');
                                                }}
                                                startIcon={<i className="fa-solid fa-copy"></i>}
                                                style={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                                            >
                                                Sao chép
                                            </Button>
                                        </Box>

                                        <Grid container spacing={1.5} style={{ fontSize: '0.92rem' }}>
                                            <Grid item xs={12} sm={6}>
                                                <Box p={1.5} bgcolor="#f8fafc" borderRadius="8px" border="1px solid #e2e8f0">
                                                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Dương lịch:</span>
                                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: '2px' }}>
                                                        {solarToLunarDetails.solarStr}
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box p={1.5} bgcolor="#fffbeb" borderRadius="8px" border="1px solid #fef3c7">
                                                    <span style={{ color: '#b45309', fontSize: '0.8rem' }}>Âm lịch tương ứng:</span>
                                                    <div style={{ fontWeight: 800, color: '#d97706', fontSize: '1.05rem', marginTop: '2px' }}>
                                                        {solarToLunarDetails.fullLunarStr}
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box p={1.5} bgcolor="#f0fdf4" borderRadius="8px" border="1px solid #dcfce7">
                                                    <span style={{ color: '#15803d', fontSize: '0.8rem' }}>Can Chi ngày - tháng - năm:</span>
                                                    <div style={{ fontWeight: 700, color: '#166534', marginTop: '2px' }}>
                                                        Ngày <strong>{solarToLunarDetails.dayName}</strong>, Tháng <strong>{solarToLunarDetails.monthName}</strong>, Năm <strong>{solarToLunarDetails.yearName}</strong>
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box p={1.5} bgcolor="#faf5ff" borderRadius="8px" border="1px solid #f3e8ff">
                                                    <span style={{ color: '#7e22ce', fontSize: '0.8rem' }}>Tiết khí:</span>
                                                    <div style={{ fontWeight: 700, color: '#6b21a8', marginTop: '2px' }}>
                                                        {solarToLunarDetails.solarTerm || 'Không có tiết khí đặc biệt'}
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box p={1.5} bgcolor="#fff7ed" borderRadius="8px" border="1px solid #ffedd5">
                                                    <span style={{ color: '#c2410c', fontSize: '0.8rem' }}>⏰ Các khung Giờ Hoàng Đạo trong ngày:</span>
                                                    <div style={{ fontWeight: 600, color: '#9a3412', marginTop: '4px', lineHeight: 1.5 }}>
                                                        {solarToLunarDetails.luckyHoursStr || 'Không có'}
                                                    </div>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Box textAlign="center" py={3} color="#94a3b8">
                                        Vui lòng chọn ngày Dương lịch hợp lệ.
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            /* ÂM SANG DƯƠNG */
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box display="flex" gap={1.5} flexWrap="wrap">
                                    <FormControl style={{ flex: 1, minWidth: 90 }} size="small">
                                        <InputLabel>Ngày Âm</InputLabel>
                                        <Select
                                            value={lunarInputDay}
                                            label="Ngày Âm"
                                            onChange={(e) => setLunarInputDay(Number(e.target.value))}
                                            sx={{ bgcolor: '#fff' }}
                                        >
                                            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                                                <MenuItem key={d} value={d}>Ngày {d}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl style={{ flex: 1, minWidth: 100 }} size="small">
                                        <InputLabel>Tháng Âm</InputLabel>
                                        <Select
                                            value={lunarInputMonth}
                                            label="Tháng Âm"
                                            onChange={(e) => setLunarInputMonth(Number(e.target.value))}
                                            sx={{ bgcolor: '#fff' }}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Năm Âm lịch"
                                        type="number"
                                        size="small"
                                        style={{ flex: 1.2, minWidth: 110 }}
                                        value={lunarInputYear}
                                        onChange={(e) => setLunarInputYear(parseInt(e.target.value) || new Date().getFullYear())}
                                        inputProps={{ min: 1900, max: 2100 }}
                                        sx={{ bgcolor: '#fff' }}
                                    />
                                </Box>

                                <Box display="flex" alignItems="center">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={lunarInputLeap}
                                                onChange={(e) => setLunarInputLeap(e.target.checked)}
                                                color="secondary"
                                            />
                                        }
                                        label={<span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Tháng âm lịch nhuận</span>}
                                    />
                                </Box>

                                {lunarToSolarResult && lunarToSolarResult.details ? (
                                    <Box
                                        p={2.5}
                                        style={{
                                            backgroundColor: '#fff',
                                            borderRadius: '14px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} pb={1} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#db2777' }}>
                                                ✨ KẾT QUẢ ĐỔI SANG DƯƠNG LỊCH
                                            </Typography>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => {
                                                    const copyStr = `Ngày Âm đã chọn: Ngày ${lunarInputDay} tháng ${lunarInputMonth}${lunarInputLeap ? ' Nhuận' : ''} năm ${lunarInputYear}\nDương lịch tương ứng: ${lunarToSolarResult.details.solarStr}\nCan Chi: Ngày ${lunarToSolarResult.details.dayName}, tháng ${lunarToSolarResult.details.monthName}, năm ${lunarToSolarResult.details.yearName}\nGiờ hoàng đạo: ${lunarToSolarResult.details.luckyHoursStr}`;
                                                    navigator.clipboard?.writeText(copyStr);
                                                    toast.success('Đã sao chép kết quả chuyển đổi!');
                                                }}
                                                startIcon={<i className="fa-solid fa-copy"></i>}
                                                style={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                                            >
                                                Sao chép
                                            </Button>
                                        </Box>

                                        <Grid container spacing={1.5} style={{ fontSize: '0.92rem' }}>
                                            <Grid item xs={12} sm={6}>
                                                <Box p={1.5} bgcolor="#fdf2f8" borderRadius="8px" border="1px solid #fce7f3">
                                                    <span style={{ color: '#be185d', fontSize: '0.8rem' }}>Dương lịch tương ứng:</span>
                                                    <div style={{ fontWeight: 800, color: '#db2777', fontSize: '1.1rem', marginTop: '2px' }}>
                                                        {lunarToSolarResult.details.solarStr}
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box p={1.5} bgcolor="#fffbeb" borderRadius="8px" border="1px solid #fef3c7">
                                                    <span style={{ color: '#b45309', fontSize: '0.8rem' }}>Âm lịch đầy đủ:</span>
                                                    <div style={{ fontWeight: 700, color: '#d97706', fontSize: '1.05rem', marginTop: '2px' }}>
                                                        {lunarToSolarResult.details.fullLunarStr}
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box p={1.5} bgcolor="#f0fdf4" borderRadius="8px" border="1px solid #dcfce7">
                                                    <span style={{ color: '#15803d', fontSize: '0.8rem' }}>Can Chi ngày:</span>
                                                    <div style={{ fontWeight: 700, color: '#166534', marginTop: '2px' }}>
                                                        Ngày <strong>{lunarToSolarResult.details.dayName}</strong>, Tháng <strong>{lunarToSolarResult.details.monthName}</strong>, Năm <strong>{lunarToSolarResult.details.yearName}</strong>
                                                    </div>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box p={1.5} bgcolor="#fff7ed" borderRadius="8px" border="1px solid #ffedd5">
                                                    <span style={{ color: '#c2410c', fontSize: '0.8rem' }}>⏰ Giờ Hoàng Đạo:</span>
                                                    <div style={{ fontWeight: 600, color: '#9a3412', marginTop: '4px' }}>
                                                        {lunarToSolarResult.details.luckyHoursStr}
                                                    </div>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Alert severity="error" style={{ borderRadius: '10px' }}>
                                        Ngày âm lịch này không tồn tại trong năm đã chọn (hoặc tháng này không có ngày nhuận). Vui lòng kiểm tra lại ngày tháng.
                                    </Alert>
                                )}
                            </Box>
                        )}
                    </Box>
                )}

                {/* ================================================= */}
                {/* TAB 2: GIỜ CỦA SERVER & ĐỘ LỆCH MÁY KHÁCH           */}
                {/* ================================================= */}
                {activeTab === 2 && (
                    <Box>
                        {/* Banner đồng hồ số lớn thời gian thực Server */}
                        <Box
                            p={3}
                            mb={2.5}
                            textAlign="center"
                            style={{
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                borderRadius: '16px',
                                color: '#fff',
                                boxShadow: '0 8px 24px rgba(15,23,42,0.3)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                position: 'relative'
                            }}
                        >
                            {/* Trạng thái kết nối live */}
                            <Box display="inline-flex" alignItems="center" gap={1} px={1.5} py={0.5} bgcolor="rgba(16,185,129,0.15)" borderRadius="20px" border="1px solid rgba(16,185,129,0.3)" mb={1.5}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }}></Box>
                                <Typography variant="caption" style={{ color: '#34d399', fontWeight: 700 }}>
                                    HỆ THỐNG MÁY CHỦ ĐANG HOẠT ĐỘNG
                                </Typography>
                            </Box>

                            {/* Đồng hồ số lớn */}
                            <Typography
                                variant="h2"
                                style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 800,
                                    letterSpacing: '2px',
                                    color: '#38bdf8',
                                    textShadow: '0 0 20px rgba(56,189,248,0.4)',
                                    lineHeight: 1.1
                                }}
                            >
                                {formatTime24(currentServerDate)}
                            </Typography>

                            {/* Ngày Dương & Âm của Server */}
                            <Typography variant="subtitle1" style={{ fontWeight: 700, color: '#f8fafc', marginTop: '8px' }}>
                                {formatDateVN(currentServerDate)}
                            </Typography>
                            <Typography variant="body2" style={{ color: '#fbbf24', fontWeight: 600, marginTop: '4px' }}>
                                🌙 Âm lịch: {formatLunarDateFull(currentServerDate)}
                            </Typography>
                            <Typography variant="caption" style={{ color: '#94a3b8', display: 'block', marginTop: '6px' }}>
                                Múi giờ: GMT+7 (Asia/Ho_Chi_Minh - Giờ chuẩn Quốc gia Việt Nam)
                            </Typography>
                        </Box>

                        {/* So sánh Giờ Server vs Giờ Thiết bị */}
                        <Grid container spacing={2} mb={2.5}>
                            {/* Card 1: Giờ Thiết bị khách */}
                            <Grid item xs={12} sm={6}>
                                <Card style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                    <CardContent style={{ padding: '16px' }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <i className="fa-solid fa-laptop" style={{ color: '#64748b' }}></i>
                                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#475569' }}>
                                                Giờ máy tính của bạn (Client)
                                            </Typography>
                                        </Box>
                                        <Typography variant="h5" style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                                            {formatTime24(currentTime)}
                                        </Typography>
                                        <Typography variant="caption" style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                                            {formatDateVN(currentTime)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Card 2: Độ lệch & Ping mạng */}
                            <Grid item xs={12} sm={6}>
                                <Card style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                                    <CardContent style={{ padding: '16px' }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <i className="fa-solid fa-network-wired" style={{ color: '#0284c7' }}></i>
                                            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#475569' }}>
                                                Độ lệch & Độ trễ mạng (Ping)
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="baseline" gap={1}>
                                            <Typography variant="h5" style={{ fontWeight: 800, color: Math.abs(serverOffsetMs) < 2000 ? '#10b981' : '#f59e0b' }}>
                                                {Math.abs(serverOffsetMs) < 1000
                                                    ? 'Chuẩn xác (< 1s)'
                                                    : `${serverOffsetMs > 0 ? '+' : ''}${Math.round(serverOffsetMs / 1000)}s (${serverOffsetMs}ms)`}
                                            </Typography>
                                            {latencyMs !== null && (
                                                <Chip
                                                    label={`Ping: ${latencyMs}ms`}
                                                    size="small"
                                                    color={latencyMs < 100 ? "success" : latencyMs < 300 ? "warning" : "error"}
                                                    sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="caption" style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                                            Máy chủ: {process.env.REACT_APP_API_URL || 'api.longwedding.vn'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Thông báo tình trạng đồng bộ */}
                        {Math.abs(serverOffsetMs) >= 60000 ? (
                            <Alert severity="warning" style={{ borderRadius: '10px', marginBottom: '16px' }}>
                                <strong>Lưu ý:</strong> Đồng hồ trên máy tính của bạn đang lệch hơn 1 phút so với giờ máy chủ. Hãy kiểm tra cài đặt "Set time automatically" trên máy tính để tránh sai sót thời gian tạo hợp đồng!
                            </Alert>
                        ) : (
                            <Alert severity="info" style={{ borderRadius: '10px', marginBottom: '16px' }}>
                                Mọi giao dịch, lịch hẹn và hợp đồng trên hệ thống Long Wedding đều được ghi nhận theo giờ chuẩn máy chủ Việt Nam (GMT+7).
                            </Alert>
                        )}

                        {/* Nút thao tác Đồng bộ */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" style={{ color: '#94a3b8' }}>
                                {lastSyncTime ? `Lần đồng bộ gần nhất: ${formatTime24(lastSyncTime)}` : 'Chưa đồng bộ'}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={syncServerTime}
                                disabled={isSyncing}
                                startIcon={isSyncing ? <CircularProgress size={16} color="inherit" /> : <i className="fa-solid fa-rotate"></i>}
                                style={{
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    padding: '8px 18px',
                                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                                }}
                            >
                                {isSyncing ? 'Đang kiểm tra...' : 'Đồng bộ lại giờ Server'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            {/* Footer Dialog */}
            <DialogActions style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={onClose} color="inherit" style={{ fontWeight: 700, borderRadius: '8px' }}>
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
}
