import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import './doanhthu.css';

// Material UI Components
import {
    Box,
    Grid,
    Paper,
    Typography,
    Stack,
    Chip,
    Button,
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    Select,
    MenuItem,
    FormControl,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TablePagination,
    Tabs,
    Tab,
    LinearProgress,
    CircularProgress,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SavingsIcon from '@mui/icons-material/Savings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DiamondIcon from '@mui/icons-material/Diamond';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CategoryIcon from '@mui/icons-material/Category';
import CallIcon from '@mui/icons-material/Call';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Currency & Percentage Formatters
const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
};

const formatShortCurrency = (val) => {
    const num = Number(val) || 0;
    if (Math.abs(num) >= 1000000000) {
        return (num / 1000000000).toFixed(2) + ' Tỷ';
    }
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1) + ' Tr';
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(0) + ' k';
    }
    return num.toLocaleString('vi-VN');
};

const formatPercent = (val) => {
    const num = Number(val) || 0;
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
};

const formatDateOnly = (dateVal) => {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('vi-VN');
};

// =========================================================================
// SCHEDULE KEYS & CLIENT-SIDE EXTRACTION
// =========================================================================

const SCHEDULE_DATE_KEYS = [
    { key: 'ngayChup', label: 'Chụp hình', icon: '📸', className: 'badge-ngayChup' },
    { key: 'ngayAnHoi', label: 'Ăn hỏi', icon: '💍', className: 'badge-ngayAnHoi' },
    { key: 'ngayCuoi', label: 'Ngày cưới', icon: '👰', className: 'badge-ngayCuoi' },
    { key: 'ngayChinhAnh', label: 'Chỉnh ảnh', icon: '🎨', className: 'badge-ngayChinhAnh' },
    { key: 'ngayTraAnh', label: 'Trả ảnh', icon: '🖼️', className: 'badge-ngayTraAnh' },
    { key: 'ngayChuyenInAnh', label: 'Chuyển in', icon: '🖨️', className: 'badge-ngayChuyenInAnh' },
    { key: 'ngayMuonDo', label: 'Mượn đồ', icon: '👗', className: 'badge-ngayMuonDo' },
    { key: 'ngayTraDo', label: 'Trả đồ', icon: '👔', className: 'badge-ngayTraDo' }
];

function extractMatchedSchedulesClient(hd, startDate, endDate) {
    const sTime = new Date(startDate).getTime();
    const eTime = new Date(endDate).getTime();
    const matched = [];

    if (hd.cacNgay) {
        for (const item of SCHEDULE_DATE_KEYS) {
            const val = hd.cacNgay[item.key];
            if (val) {
                const d = new Date(val);
                const t = d.getTime();
                if (!isNaN(t) && t >= sTime && t <= eTime) {
                    matched.push({
                        type: item.key,
                        label: item.label,
                        icon: item.icon,
                        className: item.className,
                        date: d
                    });
                }
            }
        }
    }
    return matched;
}

// =========================================================================
// SMOOTH SPLINE / WAVE PATH GENERATOR (Cubic Bezier Spline)
// =========================================================================

function getSmoothSplinePath(points, yBase) {
    if (!points || points.length === 0) return { linePath: '', areaPath: '' };
    if (points.length === 1) {
        return {
            linePath: `M ${points[0].x},${points[0].y}`,
            areaPath: `M ${points[0].x},${yBase} L ${points[0].x},${points[0].y} L ${points[0].x},${yBase} Z`
        };
    }

    let linePath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 4;
        const cp1y = p1.y + (p2.y - p0.y) / 4;
        const cp2x = p2.x - (p3.x - p1.x) / 4;
        const cp2y = p2.y - (p3.y - p1.y) / 4;

        linePath += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    const firstX = points[0].x.toFixed(1);
    const lastX = points[points.length - 1].x.toFixed(1);
    const areaPath = `${linePath} L ${lastX},${yBase} L ${firstX},${yBase} Z`;

    return { linePath, areaPath };
}

// =========================================================================
// CLIENT-SIDE DATE & CALCULATION ENGINE (ICT UTC+7)
// =========================================================================

function getICTComponents(date = new Date()) {
    const tzOffset = 7 * 60; // ICT is UTC+7
    const localTime = date.getTime() + (date.getTimezoneOffset() * 60000) + (tzOffset * 60000);
    const ictDate = new Date(localTime);
    return {
        year: ictDate.getFullYear(),
        month: ictDate.getMonth(), // 0-11
        date: ictDate.getDate(),
        day: ictDate.getDay(),     // 0 (Sun) - 6 (Sat)
        hours: ictDate.getHours(),
        minutes: ictDate.getMinutes()
    };
}

function makeICTDate(year, month, date, hours = 0, minutes = 0, seconds = 0, ms = 0) {
    const d = new Date(Date.UTC(year, month, date, hours, minutes, seconds, ms));
    d.setUTCHours(d.getUTCHours() - 7);
    return d;
}

function getWeekRangeClient(refDate = new Date(), offset = 0) {
    const ict = getICTComponents(refDate);
    const diffToMonday = ict.date - (ict.day === 0 ? 6 : ict.day - 1) + (offset * 7);
    const startDate = makeICTDate(ict.year, ict.month, diffToMonday, 0, 0, 0, 0);
    const endDate = makeICTDate(ict.year, ict.month, diffToMonday + 6, 23, 59, 59, 999);
    const startIct = getICTComponents(startDate);
    const endIct = getICTComponents(endDate);
    const label = `Tuần ${offset === 0 ? 'này' : offset === -1 ? 'trước' : ''} (${startIct.date}/${startIct.month + 1} - ${endIct.date}/${endIct.month + 1})`;
    return { startDate, endDate, label, type: 'week' };
}

function getMonthRangeClient(refDate = new Date(), offset = 0) {
    const ict = getICTComponents(refDate);
    const targetMonth = ict.month + offset;
    const targetYear = ict.year;
    const startDate = makeICTDate(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const endDate = makeICTDate(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    const startIct = getICTComponents(startDate);
    const label = `Tháng ${startIct.month + 1}/${startIct.year}`;
    return { startDate, endDate, label, type: 'month', month: startIct.month + 1, year: startIct.year };
}

function getQuarterRangeClient(refDate = new Date(), offset = 0) {
    const ict = getICTComponents(refDate);
    const currentQuarter = Math.floor(ict.month / 3) + 1;
    const totalQuarters = (ict.year * 4 + (currentQuarter - 1)) + offset;
    const targetYear = Math.floor(totalQuarters / 4);
    const targetQuarter = (totalQuarters % 4) + 1;
    const startMonth = (targetQuarter - 1) * 3;
    const endMonth = startMonth + 2;

    const startDate = makeICTDate(targetYear, startMonth, 1, 0, 0, 0, 0);
    const endDate = makeICTDate(targetYear, endMonth + 1, 0, 23, 59, 59, 999);
    const label = `Quý ${targetQuarter}/${targetYear}`;
    return { startDate, endDate, label, type: 'quarter', quarter: targetQuarter, year: targetYear };
}

function getYearRangeClient(refDate = new Date(), offset = 0) {
    const ict = getICTComponents(refDate);
    const targetYear = ict.year + offset;
    const startDate = makeICTDate(targetYear, 0, 1, 0, 0, 0, 0);
    const endDate = makeICTDate(targetYear, 11, 31, 23, 59, 59, 999);
    const label = `Năm ${targetYear}`;
    return { startDate, endDate, label, type: 'year', year: targetYear };
}

function calcGrowth(curr = 0, prev = 0) {
    const c = Number(curr) || 0;
    const p = Number(prev) || 0;
    if (p === 0) {
        if (c === 0) return 0;
        return c > 0 ? 100 : -100;
    }
    return Number((((c - p) / Math.abs(p)) * 100).toFixed(1));
}

function getTrend(curr = 0, prev = 0) {
    const c = Number(curr) || 0;
    const p = Number(prev) || 0;
    if (c > p) return 'up';
    if (c < p) return 'down';
    return 'neutral';
}

function buildComparisonClient(curr, prev) {
    return {
        soLuongHopDong: {
            current: curr.soLuongHopDong || 0,
            previous: prev.soLuongHopDong || 0,
            diff: (curr.soLuongHopDong || 0) - (prev.soLuongHopDong || 0),
            growthPercent: calcGrowth(curr.soLuongHopDong, prev.soLuongHopDong),
            trend: getTrend(curr.soLuongHopDong, prev.soLuongHopDong)
        },
        tongTienHopDong: {
            current: curr.tongTienHopDong || 0,
            previous: prev.tongTienHopDong || 0,
            diff: (curr.tongTienHopDong || 0) - (prev.tongTienHopDong || 0),
            growthPercent: calcGrowth(curr.tongTienHopDong, prev.tongTienHopDong),
            trend: getTrend(curr.tongTienHopDong, prev.tongTienHopDong)
        },
        soLuongHopDongTheoLich: {
            current: curr.soLuongHopDongTheoLich || 0,
            previous: prev.soLuongHopDongTheoLich || 0,
            diff: (curr.soLuongHopDongTheoLich || 0) - (prev.soLuongHopDongTheoLich || 0),
            growthPercent: calcGrowth(curr.soLuongHopDongTheoLich, prev.soLuongHopDongTheoLich),
            trend: getTrend(curr.soLuongHopDongTheoLich, prev.soLuongHopDongTheoLich)
        },
        tongDoanhSoTheoLich: {
            current: curr.tongDoanhSoTheoLich || 0,
            previous: prev.tongDoanhSoTheoLich || 0,
            diff: (curr.tongDoanhSoTheoLich || 0) - (prev.tongDoanhSoTheoLich || 0),
            growthPercent: calcGrowth(curr.tongDoanhSoTheoLich, prev.tongDoanhSoTheoLich),
            trend: getTrend(curr.tongDoanhSoTheoLich, prev.tongDoanhSoTheoLich)
        },
        daThuTheoLich: {
            current: curr.daThuTheoLich || 0,
            previous: prev.daThuTheoLich || 0,
            diff: (curr.daThuTheoLich || 0) - (prev.daThuTheoLich || 0),
            growthPercent: calcGrowth(curr.daThuTheoLich, prev.daThuTheoLich),
            trend: getTrend(curr.daThuTheoLich, prev.daThuTheoLich)
        },
        conNoTheoLich: {
            current: curr.conNoTheoLich || 0,
            previous: prev.conNoTheoLich || 0,
            diff: (curr.conNoTheoLich || 0) - (prev.conNoTheoLich || 0),
            growthPercent: calcGrowth(curr.conNoTheoLich, prev.conNoTheoLich),
            trend: getTrend(curr.conNoTheoLich, prev.conNoTheoLich)
        },
        soTienDaThu: {
            current: curr.soTienDaThu || 0,
            previous: prev.soTienDaThu || 0,
            diff: (curr.soTienDaThu || 0) - (prev.soTienDaThu || 0),
            growthPercent: calcGrowth(curr.soTienDaThu, prev.soTienDaThu),
            trend: getTrend(curr.soTienDaThu, prev.soTienDaThu)
        },
        soTienConNo: {
            current: curr.soTienConNo || 0,
            previous: prev.soTienConNo || 0,
            diff: (curr.soTienConNo || 0) - (prev.soTienConNo || 0),
            growthPercent: calcGrowth(curr.soTienConNo, prev.soTienConNo),
            trend: getTrend(curr.soTienConNo, prev.soTienConNo)
        },
        tongTienKhoanChi: {
            current: curr.tongTienKhoanChi || 0,
            previous: prev.tongTienKhoanChi || 0,
            diff: (curr.tongTienKhoanChi || 0) - (prev.tongTienKhoanChi || 0),
            growthPercent: calcGrowth(curr.tongTienKhoanChi, prev.tongTienKhoanChi),
            trend: getTrend(curr.tongTienKhoanChi, prev.tongTienKhoanChi)
        },
        laiRong: {
            current: curr.laiRong || 0,
            previous: prev.laiRong || 0,
            diff: (curr.laiRong || 0) - (prev.laiRong || 0),
            growthPercent: calcGrowth(curr.laiRong, prev.laiRong),
            trend: getTrend(curr.laiRong, prev.laiRong)
        }
    };
}

function calculateMetricsFromRaw(contracts = [], expenses = [], startDate, endDate) {
    let soLuongHopDong = 0;
    let tongTienHopDong = 0;
    let daThuCuaHDKy = 0;
    let conNoCuaHDKy = 0;

    const filteredContracts = [];
    const scheduledContracts = [];
    let tongDoanhSoTheoLich = 0;
    let daThuTheoLich = 0;
    let conNoTheoLich = 0;

    contracts.forEach(hd => {
        if (hd.maHopDong === 'CH-CHUNG') return;

        // 1. Hợp đồng ký trong kỳ
        if (hd.ngayHopDong) {
            const d = new Date(hd.ngayHopDong);
            if (d >= startDate && d <= endDate) {
                filteredContracts.push(hd);
                soLuongHopDong++;
                const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
                const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
                const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));

                tongTienHopDong += val;
                daThuCuaHDKy += paid;
                conNoCuaHDKy += debt;
            }
        }

        // 2. Hợp đồng có lịch diễn ra trong kỳ
        const matched = extractMatchedSchedulesClient(hd, startDate, endDate);
        if (matched.length > 0) {
            const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
            const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
            const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));

            tongDoanhSoTheoLich += val;
            daThuTheoLich += paid;
            conNoTheoLich += debt;

            scheduledContracts.push({
                ...hd,
                matchedSchedules: matched
            });
        }
    });

    scheduledContracts.sort((a, b) => {
        const dateA = a.matchedSchedules?.[0]?.date ? new Date(a.matchedSchedules[0].date).getTime() : 0;
        const dateB = b.matchedSchedules?.[0]?.date ? new Date(b.matchedSchedules[0].date).getTime() : 0;
        return dateA - dateB;
    });

    let tongTienKhoanChi = 0;
    const filteredExpenses = [];
    expenses.forEach(ct => {
        if (!ct.date) return;
        const d = new Date(ct.date);
        if (d >= startDate && d <= endDate) {
            filteredExpenses.push(ct);
            tongTienKhoanChi += Number(ct.amount) || 0;
        }
    });

    const laiRong = tongTienHopDong - tongTienKhoanChi;
    const tySuatLaiRong = tongTienHopDong > 0 ? Number(((laiRong / tongTienHopDong) * 100).toFixed(1)) : 0;
    const tyLeThuHoiTheoLich = tongDoanhSoTheoLich > 0 ? Number(((daThuTheoLich / tongDoanhSoTheoLich) * 100).toFixed(1)) : 0;

    return {
        startDate,
        endDate,
        soLuongHopDong,
        tongTienHopDong,
        soTienDaThu: daThuCuaHDKy,
        soTienConNo: conNoCuaHDKy,
        soLuongHopDongTheoLich: scheduledContracts.length,
        tongDoanhSoTheoLich,
        daThuTheoLich,
        conNoTheoLich,
        tyLeThuHoiTheoLich,
        tongTienKhoanChi,
        laiRong,
        tySuatLaiRong,
        filteredContracts,
        scheduledContracts,
        filteredExpenses
    };
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

function DoanhThu() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const { showLoading, hideLoading } = useLoading();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    // Filter States
    const [periodType, setPeriodType] = useState('month'); // 'week' | 'month' | 'quarter' | 'year' | 'custom'
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Active View Tab
    const [activeTab, setActiveTab] = useState(0); // 0: Overview & Charts, 1: Multi-cycle Table, 2: Sale Rankings, 3: Transactions

    // Data State
    const [reportData, setReportData] = useState(null);
    const [rawHopDongs, setRawHopDongs] = useState([]);
    const [rawChiTieus, setRawChiTieus] = useState([]);

    // Fetch report data from server with automatic client-side fallback
    const fetchReport = useCallback(() => {
        showLoading("Đang tính toán báo cáo kinh doanh...");
        const payload = {
            periodType,
            year: selectedYear,
            month: selectedMonth,
            quarter: selectedQuarter,
            startDate: customStartDate,
            endDate: customEndDate
        };

        otherService.getBaoCaoKinhDoanh(payload)
            .then(res => {
                const data = res?.data?.data || res?.data || res;
                if (data && (data.selectedPeriod || data.overview)) {
                    setReportData(data);
                } else {
                    throw new Error("Không có dữ liệu báo cáo từ máy chủ");
                }
            })
            .catch(err => {
                console.warn("Chuyển sang cơ chế tính toán trực tiếp client-side...", err);
                Promise.all([
                    otherService.LIST_HOPDONG({}),
                    otherService.LIST_CHITIEU({})
                ])
                .then(([resHD, resCT]) => {
                    const hds = resHD?.data?.hopDong || resHD?.hopDong || [];
                    const cts = resCT?.data?.chiTieu || resCT?.chiTieu || [];
                    setRawHopDongs(hds);
                    setRawChiTieus(cts);
                })
                .catch(fallbackErr => {
                    console.error("Lỗi khi tải dữ liệu phụ trợ:", fallbackErr);
                    toast.error("Lỗi khi tải dữ liệu: " + (fallbackErr.message || "Lỗi kết nối"));
                });
            })
            .finally(() => hideLoading());
    }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Client-side Computation
    const clientComputedReport = useMemo(() => {
        if (reportData && reportData.selectedPeriod) {
            return reportData;
        }

        const nowRef = new Date();
        const curWeek = getWeekRangeClient(nowRef, 0);
        const prevWeek = getWeekRangeClient(nowRef, -1);
        const statsCurWeek = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, curWeek.startDate, curWeek.endDate);
        const statsPrevWeek = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, prevWeek.startDate, prevWeek.endDate);

        const curMonth = getMonthRangeClient(nowRef, 0);
        const prevMonth = getMonthRangeClient(nowRef, -1);
        const statsCurMonth = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, curMonth.startDate, curMonth.endDate);
        const statsPrevMonth = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, prevMonth.startDate, prevMonth.endDate);

        const curQuarter = getQuarterRangeClient(nowRef, 0);
        const prevQuarter = getQuarterRangeClient(nowRef, -1);
        const statsCurQuarter = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, curQuarter.startDate, curQuarter.endDate);
        const statsPrevQuarter = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, prevQuarter.startDate, prevQuarter.endDate);

        const curYear = getYearRangeClient(nowRef, 0);
        const prevYear = getYearRangeClient(nowRef, -1);
        const statsCurYear = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, curYear.startDate, curYear.endDate);
        const statsPrevYear = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, prevYear.startDate, prevYear.endDate);

        const overview = {
            week: {
                currentRange: curWeek,
                previousRange: prevWeek,
                current: statsCurWeek,
                previous: statsPrevWeek,
                comparison: buildComparisonClient(statsCurWeek, statsPrevWeek)
            },
            month: {
                currentRange: curMonth,
                previousRange: prevMonth,
                current: statsCurMonth,
                previous: statsPrevMonth,
                comparison: buildComparisonClient(statsCurMonth, statsPrevMonth)
            },
            quarter: {
                currentRange: curQuarter,
                previousRange: prevQuarter,
                current: statsCurQuarter,
                previous: statsPrevQuarter,
                comparison: buildComparisonClient(statsCurQuarter, statsPrevQuarter)
            },
            year: {
                currentRange: curYear,
                previousRange: prevYear,
                current: statsCurYear,
                previous: statsPrevYear,
                comparison: buildComparisonClient(statsCurYear, statsPrevYear)
            }
        };

        let selCurRange, selPrevRange;
        if (periodType === 'week') {
            selCurRange = curWeek;
            selPrevRange = prevWeek;
        } else if (periodType === 'quarter') {
            const dummyDate = makeICTDate(Number(selectedYear), (Number(selectedQuarter) - 1) * 3, 15);
            selCurRange = getQuarterRangeClient(dummyDate, 0);
            selPrevRange = getQuarterRangeClient(dummyDate, -1);
        } else if (periodType === 'year') {
            const dummyDate = makeICTDate(Number(selectedYear), 6, 15);
            selCurRange = getYearRangeClient(dummyDate, 0);
            selPrevRange = getYearRangeClient(dummyDate, -1);
        } else if (periodType === 'custom' && customStartDate && customEndDate) {
            const sDate = new Date(customStartDate);
            sDate.setHours(0, 0, 0, 0);
            const eDate = new Date(customEndDate);
            eDate.setHours(23, 59, 59, 999);
            const diff = eDate.getTime() - sDate.getTime();
            const prevSDate = new Date(sDate.getTime() - diff - 1);
            const prevEDate = new Date(sDate.getTime() - 1);
            selCurRange = { startDate: sDate, endDate: eDate, label: "Tùy chỉnh", type: "custom" };
            selPrevRange = { startDate: prevSDate, endDate: prevEDate, label: "Kỳ trước đó", type: "custom" };
        } else {
            const dummyDate = makeICTDate(Number(selectedYear), Number(selectedMonth) - 1, 15);
            selCurRange = getMonthRangeClient(dummyDate, 0);
            selPrevRange = getMonthRangeClient(dummyDate, -1);
        }

        const selCurStats = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, selCurRange.startDate, selCurRange.endDate);
        const selPrevStats = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, selPrevRange.startDate, selPrevRange.endDate);
        const selComp = buildComparisonClient(selCurStats, selPrevStats);

        // Sales Rankings
        const saleMap = {};
        selCurStats.filteredContracts.forEach(hd => {
            const name = (hd.nguoiPhucVu?.banHang || "Chưa phân công").trim();
            const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? 0);
            const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
            if (!saleMap[name]) saleMap[name] = { name, count: 0, revenue: 0, collected: 0 };
            saleMap[name].count += 1;
            saleMap[name].revenue += val;
            saleMap[name].collected += paid;
        });
        const topSales = Object.values(saleMap).sort((a, b) => b.revenue - a.revenue);

        // Timeline chart points
        const timelineChart = [];
        if (selCurRange.type === 'week') {
            const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
            for (let i = 0; i < 7; i++) {
                const dStart = new Date(selCurRange.startDate);
                dStart.setDate(dStart.getDate() + i);
                dStart.setHours(0, 0, 0, 0);
                const dEnd = new Date(dStart);
                dEnd.setHours(23, 59, 59, 999);
                const m = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, dStart, dEnd);
                const dIct = getICTComponents(dStart);
                timelineChart.push({
                    label: dayNames[i],
                    subLabel: `${dIct.date}/${dIct.month + 1}`,
                    ...m
                });
            }
        } else if (selCurRange.type === 'month') {
            const ict = getICTComponents(selCurRange.startDate);
            const daysInMonth = new Date(ict.year, ict.month + 1, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const dStart = makeICTDate(ict.year, ict.month, d, 0, 0, 0, 0);
                const dEnd = makeICTDate(ict.year, ict.month, d, 23, 59, 59, 999);
                const m = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, dStart, dEnd);
                timelineChart.push({
                    label: `${d}`,
                    subLabel: `${d}/${ict.month + 1}`,
                    ...m
                });
            }
        } else if (selCurRange.type === 'quarter') {
            const ict = getICTComponents(selCurRange.startDate);
            const startMonth = Math.floor(ict.month / 3) * 3;
            for (let m = 0; m < 3; m++) {
                const mIdx = startMonth + m;
                const dStart = makeICTDate(ict.year, mIdx, 1, 0, 0, 0, 0);
                const dEnd = makeICTDate(ict.year, mIdx + 1, 0, 23, 59, 59, 999);
                const metrics = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, dStart, dEnd);
                timelineChart.push({
                    label: `Tháng ${mIdx + 1}`,
                    subLabel: `Th${mIdx + 1}/${ict.year}`,
                    ...metrics
                });
            }
        } else if (selCurRange.type === 'year') {
            const ict = getICTComponents(selCurRange.startDate);
            for (let m = 0; m < 12; m++) {
                const dStart = makeICTDate(ict.year, m, 1, 0, 0, 0, 0);
                const dEnd = makeICTDate(ict.year, m + 1, 0, 23, 59, 59, 999);
                const metrics = calculateMetricsFromRaw(rawHopDongs, rawChiTieus, dStart, dEnd);
                timelineChart.push({
                    label: `Th${m + 1}`,
                    subLabel: `Tháng ${m + 1}`,
                    ...metrics
                });
            }
        }

        // Top Customers (Khách hàng sử dụng dịch vụ nhiều nhất)
        const customerMap = {};
        selCurStats.filteredContracts.forEach(hd => {
            const cust = hd.khachHang1 || {};
            const custId = cust._id?.toString() || cust.soDienThoai || hd.maHopDong;
            const custName = cust.tenKhachHang || ("Khách hàng " + hd.maHopDong);
            const custPhone = cust.soDienThoai || "-";
            const custAddress = cust.diaChi || "-";

            const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? 0);
            const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
            const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));

            if (!customerMap[custId]) {
                customerMap[custId] = {
                    id: custId,
                    name: custName,
                    phone: custPhone,
                    address: custAddress,
                    contractCount: 0,
                    serviceCount: 0,
                    services: new Set(),
                    totalSpent: 0,
                    totalPaid: 0,
                    totalDebt: debt,
                    contractCodes: [],
                    lastDate: hd.ngayHopDong
                };
            }

            customerMap[custId].contractCount += 1;
            customerMap[custId].totalSpent += val;
            customerMap[custId].totalPaid += paid;
            customerMap[custId].totalDebt += debt;
            customerMap[custId].contractCodes.push(hd.maHopDong);
            if (new Date(hd.ngayHopDong) > new Date(customerMap[custId].lastDate)) {
                customerMap[custId].lastDate = hd.ngayHopDong;
            }

            if (hd.gioHang && Array.isArray(hd.gioHang) && hd.gioHang.length > 0) {
                hd.gioHang.forEach(item => {
                    const sName = item.tenDichVuSnapshot || item.dichVu?.tenDichVu;
                    if (sName) {
                        customerMap[custId].services.add(sName);
                    }
                    customerMap[custId].serviceCount += (Number(item.soLuong) || 1);
                });
            }
            if (customerMap[custId].serviceCount === 0) {
                customerMap[custId].serviceCount = customerMap[custId].contractCount;
            }
        });

        const topCustomers = Object.values(customerMap).map(c => ({
            ...c,
            services: Array.from(c.services)
        })).sort((a, b) => {
            if (b.serviceCount !== a.serviceCount) {
                return b.serviceCount - a.serviceCount;
            }
            return b.totalSpent - a.totalSpent;
        });

        let sysReceivable = 0;
        let sysPendingCount = 0;
        rawHopDongs.forEach(hd => {
            const debt = Number(hd.thanhToan?.conLai || 0);
            if (debt > 0) {
                sysReceivable += debt;
                sysPendingCount++;
            }
        });

        return {
            periodType,
            selectedPeriod: {
                currentRange: selCurRange,
                previousRange: selPrevRange,
                current: selCurStats,
                previous: selPrevStats,
                comparison: selComp,
                timelineChart,
                topSales,
                topCustomers,
                recentContracts: selCurStats.filteredContracts.slice(0, 10),
                scheduledContracts: selCurStats.scheduledContracts,
                recentExpenses: selCurStats.filteredExpenses.slice(0, 10)
            },
            overview,
            systemStats: {
                systemTotalReceivable: sysReceivable,
                systemTotalPendingContracts: sysPendingCount
            }
        };
    }, [reportData, rawHopDongs, rawChiTieus, periodType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate]);

    const handleQuickCycleSelect = (type) => {
        setPeriodType(type);
        if (type === 'year') {
            setSelectedYear(currentYear);
        } else if (type === 'quarter') {
            setSelectedYear(currentYear);
            setSelectedQuarter(currentQuarter);
        } else if (type === 'month') {
            setSelectedYear(currentYear);
            setSelectedMonth(currentMonth);
        }
    };

    const finalReport = clientComputedReport || {};
    const selectedPeriod = finalReport.selectedPeriod || {};
    const overview = finalReport.overview || {};
    const currentMetrics = selectedPeriod.current || {};
    const previousMetrics = selectedPeriod.previous || {};
    const comparison = selectedPeriod.comparison || {};
    const timelineChart = selectedPeriod.timelineChart || [];
    const topSales = selectedPeriod.topSales || [];
    const topCustomers = selectedPeriod.topCustomers || [];
    const recentContracts = selectedPeriod.recentContracts || [];
    const scheduledContracts = selectedPeriod.scheduledContracts || [];
    const recentExpenses = selectedPeriod.recentExpenses || [];
    const systemStats = finalReport.systemStats || {};

    // Filter & Search states for Scheduled Contracts Tab
    const [scheduleSearch, setScheduleSearch] = useState('');
    const [selectedScheduleFilter, setSelectedScheduleFilter] = useState('all');
    const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('all');

    const filteredScheduledContracts = useMemo(() => {
        return (scheduledContracts || []).filter(hd => {
            if (scheduleSearch) {
                const q = scheduleSearch.trim().toLowerCase();
                const ma = (hd.maHopDong || '').toLowerCase();
                const kh1 = (hd.khachHang1?.tenKhachHang || '').toLowerCase();
                const sdt1 = (hd.khachHang1?.soDienThoai || '').toLowerCase();
                const kh2 = (hd.khachHang2?.tenKhachHang || '').toLowerCase();
                const sale = (hd.nguoiPhucVu?.banHang || '').toLowerCase();
                const matchText = ma.includes(q) || kh1.includes(q) || sdt1.includes(q) || kh2.includes(q) || sale.includes(q);
                if (!matchText) return false;
            }

            if (selectedScheduleFilter !== 'all') {
                const hasType = hd.matchedSchedules?.some(s => s.type === selectedScheduleFilter);
                if (!hasType) return false;
            }

            if (selectedPaymentFilter !== 'all') {
                const status = hd.thanhToan?.trangThaiThanhToan || 'Chưa thanh toán';
                if (selectedPaymentFilter === 'Đã thanh toán đủ' && status !== 'Đã thanh toán đủ') return false;
                if (selectedPaymentFilter === 'Đang thanh toán' && status !== 'Đang thanh toán') return false;
                if (selectedPaymentFilter === 'Chưa thanh toán' && status !== 'Chưa thanh toán') return false;
            }

            return true;
        });
    }, [scheduledContracts, scheduleSearch, selectedScheduleFilter, selectedPaymentFilter]);

    const scheduleTypeCounts = useMemo(() => {
        const counts = {
            all: (scheduledContracts || []).length,
            ngayChup: 0,
            ngayAnHoi: 0,
            ngayCuoi: 0,
            ngayChinhAnh: 0,
            ngayTraAnh: 0,
            ngayChuyenInAnh: 0,
            ngayMuonDo: 0,
            ngayTraDo: 0
        };
        (scheduledContracts || []).forEach(hd => {
            hd.matchedSchedules?.forEach(s => {
                if (counts[s.type] !== undefined) {
                    counts[s.type]++;
                }
            });
        });
        return counts;
    }, [scheduledContracts]);

    // Filter & Search states for Payment History Tab (Tab 5)
    const [paymentSearch, setPaymentSearch] = useState('');
    const [paymentScope, setPaymentScope] = useState('all'); // 'all' | 'period'
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [paymentPage, setPaymentPage] = useState(0);
    const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(20);

    // Extract all payment history records
    const allPaymentHistory = useMemo(() => {
        const list = [];
        (rawHopDongs || []).forEach(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return;
            const custName = hd.khachHang1?.tenKhachHang || hd.khachHang2?.tenKhachHang || 'Khách hàng';
            const phone = hd.khachHang1?.soDienThoai || hd.khachHang2?.soDienThoai || '-';
            const nhanVien = hd.nguoiPhucVu?.banHang || '-';
            const trangThaiHD = hd.thanhToan?.trangThaiThanhToan || 'Chưa thanh toán';

            const cacLuot = hd.thanhToan?.cacLuotThanhToan;
            if (Array.isArray(cacLuot) && cacLuot.length > 0) {
                cacLuot.forEach((p, idx) => {
                    const amt = Number(p.amount) || 0;
                    if (amt > 0) {
                        const mth = p.method === 1 ? 'Chuyển khoản' : (p.method === 0 ? 'Tiền mặt' : (p.method || 'Tiền mặt'));
                        list.push({
                            id: p.id || `${hd._id || hd.maHopDong}-${idx}`,
                            maHopDong: hd.maHopDong,
                            hopDongId: hd._id,
                            khachHang: p.khachHang || custName,
                            soDienThoai: phone,
                            ngayThanhToan: p.date || hd.ngayHopDong || hd.createdAt,
                            soTien: amt,
                            phuongThuc: mth,
                            noiDung: p.noiDung || `Thanh toán đợt ${idx + 1}`,
                            nhanVien: p.nhanVien || nhanVien,
                            trangThaiHD: trangThaiHD,
                            tongGiaTriHD: Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0),
                            conLaiHD: Number(hd.thanhToan?.conLai ?? 0)
                        });
                    }
                });
            } else if (Number(hd.thanhToan?.khachHangDaThanhToan) > 0) {
                const mth = hd.thanhToan?.khachThanhToan?.method === 1 ? 'Chuyển khoản' : (hd.thanhToan?.phuongThucThanhToan || 'Tiền mặt');
                list.push({
                    id: `init-${hd._id || hd.maHopDong}`,
                    maHopDong: hd.maHopDong,
                    hopDongId: hd._id,
                    khachHang: custName,
                    soDienThoai: phone,
                    ngayThanhToan: hd.ngayHopDong || hd.createdAt,
                    soTien: Number(hd.thanhToan.khachHangDaThanhToan),
                    phuongThuc: mth,
                    noiDung: 'Thanh toán hợp đồng (đặt cọc/toàn bộ)',
                    nhanVien: nhanVien,
                    trangThaiHD: trangThaiHD,
                    tongGiaTriHD: Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0),
                    conLaiHD: Number(hd.thanhToan?.conLai ?? 0)
                });
            }
        });

        // Sắp xếp mới nhất lên đầu
        list.sort((a, b) => new Date(b.ngayThanhToan || 0).getTime() - new Date(a.ngayThanhToan || 0).getTime());
        return list;
    }, [rawHopDongs]);

    // Filter payment history based on search, scope, and method
    const filteredPaymentHistory = useMemo(() => {
        let result = allPaymentHistory;

        // Scope filter
        if (paymentScope === 'period' && selectedPeriod?.currentRange?.startDate && selectedPeriod?.currentRange?.endDate) {
            const sTime = new Date(selectedPeriod.currentRange.startDate).getTime();
            const eTime = new Date(selectedPeriod.currentRange.endDate).getTime();
            result = result.filter(item => {
                const t = new Date(item.ngayThanhToan).getTime();
                return !isNaN(t) && t >= sTime && t <= eTime;
            });
        }

        // Method filter
        if (paymentMethodFilter !== 'all') {
            result = result.filter(item => (item.phuongThuc || '').toLowerCase().includes(paymentMethodFilter.toLowerCase()));
        }

        // Search text
        if (paymentSearch.trim()) {
            const q = paymentSearch.trim().toLowerCase();
            result = result.filter(item =>
                (item.maHopDong || '').toLowerCase().includes(q) ||
                (item.khachHang || '').toLowerCase().includes(q) ||
                (item.soDienThoai || '').toLowerCase().includes(q) ||
                (item.noiDung || '').toLowerCase().includes(q) ||
                (item.nhanVien || '').toLowerCase().includes(q)
            );
        }

        return result;
    }, [allPaymentHistory, paymentScope, selectedPeriod, paymentMethodFilter, paymentSearch]);

    // Summary statistics for payment history
    const paymentStats = useMemo(() => {
        let totalCount = filteredPaymentHistory.length;
        let totalAmount = 0;
        let bankAmount = 0;
        let cashAmount = 0;

        filteredPaymentHistory.forEach(p => {
            totalAmount += p.soTien;
            const m = (p.phuongThuc || '').toLowerCase();
            if (m.includes('chuyển khoản') || m.includes('ck') || m.includes('bank')) {
                bankAmount += p.soTien;
            } else if (m.includes('tiền mặt') || m.includes('cash')) {
                cashAmount += p.soTien;
            }
        });

        return { totalCount, totalAmount, bankAmount, cashAmount };
    }, [filteredPaymentHistory]);

    const exportPaymentHistoryToExcel = () => {
        try {
            const rows = filteredPaymentHistory.map((item, idx) => ({
                "STT": idx + 1,
                "Mã Hợp Đồng": item.maHopDong,
                "Tên Khách Hàng": item.khachHang,
                "Số Điện Thoại": item.soDienThoai,
                "Ngày Thanh Toán": item.ngayThanhToan ? new Date(item.ngayThanhToan).toLocaleString('vi-VN') : '-',
                "Số Tiền (VNĐ)": item.soTien,
                "Phương Thức": item.phuongThuc,
                "Nội Dung / Đợt Thu": item.noiDung,
                "Nhân Viên": item.nhanVien,
                "Trạng Thái HĐ": item.trangThaiHD,
                "Tổng Giá Trị HĐ": item.tongGiaTriHD,
                "Còn Nợ HĐ": item.conLaiHD
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "LichSuThanhToan");
            const fileName = `LichSuThanhToan_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            toast.success(`Đã xuất ${rows.length} dòng lịch sử thanh toán thành công!`);
        } catch (err) {
            console.error("Lỗi xuất Excel lịch sử thanh toán:", err);
            toast.error("Không thể xuất file Excel: " + (err.message || "Lỗi"));
        }
    };

    const renderGrowthBadge = (comparisonItem, invertTrend = false) => {
        if (!comparisonItem) return null;
        const growth = comparisonItem.growthPercent || 0;

        let badgeClass = 'badge-growth-neutral';
        let IconComp = RemoveIcon;

        if (growth > 0) {
            badgeClass = invertTrend ? 'badge-growth-down' : 'badge-growth-up';
            IconComp = TrendingUpIcon;
        } else if (growth < 0) {
            badgeClass = invertTrend ? 'badge-growth-up' : 'badge-growth-down';
            IconComp = TrendingDownIcon;
        }

        return (
            <span className={`metric-badge-growth ${badgeClass}`}>
                <IconComp style={{ fontSize: '0.9rem' }} />
                <span>{formatPercent(growth)}</span>
            </span>
        );
    };

    // Chart interactive hover & wave toggles
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [visibleWaves, setVisibleWaves] = useState({
        revenue: true,
        scheduled: true,
        collected: true,
        expense: true,
        profit: true
    });

    const toggleWave = (key) => {
        setVisibleWaves(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const setWavePreset = (preset) => {
        if (preset === 'all') {
            setVisibleWaves({ revenue: true, scheduled: true, collected: true, expense: true, profit: true });
        } else if (preset === 'rev_profit') {
            setVisibleWaves({ revenue: true, scheduled: false, collected: false, expense: false, profit: true });
        } else if (preset === 'cashflow') {
            setVisibleWaves({ revenue: false, scheduled: false, collected: true, expense: true, profit: true });
        }
    };

    const renderTimelineChart = () => {
        if (!timelineChart || timelineChart.length === 0) {
            return (
                <Box display="flex" alignItems="center" justifyContent="center" height="280px" color="#94a3b8">
                    Chưa có đủ dữ liệu để hiển thị biểu đồ
                </Box>
            );
        }

        const width = 840;
        const height = 330;
        const padLeft = 65;
        const padRight = 30;
        const padTop = 35;
        const padBottom = 50;

        const chartW = width - padLeft - padRight;
        const chartH = height - padTop - padBottom;
        const yBase = padTop + chartH;

        const maxVal = Math.max(
            ...timelineChart.map(d => Math.max(d.tongTienHopDong || 0, d.tongDoanhSoTheoLich || 0, d.soTienDaThu || 0, d.tongTienKhoanChi || 0, d.laiRong || 0)),
            1000000
        );

        const step = timelineChart.length > 1 ? chartW / (timelineChart.length - 1) : chartW;

        // Construct point lists
        const pointsRevenue = timelineChart.map((d, i) => {
            const x = timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * i;
            const y = yBase - ((d.tongTienHopDong || 0) / maxVal) * chartH;
            return { x, y, val: d.tongTienHopDong || 0, item: d, idx: i };
        });

        const pointsScheduled = timelineChart.map((d, i) => {
            const x = timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * i;
            const y = yBase - ((d.tongDoanhSoTheoLich || 0) / maxVal) * chartH;
            return { x, y, val: d.tongDoanhSoTheoLich || 0, item: d, idx: i };
        });

        const pointsCollected = timelineChart.map((d, i) => {
            const x = timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * i;
            const y = yBase - ((d.soTienDaThu || 0) / maxVal) * chartH;
            return { x, y, val: d.soTienDaThu || 0, item: d, idx: i };
        });

        const pointsExpense = timelineChart.map((d, i) => {
            const x = timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * i;
            const y = yBase - ((d.tongTienKhoanChi || 0) / maxVal) * chartH;
            return { x, y, val: d.tongTienKhoanChi || 0, item: d, idx: i };
        });

        const pointsProfit = timelineChart.map((d, i) => {
            const x = timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * i;
            const y = yBase - (Math.max(0, d.laiRong || 0) / maxVal) * chartH;
            return { x, y, val: d.laiRong || 0, item: d, idx: i };
        });

        const waveRevenue = getSmoothSplinePath(pointsRevenue, yBase);
        const waveScheduled = getSmoothSplinePath(pointsScheduled, yBase);
        const waveCollected = getSmoothSplinePath(pointsCollected, yBase);
        const waveExpense = getSmoothSplinePath(pointsExpense, yBase);
        const waveProfit = getSmoothSplinePath(pointsProfit, yBase);

        const hoveredData = hoveredIdx !== null ? timelineChart[hoveredIdx] : null;
        const hoveredX = hoveredIdx !== null ? (timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * hoveredIdx) : null;

        return (
            <Box sx={{ width: '100%', position: 'relative' }}>
                <Box sx={{ width: '100%', overflowX: 'auto' }} className="custom-scroll">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        style={{ minWidth: '680px', width: '100%', height: '320px', overflow: 'visible', cursor: 'crosshair' }}
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        <defs>
                            {/* Revenue Gradient */}
                            <linearGradient id="wave-grad-revenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                                <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>

                            {/* Scheduled Revenue Gradient */}
                            <linearGradient id="wave-grad-scheduled" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                                <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                            </linearGradient>

                            {/* Collected Gradient */}
                            <linearGradient id="wave-grad-collected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.06" />
                                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                            </linearGradient>

                            {/* Profit Gradient */}
                            <linearGradient id="wave-grad-profit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                                <stop offset="70%" stopColor="#6366f1" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                            </linearGradient>

                            {/* Expense Gradient */}
                            <linearGradient id="wave-grad-expense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                                <stop offset="70%" stopColor="#ef4444" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                            </linearGradient>

                            {/* Soft glow filter */}
                            <filter id="wave-glow" x="-10%" y="-10%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                            </filter>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                            const y = padTop + chartH * (1 - ratio);
                            const val = maxVal * ratio;
                            return (
                                <g key={idx}>
                                    <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#f1f5f9" strokeDasharray={ratio === 0 ? "none" : "4 4"} strokeWidth="1.2" />
                                    <text x={padLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b" fontWeight="600">
                                        {formatShortCurrency(val)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* 1. Revenue Wave Area & Line */}
                        {visibleWaves.revenue && waveRevenue.areaPath && (
                            <g>
                                <path d={waveRevenue.areaPath} fill="url(#wave-grad-revenue)" />
                                <path d={waveRevenue.linePath} fill="none" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#wave-glow)" />
                            </g>
                        )}

                        {/* 1.5 Scheduled Revenue Wave Area & Line */}
                        {visibleWaves.scheduled && waveScheduled.areaPath && (
                            <g>
                                <path d={waveScheduled.areaPath} fill="url(#wave-grad-scheduled)" />
                                <path d={waveScheduled.linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" filter="url(#wave-glow)" />
                            </g>
                        )}

                        {/* 2. Collected Wave Area & Line */}
                        {visibleWaves.collected && waveCollected.areaPath && (
                            <g>
                                <path d={waveCollected.areaPath} fill="url(#wave-grad-collected)" />
                                <path d={waveCollected.linePath} fill="none" stroke="#0284c7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#wave-glow)" />
                            </g>
                        )}

                        {/* 3. Expense Wave Area & Line */}
                        {visibleWaves.expense && waveExpense.areaPath && (
                            <g>
                                <path d={waveExpense.areaPath} fill="url(#wave-grad-expense)" />
                                <path d={waveExpense.linePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        )}

                        {/* 4. Profit Wave Area & Line */}
                        {visibleWaves.profit && waveProfit.areaPath && (
                            <g>
                                <path d={waveProfit.areaPath} fill="url(#wave-grad-profit)" />
                                <path d={waveProfit.linePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#wave-glow)" />
                            </g>
                        )}

                        {/* Data Points (Dots on Waves for days with values) */}
                        {timelineChart.map((d, i) => {
                            const x = timelineChart.length === 1 ? padLeft + chartW / 2 : padLeft + step * i;
                            const isHovered = hoveredIdx === i;
                            return (
                                <g key={i}>
                                    {/* X-axis labels */}
                                    <text x={x} y={height - padBottom + 16} textAnchor="middle" fontSize="10.5" fill={isHovered ? "#0284c7" : "#475569"} fontWeight={isHovered ? "800" : "600"}>
                                        {d.label}
                                    </text>
                                    {d.subLabel && (
                                        <text x={x} y={height - padBottom + 28} textAnchor="middle" fontSize="8.5" fill="#94a3b8">
                                            {d.subLabel}
                                        </text>
                                    )}

                                    {/* Dots when active */}
                                    {visibleWaves.revenue && (d.tongTienHopDong > 0 || isHovered) && (
                                        <circle cx={x} cy={pointsRevenue[i].y} r={isHovered ? 6 : 3.5} fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                                    )}
                                    {visibleWaves.scheduled && (d.tongDoanhSoTheoLich > 0 || isHovered) && (
                                        <circle cx={x} cy={pointsScheduled[i].y} r={isHovered ? 6 : 3.5} fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                                    )}
                                    {visibleWaves.collected && (d.soTienDaThu > 0 || isHovered) && (
                                        <circle cx={x} cy={pointsCollected[i].y} r={isHovered ? 6 : 3.5} fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                                    )}
                                    {visibleWaves.profit && (d.laiRong > 0 || isHovered) && (
                                        <circle cx={x} cy={pointsProfit[i].y} r={isHovered ? 6.5 : 4} fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                                    )}
                                    {visibleWaves.expense && (d.tongTienKhoanChi > 0 || isHovered) && (
                                        <circle cx={x} cy={pointsExpense[i].y} r={isHovered ? 5.5 : 3} fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                                    )}
                                </g>
                            );
                        })}

                        {/* Interactive Hover Vertical Guideline */}
                        {hoveredIdx !== null && hoveredX !== null && (
                            <line x1={hoveredX} y1={padTop - 8} x2={hoveredX} y2={yBase} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
                        )}

                        {/* Invisible Hover Rectangles along columns */}
                        {timelineChart.map((d, i) => {
                            const sliceWidth = timelineChart.length > 1 ? step : chartW;
                            const rectX = timelineChart.length === 1 ? padLeft : Math.max(padLeft, padLeft + step * i - sliceWidth / 2);
                            return (
                                <rect
                                    key={i}
                                    x={rectX}
                                    y={padTop}
                                    width={sliceWidth}
                                    height={chartH + padBottom}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIdx(i)}
                                    onTouchStart={() => setHoveredIdx(i)}
                                />
                            );
                        })}
                    </svg>
                </Box>

                {/* Floating Tooltip Card on Hover */}
                {hoveredData && hoveredX !== null && (
                    <Paper
                        elevation={6}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: Math.min(Math.max(hoveredX - 110, 20), width - 240),
                            zIndex: 20,
                            p: 1.8,
                            borderRadius: '16px',
                            bgcolor: 'rgba(15, 23, 42, 0.94)',
                            color: '#ffffff',
                            backdropFilter: 'blur(12px)',
                            pointerEvents: 'none',
                            minWidth: 220,
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.45)'
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#93c5fd', display: 'block', mb: 1, borderBottom: '1px solid rgba(255,255,255,0.15)', pb: 0.6 }}>
                            📅 {hoveredData.subLabel ? `Ngày ${hoveredData.subLabel}` : hoveredData.label} ({hoveredData.soLuongHopDong || 0} HĐ ký)
                        </Typography>
                        <Stack spacing={0.6}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: '#86efac', fontWeight: 600 }}>● Doanh số ký:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(hoveredData.tongTienHopDong)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: '#d8b4fe', fontWeight: 600 }}>● Doanh số theo lịch:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(hoveredData.tongDoanhSoTheoLich || 0)} ({hoveredData.soLuongHopDongTheoLich || 0} HĐ)</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: '#7dd3fc', fontWeight: 600 }}>● Đã thu thực tế:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(hoveredData.soTienDaThu)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 600 }}>● Tổng tiền chi:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#ffffff' }}>{formatCurrency(hoveredData.tongTienKhoanChi)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px dashed rgba(255,255,255,0.2)', pt: 0.6, mt: 0.4 }}>
                                <Typography variant="caption" sx={{ color: '#c4b5fd', fontWeight: 750 }}>● Lãi ròng:</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 850, color: '#e9d5ff' }}>{formatCurrency(hoveredData.laiRong)}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                )}
            </Box>
        );
    };

    // Detail Modal State & Handlers
    const [detailModal, setDetailModal] = useState({
        open: false,
        loading: false,
        type: 'contracts', // 'contracts', 'revenue', 'scheduled', 'collected', 'debt', 'expenses', 'profit'
        title: '',
        icon: null,
        data: [],
        periodLabel: ''
    });
    const [modalSearch, setModalSearch] = useState('');

    const openDetailDialog = async (type) => {
        const periodLabel = selectedPeriod.currentRange?.label || 'Kỳ này';
        let title = '';
        let icon = null;

        switch (type) {
            case 'contracts':
                title = 'Danh Sách Hợp Đồng Ký Trong Kỳ';
                icon = <AssignmentIcon sx={{ color: '#2563eb' }} />;
                break;
            case 'revenue':
                title = 'Chi Tiết Doanh Số & Hợp Đồng Ký Trong Kỳ';
                icon = <MonetizationOnIcon sx={{ color: '#16a34a' }} />;
                break;
            case 'scheduled':
                title = 'Danh Sách Hợp Đồng & Doanh Số Theo Lịch Phục Vụ';
                icon = <EventAvailableIcon sx={{ color: '#8b5cf6' }} />;
                break;
            case 'collected':
                title = 'Danh Sách Hợp Đồng Đã Thu Tiền Trong Kỳ';
                icon = <AccountBalanceWalletIcon sx={{ color: '#0891b2' }} />;
                break;
            case 'debt':
                title = 'Danh Sách Khách Hàng Còn Nợ (HĐ Ký Trong Kỳ)';
                icon = <PendingActionsIcon sx={{ color: '#ea580c' }} />;
                break;
            case 'expenses':
                title = 'Danh Sách Các Khoản Chi Phí Trong Kỳ';
                icon = <ReceiptLongIcon sx={{ color: '#dc2626' }} />;
                break;
            case 'profit':
                title = 'Tổng Hợp Lãi Ròng & Danh Sách Hợp Đồng Trong Kỳ';
                icon = <SavingsIcon sx={{ color: '#6366f1' }} />;
                break;
            default:
                title = 'Danh Sách Chi Tiết';
        }

        // Open modal with loading state immediately
        setDetailModal({
            open: true,
            loading: true,
            type,
            title,
            icon,
            data: [],
            periodLabel
        });
        setModalSearch('');

        // Get current period range dates
        const curRange = selectedPeriod.currentRange || {};
        let startDate = curRange.startDate ? new Date(curRange.startDate) : null;
        let endDate = curRange.endDate ? new Date(curRange.endDate) : null;

        if (!startDate || !endDate) {
            const nowRef = new Date();
            const fallbackMonth = getMonthRangeClient(nowRef, 0);
            startDate = fallbackMonth.startDate;
            endDate = fallbackMonth.endDate;
        }

        try {
            if (type === 'expenses') {
                // Request ChiTieu from backend
                const resCT = await otherService.LIST_CHITIEU({});
                const rawCTs = resCT?.data?.chiTieu || resCT?.chiTieu || [];
                const filtered = rawCTs.filter(ct => {
                    if (!ct.date) return false;
                    const d = new Date(ct.date);
                    return d >= startDate && d <= endDate;
                });
                filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                setDetailModal(prev => ({
                    ...prev,
                    loading: false,
                    data: filtered
                }));
            } else {
                // Request HopDong from backend
                const resHD = await otherService.LIST_HOPDONG({});
                const rawHDs = resHD?.data?.hopDong || resHD?.hopDong || [];
                
                let resultContracts = [];

                if (type === 'scheduled') {
                    rawHDs.forEach(hd => {
                        if (hd.maHopDong === 'CH-CHUNG') return;
                        const matched = extractMatchedSchedulesClient(hd, startDate, endDate);
                        if (matched.length > 0) {
                            resultContracts.push({
                                ...hd,
                                matchedSchedules: matched
                            });
                        }
                    });
                    resultContracts.sort((a, b) => {
                        const dateA = a.matchedSchedules?.[0]?.date ? new Date(a.matchedSchedules[0].date).getTime() : 0;
                        const dateB = b.matchedSchedules?.[0]?.date ? new Date(b.matchedSchedules[0].date).getTime() : 0;
                        return dateA - dateB;
                    });
                } else {
                    const signedContracts = rawHDs.filter(hd => {
                        if (hd.maHopDong === 'CH-CHUNG' || !hd.ngayHopDong) return false;
                        const d = new Date(hd.ngayHopDong);
                        return d >= startDate && d <= endDate;
                    });

                    if (type === 'collected') {
                        resultContracts = signedContracts.filter(hd => Number(hd.thanhToan?.khachHangDaThanhToan || 0) > 0);
                    } else if (type === 'debt') {
                        resultContracts = signedContracts.filter(hd => {
                            const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
                            const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
                            const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));
                            return debt > 0;
                        });
                        resultContracts.sort((a, b) => {
                            const debtA = Number(a.thanhToan?.conLai || 0);
                            const debtB = Number(b.thanhToan?.conLai || 0);
                            return debtB - debtA;
                        });
                    } else {
                        resultContracts = signedContracts;
                        resultContracts.sort((a, b) => new Date(b.ngayHopDong || 0) - new Date(a.ngayHopDong || 0));
                    }
                }

                setDetailModal(prev => ({
                    ...prev,
                    loading: false,
                    data: resultContracts
                }));
            }
        } catch (err) {
            console.warn("Lỗi khi gửi request lấy danh sách từ server, chuyển sang fallback dữ liệu...", err);
            
            // Fallback to local computed data
            let fallbackData = [];
            if (type === 'expenses') {
                fallbackData = currentMetrics.filteredExpenses || [];
            } else if (type === 'scheduled') {
                fallbackData = currentMetrics.scheduledContracts || [];
            } else if (type === 'collected') {
                fallbackData = (currentMetrics.filteredContracts || []).filter(hd => Number(hd.thanhToan?.khachHangDaThanhToan || 0) > 0);
            } else if (type === 'debt') {
                fallbackData = (currentMetrics.filteredContracts || []).filter(hd => {
                    const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
                    const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
                    const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));
                    return debt > 0;
                });
            } else {
                fallbackData = currentMetrics.filteredContracts || [];
            }

            setDetailModal(prev => ({
                ...prev,
                loading: false,
                data: fallbackData
            }));
        }
    };

    const closeDetailDialog = () => {
        setDetailModal(prev => ({ ...prev, open: false }));
        setModalSearch('');
    };

    const filteredModalData = useMemo(() => {
        if (!detailModal.data || detailModal.data.length === 0) return [];
        if (!modalSearch.trim()) return detailModal.data;

        const term = modalSearch.toLowerCase().trim();

        if (detailModal.type === 'expenses') {
            return detailModal.data.filter(ct => 
                (ct.content || '').toLowerCase().includes(term) ||
                (ct.category || '').toLowerCase().includes(term) ||
                (ct.person || '').toLowerCase().includes(term) ||
                (ct.note || '').toLowerCase().includes(term)
            );
        }

        return detailModal.data.filter(hd => 
            (hd.maHopDong || '').toLowerCase().includes(term) ||
            (hd.thongTinCoDauChuRe?.tenCoDau || '').toLowerCase().includes(term) ||
            (hd.thongTinCoDauChuRe?.tenChuRe || '').toLowerCase().includes(term) ||
            (hd.thongTinCoDauChuRe?.soDienThoaiCoDau || '').includes(term) ||
            (hd.thongTinCoDauChuRe?.soDienThoaiChuRe || '').includes(term) ||
            (hd.nguoiPhucVu?.banHang || '').toLowerCase().includes(term) ||
            (hd.nguoiPhucVu?.chupAnh || '').toLowerCase().includes(term) ||
            (hd.tenGoiDichVu || '').toLowerCase().includes(term)
        );
    }, [detailModal.data, detailModal.type, modalSearch]);

    const modalSummaryStats = useMemo(() => {
        if (detailModal.type === 'expenses') {
            const totalAmount = filteredModalData.reduce((sum, ct) => sum + (Number(ct.amount) || 0), 0);
            return {
                totalCount: filteredModalData.length,
                totalExpense: totalAmount
            };
        }

        let totalRevenue = 0;
        let totalPaid = 0;
        let totalDebt = 0;

        filteredModalData.forEach(hd => {
            const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
            const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
            const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));
            totalRevenue += val;
            totalPaid += paid;
            totalDebt += debt;
        });

        return {
            totalCount: filteredModalData.length,
            totalRevenue,
            totalPaid,
            totalDebt
        };
    }, [filteredModalData, detailModal.type]);

    const exportModalToExcel = () => {
        try {
            const timestamp = new Date().toISOString().slice(0, 10);
            let exportRows = [];
            let sheetName = "Danh Sách Chi Tiết";
            let fileName = `Bao_Cao_${detailModal.type}_${timestamp}.xlsx`;

            if (detailModal.type === 'expenses') {
                sheetName = "Danh Sách Chi Phí";
                exportRows = filteredModalData.map((item, index) => ({
                    "STT": index + 1,
                    "Ngày Chi": item.date ? formatDateOnly(item.date) : '-',
                    "Nội Dung Chi": item.content || item.noiDung || '-',
                    "Hạng Mục": item.category || item.loaiChi || 'Chi phí chung',
                    "Người Chi / Đơn Vị": item.person || item.nguoiChi || '-',
                    "Số Tiền Chi (VNĐ)": Number(item.amount) || 0,
                    "Ghi Chú": item.note || item.ghiChu || ''
                }));
            } else {
                sheetName = "Danh Sách Hợp Đồng";
                exportRows = filteredModalData.map((hd, index) => {
                    const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
                    const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
                    const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));
                    const schedulesStr = (hd.matchedSchedules || []).map(s => `${s.label}: ${formatDateOnly(s.date)}`).join('; ');

                    return {
                        "STT": index + 1,
                        "Mã Hợp Đồng": hd.maHopDong || '-',
                        "Ngày Ký": hd.ngayHopDong ? formatDateOnly(hd.ngayHopDong) : '-',
                        "Tên Cô Dâu": hd.thongTinCoDauChuRe?.tenCoDau || '-',
                        "SĐT Cô Dâu": hd.thongTinCoDauChuRe?.soDienThoaiCoDau || '-',
                        "Tên Chú Rể": hd.thongTinCoDauChuRe?.tenChuRe || '-',
                        "SĐT Chú Rể": hd.thongTinCoDauChuRe?.soDienThoaiChuRe || '-',
                        "Gói Dịch Vụ": hd.tenGoiDichVu || hd.chiTietHopDong?.tenGoi || '-',
                        "Lịch Trong Kỳ": schedulesStr || '-',
                        "Tổng Giá Trị (VNĐ)": val,
                        "Đã Thanh Toán (VNĐ)": paid,
                        "Còn Nợ (VNĐ)": debt,
                        "Nhân Viên Bán Hàng": hd.nguoiPhucVu?.banHang || 'Chưa phân công',
                        "Thợ Chụp Ảnh": hd.nguoiPhucVu?.chupAnh || '-',
                        "Trạng Thái Thanh Toán": debt === 0 ? 'Đã thanh toán đủ' : paid > 0 ? 'Đang thanh toán' : 'Chưa thanh toán'
                    };
                });
            }

            const ws = XLSX.utils.json_to_sheet(exportRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, fileName);
            toast.success(`Đã xuất file Excel thành công (${exportRows.length} dòng)!`);
        } catch (err) {
            console.error("Lỗi xuất Excel:", err);
            toast.error("Không thể xuất file Excel: " + (err.message || "Lỗi không xác định"));
        }
    };

    // Calculate dynamic sub-metrics for KPI cards
    const collectionPercent = currentMetrics.tongTienHopDong > 0 
        ? ((currentMetrics.soTienDaThu / currentMetrics.tongTienHopDong) * 100).toFixed(1) 
        : '0.0';
    const debtPercent = currentMetrics.tongTienHopDong > 0 
        ? ((currentMetrics.soTienConNo / currentMetrics.tongTienHopDong) * 100).toFixed(1) 
        : '0.0';
    const costPercent = currentMetrics.tongTienHopDong > 0 
        ? ((currentMetrics.tongTienKhoanChi / currentMetrics.tongTienHopDong) * 100).toFixed(1) 
        : '0.0';

    return (
        <div className="DoanhThu-container">
            {/* TOP HEADER & CONTROLS */}
            <div className="DoanhThu-top-bar">
                <div className="DoanhThu-title-area">
                    <div className="DoanhThu-title-icon">
                        <MonetizationOnIcon fontSize="inherit" />
                    </div>
                    <div>
                        <h1 className="DoanhThu-heading">BÁO CÁO KINH DOANH & TÀI CHÍNH</h1>
                        <p className="DoanhThu-subheading">
                            Thống kê hợp đồng, doanh số ký, doanh số theo lịch, thực thu, công nợ, chi phí và lãi ròng đa chu kỳ
                        </p>
                    </div>
                </div>

                <div className="DoanhThu-filter-panel">
                    {/* Period Type Selection */}
                    <ToggleButtonGroup
                        value={periodType}
                        exclusive
                        onChange={(e, val) => val && handleQuickCycleSelect(val)}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9', borderRadius: '12px', p: '3px' }}
                    >
                        <ToggleButton value="week" sx={{ fontWeight: 700, borderRadius: '10px !important', px: 1.8, py: 0.6 }}>
                            Tuần
                        </ToggleButton>
                        <ToggleButton value="month" sx={{ fontWeight: 700, borderRadius: '10px !important', px: 1.8, py: 0.6 }}>
                            Tháng
                        </ToggleButton>
                        <ToggleButton value="quarter" sx={{ fontWeight: 700, borderRadius: '10px !important', px: 1.8, py: 0.6 }}>
                            Quý
                        </ToggleButton>
                        <ToggleButton value="year" sx={{ fontWeight: 700, borderRadius: '10px !important', px: 1.8, py: 0.6 }}>
                            Năm
                        </ToggleButton>
                        <ToggleButton value="custom" sx={{ fontWeight: 700, borderRadius: '10px !important', px: 1.8, py: 0.6 }}>
                            Tùy chọn
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Sub-selectors */}
                    {periodType === 'quarter' && (
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <Select
                                value={selectedQuarter}
                                onChange={(e) => setSelectedQuarter(e.target.value)}
                                sx={{ borderRadius: '10px', fontWeight: 700 }}
                            >
                                <MenuItem value={1}>Quý 1</MenuItem>
                                <MenuItem value={2}>Quý 2</MenuItem>
                                <MenuItem value={3}>Quý 3</MenuItem>
                                <MenuItem value={4}>Quý 4</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {periodType === 'month' && (
                        <FormControl size="small" sx={{ minWidth: 110 }}>
                            <Select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                sx={{ borderRadius: '10px', fontWeight: 700 }}
                            >
                                {[...Array(12).keys()].map(i => (
                                    <MenuItem key={i + 1} value={i + 1}>Tháng {i + 1}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {(periodType === 'month' || periodType === 'quarter' || periodType === 'year') && (
                        <FormControl size="small" sx={{ minWidth: 95 }}>
                            <Select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                sx={{ borderRadius: '10px', fontWeight: 700 }}
                            >
                                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {periodType === 'custom' && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                size="small"
                                type="date"
                                label="Từ ngày"
                                InputLabelProps={{ shrink: true }}
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                sx={{ width: 140 }}
                            />
                            <TextField
                                size="small"
                                type="date"
                                label="Đến ngày"
                                InputLabelProps={{ shrink: true }}
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                sx={{ width: 140 }}
                            />
                        </Stack>
                    )}

                    {/* Refresh & Print */}
                    <Tooltip title="Làm mới dữ liệu">
                        <IconButton onClick={fetchReport} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="In báo cáo">
                        <IconButton onClick={() => window.print()} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                            <PrintIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 3 CORE FINANCIAL METRIC CARDS FOR SELECTED PERIOD */}
            <div className="metrics-grid-3">
                {/* 1. TỔNG SỐ HỢP ĐỒNG KÝ */}
                <div className="metric-card metric-contracts" onClick={() => openDetailDialog('contracts')} title="Bấm để xem danh sách chi tiết hợp đồng ký">
                    <div className="metric-card-header">
                        <div className="metric-icon-box">
                            <AssignmentIcon />
                        </div>
                        {renderGrowthBadge(comparison.soLuongHopDong)}
                    </div>
                    <div>
                        <p className="metric-title">Tổng Hợp Đồng Được Ký</p>
                        <h2 className="metric-value" style={{ color: '#2563eb' }}>
                            {currentMetrics.soLuongHopDong || 0} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>HĐ</span>
                        </h2>
                    </div>
                    <div className="metric-sub-detail">
                        <span>Kỳ trước: <strong>{previousMetrics.soLuongHopDong || 0} HĐ</strong></span>
                        <span>
                            Lệch: <strong style={{ color: (comparison.soLuongHopDong?.diff || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                                {(comparison.soLuongHopDong?.diff || 0) > 0 ? `+${comparison.soLuongHopDong?.diff}` : comparison.soLuongHopDong?.diff || 0} HĐ
                            </strong>
                        </span>
                    </div>
                    <div className="metric-click-hint">
                        <VisibilityIcon sx={{ fontSize: '0.82rem' }} /> Bấm xem {currentMetrics.soLuongHopDong || 0} hợp đồng
                    </div>
                </div>

                {/* 2. SỐ TIỀN KHÁCH HÀNG THANH TOÁN */}
                <div className="metric-card metric-collected" onClick={() => openDetailDialog('collected')} title="Bấm để xem danh sách hợp đồng đã thu tiền">
                    <div className="metric-card-header">
                        <div className="metric-icon-box">
                            <AccountBalanceWalletIcon />
                        </div>
                        <span className="metric-badge-growth badge-growth-up">
                            {collectionPercent}% thu hồi
                        </span>
                    </div>
                    <div>
                        <p className="metric-title">Số Tiền Khách Hàng Thanh Toán</p>
                        <h2 className="metric-value" style={{ color: '#0891b2' }}>
                            {formatCurrency(currentMetrics.soTienDaThu)}
                        </h2>
                    </div>
                    <div className="metric-mini-indicator">
                        <div className="metric-mini-bar-bg">
                            <div className="metric-mini-bar-fill" style={{ width: `${Math.min(100, Number(collectionPercent))}%`, background: 'linear-gradient(90deg, #06b6d4, #0891b2)' }} />
                        </div>
                    </div>
                    <div className="metric-sub-detail">
                        <span>Kỳ trước: <strong>{formatShortCurrency(previousMetrics.soTienDaThu)}</strong></span>
                        <span>Tỷ lệ: <strong style={{ color: '#0891b2' }}>{collectionPercent}%</strong></span>
                    </div>
                    <div className="metric-click-hint">
                        <VisibilityIcon sx={{ fontSize: '0.82rem' }} /> Bấm xem danh sách đã thu
                    </div>
                </div>

                {/* 3. KHÁCH HÀNG CÒN NỢ */}
                <div className="metric-card metric-debt" onClick={() => openDetailDialog('debt')} title="Bấm để xem danh sách khách hàng còn nợ">
                    <div className="metric-card-header">
                        <div className="metric-icon-box">
                            <PendingActionsIcon />
                        </div>
                        <span className="metric-badge-growth badge-growth-down">
                            {debtPercent}% nợ
                        </span>
                    </div>
                    <div>
                        <p className="metric-title">Khách Hàng Còn Nợ</p>
                        <h2 className="metric-value" style={{ color: '#ea580c' }}>
                            {formatCurrency(currentMetrics.soTienConNo)}
                        </h2>
                    </div>
                    <div className="metric-mini-indicator">
                        <div className="metric-mini-bar-bg">
                            <div className="metric-mini-bar-fill" style={{ width: `${Math.min(100, Number(debtPercent))}%`, background: 'linear-gradient(90deg, #f59e0b, #ea580c)' }} />
                        </div>
                    </div>
                    <div className="metric-sub-detail">
                        <span>Tỷ lệ nợ: <strong style={{ color: '#ea580c' }}>{debtPercent}%</strong></span>
                        <span>Nợ HT: <strong>{formatShortCurrency(systemStats.systemTotalReceivable)}</strong></span>
                    </div>
                    <div className="metric-click-hint">
                        <VisibilityIcon sx={{ fontSize: '0.82rem' }} /> Bấm xem danh sách còn nợ
                    </div>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <Paper 
                elevation={0}
                sx={{ 
                    borderRadius: '18px', 
                    mb: 3, 
                    border: '1px solid rgba(226, 232, 240, 0.9)', 
                    bgcolor: '#ffffff',
                    p: 0.6,
                    boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.03)'
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons="auto"
                    sx={{ 
                        px: 1, 
                        minHeight: 46,
                        '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px',
                            background: 'linear-gradient(90deg, #0284c7, #3b82f6)'
                        },
                        '& .MuiTab-root': { 
                            fontWeight: 750, 
                            fontSize: '0.88rem',
                            py: 1.4,
                            px: 2,
                            minHeight: 46,
                            color: '#64748b',
                            textTransform: 'none',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            '&.Mui-selected': {
                                color: '#0284c7',
                                bgcolor: '#f0f9ff'
                            },
                            '&:hover': {
                                bgcolor: '#f8fafc',
                                color: '#0f172a'
                            }
                        } 
                    }}
                >
                    <Tab icon={<BarChartIcon fontSize="small" />} iconPosition="start" label="Biểu đồ & Cơ cấu tài chính" />
                    <Tab icon={<EventAvailableIcon fontSize="small" />} iconPosition="start" label={`Hợp Đồng & Doanh Số Theo Lịch (${currentMetrics.soLuongHopDongTheoLich || 0})`} />
                    <Tab icon={<CompareArrowsIcon fontSize="small" />} iconPosition="start" label="Bảng So Sánh 4 Chu Kỳ (Tuần/Tháng/Quý/Năm)" />
                    <Tab icon={<EmojiEventsIcon fontSize="small" />} iconPosition="start" label="Xếp Hạng Doanh Số Nhân Viên" />
                    <Tab icon={<DiamondIcon fontSize="small" />} iconPosition="start" label="Khách Hàng Sử Dụng Dịch Vụ Nhiều Nhất" />
                    <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label={`Lịch Sử Khách Hàng Đã Thanh Toán (${allPaymentHistory.length})`} />
                </Tabs>
            </Paper>

            {/* TAB 0: CHARTS & FINANCIAL BREAKDOWN */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* Timeline Spline Wave Chart */}
                    <Grid item xs={12} lg={8}>
                        <div className="dashboard-section-card" style={{ height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                                <div>
                                    <h3 className="section-header-title" style={{ margin: 0 }}>
                                        🌊 Biểu Đồ Sóng Tài Chính ({selectedPeriod.currentRange?.label || 'Kỳ này'})
                                    </h3>
                                    <Typography variant="caption" color="#64748b">
                                        Trực quan hóa xu hướng ký kết, thực hiện lịch, dòng tiền thu, chi phí và lợi nhuận từng mốc ngày
                                    </Typography>
                                </div>

                                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                    {/* Wave Toggle Pills */}
                                    <div
                                        className="wave-legend-pill"
                                        onClick={() => toggleWave('revenue')}
                                        style={{
                                            backgroundColor: visibleWaves.revenue ? '#ecfdf5' : '#f1f5f9',
                                            color: visibleWaves.revenue ? '#059669' : '#94a3b8',
                                            borderColor: visibleWaves.revenue ? '#a7f3d0' : '#e2e8f0',
                                            opacity: visibleWaves.revenue ? 1 : 0.6
                                        }}
                                    >
                                        <span className="wave-dot" style={{ backgroundColor: '#10b981' }} />
                                        Doanh số ký
                                    </div>

                                    <div
                                        className="wave-legend-pill"
                                        onClick={() => toggleWave('scheduled')}
                                        style={{
                                            backgroundColor: visibleWaves.scheduled ? '#faf5ff' : '#f1f5f9',
                                            color: visibleWaves.scheduled ? '#7c3aed' : '#94a3b8',
                                            borderColor: visibleWaves.scheduled ? '#e9d5ff' : '#e2e8f0',
                                            opacity: visibleWaves.scheduled ? 1 : 0.6
                                        }}
                                    >
                                        <span className="wave-dot" style={{ backgroundColor: '#8b5cf6' }} />
                                        Doanh số lịch
                                    </div>

                                    <div
                                        className="wave-legend-pill"
                                        onClick={() => toggleWave('collected')}
                                        style={{
                                            backgroundColor: visibleWaves.collected ? '#ecfeff' : '#f1f5f9',
                                            color: visibleWaves.collected ? '#0891b2' : '#94a3b8',
                                            borderColor: visibleWaves.collected ? '#a5f3fc' : '#e2e8f0',
                                            opacity: visibleWaves.collected ? 1 : 0.6
                                        }}
                                    >
                                        <span className="wave-dot" style={{ backgroundColor: '#0284c7' }} />
                                        Đã thu
                                    </div>

                                    <div
                                        className="wave-legend-pill"
                                        onClick={() => toggleWave('expense')}
                                        style={{
                                            backgroundColor: visibleWaves.expense ? '#fff1f2' : '#f1f5f9',
                                            color: visibleWaves.expense ? '#e11d48' : '#94a3b8',
                                            borderColor: visibleWaves.expense ? '#fecdd3' : '#e2e8f0',
                                            opacity: visibleWaves.expense ? 1 : 0.6
                                        }}
                                    >
                                        <span className="wave-dot" style={{ backgroundColor: '#ef4444' }} />
                                        Tiền chi
                                    </div>

                                    <div
                                        className="wave-legend-pill"
                                        onClick={() => toggleWave('profit')}
                                        style={{
                                            backgroundColor: visibleWaves.profit ? '#eef2ff' : '#f1f5f9',
                                            color: visibleWaves.profit ? '#4f46e5' : '#94a3b8',
                                            borderColor: visibleWaves.profit ? '#c7d2fe' : '#e2e8f0',
                                            opacity: visibleWaves.profit ? 1 : 0.6
                                        }}
                                    >
                                        <span className="wave-dot" style={{ backgroundColor: '#6366f1' }} />
                                        Lãi ròng
                                    </div>
                                </Stack>
                            </div>

                            {/* Preset Buttons Bar */}
                            <Box display="flex" justifyContent="flex-end" mb={1} gap={1}>
                                <Button
                                    size="small"
                                    onClick={() => setWavePreset('all')}
                                    sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'none', py: 0.3 }}
                                >
                                    Toàn bộ sóng
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setWavePreset('rev_profit')}
                                    sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'none', py: 0.3 }}
                                >
                                    Doanh số & Lãi
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setWavePreset('cashflow')}
                                    sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'none', py: 0.3 }}
                                >
                                    Dòng tiền Thu - Chi
                                </Button>
                            </Box>

                            {renderTimelineChart()}
                        </div>
                    </Grid>

                    {/* Financial Health & Structure Breakdown */}
                    <Grid item xs={12} lg={4}>
                        <div className="dashboard-section-card" style={{ height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 className="section-header-title" style={{ margin: 0 }}>
                                    🎯 Phân Bổ Dòng Tiền & Hiệu Quả
                                </h3>
                                <Chip 
                                    label={`Lãi: ${currentMetrics.tySuatLaiRong || 0}%`} 
                                    size="small" 
                                    sx={{ fontWeight: 800, bgcolor: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }} 
                                />
                            </div>

                            <Stack spacing={2}>
                                {/* 1. Thu hồi vốn HĐ ký */}
                                <div className="health-meter-card" onClick={() => openDetailDialog('collected')} title="Bấm để xem danh sách HĐ đã thu tiền" style={{ cursor: 'pointer' }}>
                                    <div className="health-meter-header">
                                        <span className="health-meter-title">
                                            📥 Thu hồi dòng tiền (HĐ Ký)
                                        </span>
                                        <span className="health-meter-percent" style={{ bgcolor: '#ecfeff', color: '#0891b2' }}>
                                            {collectionPercent}%
                                        </span>
                                    </div>
                                    <div className="health-meter-bar">
                                        <div 
                                            className="health-meter-fill" 
                                            style={{ 
                                                width: `${Math.min(100, Number(collectionPercent))}%`, 
                                                background: 'linear-gradient(90deg, #0284c7, #38bdf8)' 
                                            }} 
                                        />
                                    </div>
                                    <div className="health-meter-caption">
                                        <span>Đã thu: <strong>{formatShortCurrency(currentMetrics.soTienDaThu)}</strong></span>
                                        <span>Tổng ký: <strong>{formatShortCurrency(currentMetrics.tongTienHopDong)}</strong></span>
                                    </div>
                                </div>

                                {/* 2. Thu hồi vốn của HĐ có lịch */}
                                <div className="health-meter-card" onClick={() => openDetailDialog('scheduled')} title="Bấm để xem danh sách HĐ có lịch phục vụ" style={{ cursor: 'pointer' }}>
                                    <div className="health-meter-header">
                                        <span className="health-meter-title">
                                            📅 Thu hồi HĐ Có Lịch Trong Kỳ
                                        </span>
                                        <span className="health-meter-percent" style={{ bgcolor: '#faf5ff', color: '#7c3aed' }}>
                                            {currentMetrics.tyLeThuHoiTheoLich || 0}%
                                        </span>
                                    </div>
                                    <div className="health-meter-bar">
                                        <div 
                                            className="health-meter-fill" 
                                            style={{ 
                                                width: `${Math.min(100, Number(currentMetrics.tyLeThuHoiTheoLich || 0))}%`, 
                                                background: 'linear-gradient(90deg, #8b5cf6, #c084fc)' 
                                            }} 
                                        />
                                    </div>
                                    <div className="health-meter-caption">
                                        <span>Đã thu: <strong>{formatShortCurrency(currentMetrics.daThuTheoLich || 0)}</strong></span>
                                        <span>Tổng lịch: <strong>{formatShortCurrency(currentMetrics.tongDoanhSoTheoLich || 0)}</strong></span>
                                    </div>
                                </div>

                                {/* 3. Công nợ khách hàng */}
                                <div className="health-meter-card" onClick={() => openDetailDialog('debt')} title="Bấm để xem danh sách khách hàng còn nợ" style={{ cursor: 'pointer' }}>
                                    <div className="health-meter-header">
                                        <span className="health-meter-title">
                                            ⚠️ Tỷ lệ công nợ còn lại
                                        </span>
                                        <span className="health-meter-percent" style={{ bgcolor: '#fff7ed', color: '#d97706' }}>
                                            {debtPercent}%
                                        </span>
                                    </div>
                                    <div className="health-meter-bar">
                                        <div 
                                            className="health-meter-fill" 
                                            style={{ 
                                                width: `${Math.min(100, Number(debtPercent))}%`, 
                                                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                                            }} 
                                        />
                                    </div>
                                    <div className="health-meter-caption">
                                        <span>Còn nợ: <strong>{formatShortCurrency(currentMetrics.soTienConNo)}</strong></span>
                                        <span>Toàn HT: <strong>{formatShortCurrency(systemStats.systemTotalReceivable)}</strong></span>
                                    </div>
                                </div>

                                {/* 4. Tỷ suất chi phí / Doanh số */}
                                <div className="health-meter-card" onClick={() => openDetailDialog('expenses')} title="Bấm để xem danh sách các khoản chi phí" style={{ cursor: 'pointer' }}>
                                    <div className="health-meter-header">
                                        <span className="health-meter-title">
                                            💸 Tỷ suất chi phí / Doanh số
                                        </span>
                                        <span className="health-meter-percent" style={{ bgcolor: '#fff1f2', color: '#e11d48' }}>
                                            {costPercent}%
                                        </span>
                                    </div>
                                    <div className="health-meter-bar">
                                        <div 
                                            className="health-meter-fill" 
                                            style={{ 
                                                width: `${Math.min(100, Number(costPercent))}%`, 
                                                background: 'linear-gradient(90deg, #f43f5e, #fb7185)' 
                                            }} 
                                        />
                                    </div>
                                    <div className="health-meter-caption">
                                        <span>Đã chi: <strong>{formatShortCurrency(currentMetrics.tongTienKhoanChi)}</strong></span>
                                        <span>Mức kiểm soát: <strong>Tốt (&lt; 35%)</strong></span>
                                    </div>
                                </div>

                                {/* 5. Tỷ suất Lãi Ròng / Doanh số */}
                                <div className="health-meter-card" onClick={() => openDetailDialog('profit')} title="Bấm để xem phân bổ lợi nhuận & hợp đồng" style={{ border: '1px solid #c7d2fe', background: 'linear-gradient(135deg, #f8faff 0%, #f5f3ff 100%)', cursor: 'pointer' }}>
                                    <div className="health-meter-header">
                                        <span className="health-meter-title" style={{ color: '#4f46e5', fontWeight: 800 }}>
                                            💎 Biên Lợi Nhuận Ròng
                                        </span>
                                        <span className="health-meter-percent" style={{ bgcolor: '#e0e7ff', color: '#4338ca' }}>
                                            {currentMetrics.tySuatLaiRong || 0}%
                                        </span>
                                    </div>
                                    <div className="health-meter-bar">
                                        <div 
                                            className="health-meter-fill" 
                                            style={{ 
                                                width: `${Math.max(0, Math.min(100, Number(currentMetrics.tySuatLaiRong || 0)))}%`, 
                                                background: 'linear-gradient(90deg, #6366f1, #a855f7)' 
                                            }} 
                                        />
                                    </div>
                                    <div className="health-meter-caption">
                                        <span>Lãi ròng: <strong>{formatShortCurrency(currentMetrics.laiRong)}</strong></span>
                                        <span style={{ color: '#4f46e5', fontWeight: 700 }}>Đạt hiệu quả cao</span>
                                    </div>
                                </div>
                            </Stack>

                            {/* 3 Quick Health Summary Boxes */}
                            <div className="health-summary-grid">
                                <div className="health-summary-item">
                                    <div className="health-summary-label">Đã Thu</div>
                                    <div className="health-summary-value" style={{ color: '#0891b2' }}>
                                        {formatShortCurrency(currentMetrics.soTienDaThu)}
                                    </div>
                                </div>
                                <div className="health-summary-item">
                                    <div className="health-summary-label">Còn Nợ</div>
                                    <div className="health-summary-value" style={{ color: '#ea580c' }}>
                                        {formatShortCurrency(currentMetrics.soTienConNo)}
                                    </div>
                                </div>
                                <div className="health-summary-item">
                                    <div className="health-summary-label">Lãi Ròng</div>
                                    <div className="health-summary-value" style={{ color: '#6366f1' }}>
                                        {formatShortCurrency(currentMetrics.laiRong)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            )}

            {/* TAB 1: DOANH SỐ & HỢP ĐỒNG THEO LỊCH TRONG KỲ (NEW TAB) */}
            {activeTab === 1 && (
                <div className="dashboard-section-card">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                        <div>
                            <h3 className="section-header-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CalendarMonthIcon style={{ color: '#9333ea', fontSize: '1.7rem' }} />
                                Danh Sách Hợp Đồng & Doanh Số Theo Lịch ({selectedPeriod.currentRange?.label || 'Kỳ này'})
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                                Thống kê chi tiết toàn bộ các hợp đồng có lịch diễn ra trong khoảng thời gian đang chọn (Lịch chụp, ăn hỏi, cưới, chỉnh ảnh, trả ảnh, mượn/trả đồ)
                            </p>
                        </div>
                    </div>

                    {/* KPI Summary 4 Cards for Scheduled Contracts */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {/* 1. Tổng Doanh Số HĐ Có Lịch */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #e9d5ff',
                                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.08)'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#9333ea', color: '#fff', display: 'flex' }}>
                                        <MonetizationOnIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Doanh Số Theo Lịch
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#581c87', lineHeight: 1.2 }}>
                                            {formatCurrency(currentMetrics.tongDoanhSoTheoLich || 0)}
                                        </Typography>
                                    </div>
                                </Box>
                                <Typography variant="caption" color="#7e22ce" display="block" mt={1} pt={0.8} borderTop="1px dashed #d8b4fe">
                                    Tính từ các HĐ có lịch phục vụ trong kỳ
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* 2. Số Lượng HĐ Có Lịch */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #bfdbfe',
                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#2563eb', color: '#fff', display: 'flex' }}>
                                        <EventAvailableIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Tổng Hợp Đồng Có Lịch
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e3a8a', lineHeight: 1.2 }}>
                                            {currentMetrics.soLuongHopDongTheoLich || 0} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2563eb' }}>HĐ</span>
                                        </Typography>
                                    </div>
                                </Box>
                                <Typography variant="caption" color="#1d4ed8" display="block" mt={1} pt={0.8} borderTop="1px dashed #93c5fd">
                                    📸 {scheduleTypeCounts.ngayChup} Chụp • 💍 {scheduleTypeCounts.ngayAnHoi} Hỏi • 👰 {scheduleTypeCounts.ngayCuoi} Cưới
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* 3. Đã Thu Hồi Theo Lịch */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #bbf7d0',
                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#16a34a', color: '#fff', display: 'flex' }}>
                                        <AccountBalanceWalletIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Đã Thu Hồi
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#14532d', lineHeight: 1.2 }}>
                                            {formatCurrency(currentMetrics.daThuTheoLich || 0)}
                                        </Typography>
                                    </div>
                                </Box>
                                <Typography variant="caption" color="#15803d" display="block" mt={1} pt={0.8} borderTop="1px dashed #86efac">
                                    Tỷ lệ thu hồi đạt: <strong>{currentMetrics.tyLeThuHoiTheoLich || 0}%</strong>
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* 4. Công Nợ Cần Thu Hồi */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #fed7aa',
                                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#ea580c', color: '#fff', display: 'flex' }}>
                                        <PendingActionsIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Công Nợ Còn Lại
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#7c2d12', lineHeight: 1.2 }}>
                                            {formatCurrency(currentMetrics.conNoTheoLich || 0)}
                                        </Typography>
                                    </div>
                                </Box>
                                <Typography variant="caption" color="#c2410c" display="block" mt={1} pt={0.8} borderTop="1px dashed #fdba74">
                                    Cần thu hoàn tất trước khi bàn giao sản phẩm
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Filter & Search Toolbar */}
                    <div className="schedule-filter-toolbar">
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" width="100%">
                            {/* Search Input */}
                            <TextField
                                size="small"
                                placeholder="Tìm mã hợp đồng, tên khách hàng, SĐT, sale..."
                                value={scheduleSearch}
                                onChange={(e) => setScheduleSearch(e.target.value)}
                                sx={{
                                    flex: 1,
                                    bgcolor: '#ffffff',
                                    borderRadius: '10px',
                                    '& .MuiOutlinedInput-root': { borderRadius: '10px' }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#94a3b8' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: scheduleSearch ? (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setScheduleSearch('')}>
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null
                                }}
                            />

                            {/* Schedule Type Filter */}
                            <FormControl size="small" sx={{ minWidth: 200, bgcolor: '#ffffff', borderRadius: '10px' }}>
                                <Select
                                    value={selectedScheduleFilter}
                                    onChange={(e) => setSelectedScheduleFilter(e.target.value)}
                                    sx={{ borderRadius: '10px', fontWeight: 600 }}
                                    displayEmpty
                                >
                                    <MenuItem value="all">📅 Tất cả loại lịch ({scheduleTypeCounts.all})</MenuItem>
                                    <MenuItem value="ngayChup">📸 Lịch chụp ({scheduleTypeCounts.ngayChup})</MenuItem>
                                    <MenuItem value="ngayAnHoi">💍 Lịch ăn hỏi ({scheduleTypeCounts.ngayAnHoi})</MenuItem>
                                    <MenuItem value="ngayCuoi">👰 Lịch ngày cưới ({scheduleTypeCounts.ngayCuoi})</MenuItem>
                                    <MenuItem value="ngayChinhAnh">🎨 Lịch chỉnh ảnh ({scheduleTypeCounts.ngayChinhAnh})</MenuItem>
                                    <MenuItem value="ngayTraAnh">🖼️ Lịch trả ảnh ({scheduleTypeCounts.ngayTraAnh})</MenuItem>
                                    <MenuItem value="ngayChuyenInAnh">🖨️ Lịch chuyển in ({scheduleTypeCounts.ngayChuyenInAnh})</MenuItem>
                                    <MenuItem value="ngayMuonDo">👗 Lịch mượn đồ ({scheduleTypeCounts.ngayMuonDo})</MenuItem>
                                    <MenuItem value="ngayTraDo">👔 Lịch trả đồ ({scheduleTypeCounts.ngayTraDo})</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Payment Status Filter */}
                            <FormControl size="small" sx={{ minWidth: 170, bgcolor: '#ffffff', borderRadius: '10px' }}>
                                <Select
                                    value={selectedPaymentFilter}
                                    onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                                    sx={{ borderRadius: '10px', fontWeight: 600 }}
                                >
                                    <MenuItem value="all">💳 Tất cả thanh toán</MenuItem>
                                    <MenuItem value="Đã thanh toán đủ">✅ Đã thanh toán đủ</MenuItem>
                                    <MenuItem value="Đang thanh toán">⏳ Đang thanh toán (còn nợ)</MenuItem>
                                    <MenuItem value="Chưa thanh toán">❌ Chưa thanh toán</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Reset filter button */}
                            {(scheduleSearch || selectedScheduleFilter !== 'all' || selectedPaymentFilter !== 'all') && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setScheduleSearch('');
                                        setSelectedScheduleFilter('all');
                                        setSelectedPaymentFilter('all');
                                    }}
                                    sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, borderColor: '#cbd5e1', color: '#64748b' }}
                                >
                                    Đặt lại
                                </Button>
                            )}
                        </Stack>
                    </div>

                    {/* Scheduled Contracts Table */}
                    {filteredScheduledContracts.length === 0 ? (
                        <Box p={5} textAlign="center" color="#94a3b8" bgcolor="#f8fafc" borderRadius="14px" border="1px dashed #cbd5e1">
                            <EventAvailableIcon sx={{ fontSize: '3rem', color: '#cbd5e1', mb: 1 }} />
                            <Typography variant="body1" fontWeight={700} color="#64748b">
                                Không tìm thấy hợp đồng nào có lịch trong kỳ phù hợp với bộ lọc
                            </Typography>
                            <Typography variant="caption" color="#94a3b8">
                                Hãy thử thay đổi loại lịch, trạng thái thanh toán hoặc từ khóa tìm kiếm
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflowX: 'auto' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontWeight: 800, width: 60 }}>STT</TableCell>
                                        <TableCell sx={{ fontWeight: 800, minWidth: 150 }}>Mã HĐ & Ngày Ký</TableCell>
                                        <TableCell sx={{ fontWeight: 800, minWidth: 200 }}>Khách Hàng</TableCell>
                                        <TableCell sx={{ fontWeight: 800, minWidth: 260 }}>Lịch Thực Hiện Trong Kỳ</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800, minWidth: 140 }}>Doanh Số HĐ</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800, minWidth: 180 }}>Tiến Độ Thanh Toán</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800, minWidth: 130 }}>Trạng Thái</TableCell>
                                        <TableCell sx={{ fontWeight: 800, minWidth: 140 }}>Nhân Viên Sale</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredScheduledContracts.map((hd, idx) => {
                                        const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
                                        const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
                                        const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));
                                        const percentPaid = val > 0 ? Math.min(100, Math.round((paid / val) * 100)) : 0;
                                        const cust = hd.khachHang1 || {};
                                        const payStatus = hd.thanhToan?.trangThaiThanhToan || (debt === 0 ? 'Đã thanh toán đủ' : paid > 0 ? 'Đang thanh toán' : 'Chưa thanh toán');

                                        return (
                                            <TableRow
                                                key={hd._id || hd.maHopDong || idx}
                                                sx={{
                                                    '&:hover': { bgcolor: '#f8fafc' },
                                                    transition: 'background-color 0.15s ease'
                                                }}
                                            >
                                                {/* STT */}
                                                <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>
                                                    {idx + 1}
                                                </TableCell>

                                                {/* Mã HĐ & Ngày Ký */}
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e40af' }}>
                                                        {hd.maHopDong}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                        Ký: {formatDateOnly(hd.ngayHopDong)}
                                                    </Typography>
                                                </TableCell>

                                                {/* Khách hàng */}
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {cust.tenKhachHang || ('Khách hàng ' + hd.maHopDong)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CallIcon sx={{ fontSize: '0.75rem' }} /> {cust.soDienThoai || '-'}
                                                        {cust.diaChi && cust.diaChi !== '-' ? ` • ${cust.diaChi}` : ''}
                                                    </Typography>
                                                </TableCell>

                                                {/* Lịch Trong Kỳ */}
                                                <TableCell>
                                                    <div className="schedule-badges-wrapper">
                                                        {hd.matchedSchedules && hd.matchedSchedules.length > 0 ? (
                                                            hd.matchedSchedules.map((s, sIdx) => (
                                                                <span key={sIdx} className={`schedule-badge-item ${s.className || 'badge-ngayChup'}`}>
                                                                    <span className="schedule-badge-icon">{s.icon}</span>
                                                                    <span className="schedule-badge-label">{s.label}:</span>
                                                                    <span className="schedule-badge-date">{formatDateOnly(s.date)}</span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <Typography variant="caption" color="#94a3b8">Không có lịch trong kỳ</Typography>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Doanh Số HĐ */}
                                                <TableCell align="right">
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                                                        {formatCurrency(val)}
                                                    </Typography>
                                                </TableCell>

                                                {/* Tiến Độ Thanh Toán */}
                                                <TableCell align="center">
                                                    <Box sx={{ width: '100%', minWidth: 140 }}>
                                                        <Box display="flex" justifyContent="space-between" mb={0.3}>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7' }}>
                                                                Thu: {formatShortCurrency(paid)}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: debt > 0 ? '#ea580c' : '#16a34a' }}>
                                                                {percentPaid}%
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={percentPaid}
                                                            sx={{
                                                                height: 6,
                                                                borderRadius: 3,
                                                                bgcolor: '#e2e8f0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: percentPaid >= 100 ? '#16a34a' : percentPaid >= 50 ? '#0284c7' : '#f59e0b'
                                                                }
                                                            }}
                                                        />
                                                        {debt > 0 && (
                                                            <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 600, display: 'block', mt: 0.2 }}>
                                                                Còn nợ: {formatShortCurrency(debt)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>

                                                {/* Trạng Thái Thanh Toán */}
                                                <TableCell align="center">
                                                    <Chip
                                                        label={payStatus}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem',
                                                            bgcolor: payStatus === 'Đã thanh toán đủ' ? '#dcfce7' : payStatus === 'Đang thanh toán' ? '#fef3c7' : '#fee2e2',
                                                            color: payStatus === 'Đã thanh toán đủ' ? '#15803d' : payStatus === 'Đang thanh toán' ? '#b45309' : '#b91c1c',
                                                            border: payStatus === 'Đã thanh toán đủ' ? '1px solid #86efac' : payStatus === 'Đang thanh toán' ? '1px solid #fcd34d' : '1px solid #fca5a5'
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Nhân Viên Sale */}
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                        {hd.nguoiPhucVu?.banHang || 'Chưa phân công'}
                                                    </Typography>
                                                    {hd.nguoiPhucVu?.chupAnh && (
                                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                            Thợ: {hd.nguoiPhucVu.chupAnh}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            )}

            {/* TAB 2: MULTI-CYCLE COMPARISON TABLE (TUẦN, THÁNG, QUÝ, NĂM) */}
            {activeTab === 2 && (
                <div className="dashboard-section-card">
                    <h3 className="section-header-title">
                        <CompareArrowsIcon style={{ color: '#0284c7' }} />
                        Bảng So Sánh Chỉ Số Kinh Doanh & Lãi Ròng Đa Chu Kỳ
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '-12px', marginBottom: '20px' }}>
                        Theo dõi biến động và tỷ lệ tăng trưởng % chi tiết của cả 4 chu kỳ chuẩn (Tuần, Tháng, Quý, Năm)
                    </p>

                    <div className="comparison-table-wrapper">
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>Chỉ Số Kinh Doanh</th>
                                    <th>Tuần Này vs Tuần Trước</th>
                                    <th>Tháng Này vs Tháng Trước</th>
                                    <th>Quý Này vs Quý Trước</th>
                                    <th>Năm Này vs Năm Trước</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* 1. Tổng số hợp đồng ký */}
                                <tr>
                                    <td>
                                        <strong style={{ color: '#2563eb' }}>📝 Số HĐ ký trong kỳ</strong>
                                    </td>
                                    <td>
                                        <div><strong>{overview.week?.current?.soLuongHopDong || 0} HĐ</strong> (trước: {overview.week?.previous?.soLuongHopDong || 0})</div>
                                        <div>{renderGrowthBadge(overview.week?.comparison?.soLuongHopDong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{overview.month?.current?.soLuongHopDong || 0} HĐ</strong> (trước: {overview.month?.previous?.soLuongHopDong || 0})</div>
                                        <div>{renderGrowthBadge(overview.month?.comparison?.soLuongHopDong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{overview.quarter?.current?.soLuongHopDong || 0} HĐ</strong> (trước: {overview.quarter?.previous?.soLuongHopDong || 0})</div>
                                        <div>{renderGrowthBadge(overview.quarter?.comparison?.soLuongHopDong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{overview.year?.current?.soLuongHopDong || 0} HĐ</strong> (trước: {overview.year?.previous?.soLuongHopDong || 0})</div>
                                        <div>{renderGrowthBadge(overview.year?.comparison?.soLuongHopDong)}</div>
                                    </td>
                                </tr>

                                {/* 2. Tổng doanh số hợp đồng ký */}
                                <tr>
                                    <td>
                                        <strong style={{ color: '#16a34a' }}>💰 Doanh số ký trong kỳ</strong>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.week?.current?.tongTienHopDong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.week?.comparison?.tongTienHopDong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.month?.current?.tongTienHopDong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.month?.comparison?.tongTienHopDong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.quarter?.current?.tongTienHopDong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.quarter?.comparison?.tongTienHopDong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.year?.current?.tongTienHopDong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.year?.comparison?.tongTienHopDong)}</div>
                                    </td>
                                </tr>

                                {/* 3. Số HĐ có lịch thực hiện */}
                                <tr style={{ backgroundColor: '#faf5ff' }}>
                                    <td>
                                        <strong style={{ color: '#9333ea' }}>📅 Số HĐ có lịch trong kỳ</strong>
                                    </td>
                                    <td>
                                        <div><strong>{overview.week?.current?.soLuongHopDongTheoLich || 0} HĐ</strong> (trước: {overview.week?.previous?.soLuongHopDongTheoLich || 0})</div>
                                        <div>{renderGrowthBadge(overview.week?.comparison?.soLuongHopDongTheoLich)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{overview.month?.current?.soLuongHopDongTheoLich || 0} HĐ</strong> (trước: {overview.month?.previous?.soLuongHopDongTheoLich || 0})</div>
                                        <div>{renderGrowthBadge(overview.month?.comparison?.soLuongHopDongTheoLich)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{overview.quarter?.current?.soLuongHopDongTheoLich || 0} HĐ</strong> (trước: {overview.quarter?.previous?.soLuongHopDongTheoLich || 0})</div>
                                        <div>{renderGrowthBadge(overview.quarter?.comparison?.soLuongHopDongTheoLich)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{overview.year?.current?.soLuongHopDongTheoLich || 0} HĐ</strong> (trước: {overview.year?.previous?.soLuongHopDongTheoLich || 0})</div>
                                        <div>{renderGrowthBadge(overview.year?.comparison?.soLuongHopDongTheoLich)}</div>
                                    </td>
                                </tr>

                                {/* 4. Doanh số theo lịch trong kỳ */}
                                <tr style={{ backgroundColor: '#faf5ff' }}>
                                    <td>
                                        <strong style={{ color: '#9333ea' }}>🎯 Doanh số theo lịch trong kỳ</strong>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.week?.current?.tongDoanhSoTheoLich)}</strong></div>
                                        <div>{renderGrowthBadge(overview.week?.comparison?.tongDoanhSoTheoLich)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.month?.current?.tongDoanhSoTheoLich)}</strong></div>
                                        <div>{renderGrowthBadge(overview.month?.comparison?.tongDoanhSoTheoLich)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.quarter?.current?.tongDoanhSoTheoLich)}</strong></div>
                                        <div>{renderGrowthBadge(overview.quarter?.comparison?.tongDoanhSoTheoLich)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.year?.current?.tongDoanhSoTheoLich)}</strong></div>
                                        <div>{renderGrowthBadge(overview.year?.comparison?.tongDoanhSoTheoLich)}</div>
                                    </td>
                                </tr>

                                {/* 5. Tổng tiền đã thu */}
                                <tr>
                                    <td>
                                        <strong style={{ color: '#0891b2' }}>📥 Tổng tiền đã thu</strong>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.week?.current?.soTienDaThu)}</strong></div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.month?.current?.soTienDaThu)}</strong></div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.quarter?.current?.soTienDaThu)}</strong></div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.year?.current?.soTienDaThu)}</strong></div>
                                    </td>
                                </tr>

                                {/* 6. Tổng tiền khách hàng còn nợ */}
                                <tr>
                                    <td>
                                        <strong style={{ color: '#ea580c' }}>⚠️ Khách hàng còn nợ</strong>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.week?.current?.soTienConNo)}</strong></div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.month?.current?.soTienConNo)}</strong></div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.quarter?.current?.soTienConNo)}</strong></div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.year?.current?.soTienConNo)}</strong></div>
                                    </td>
                                </tr>

                                {/* 7. Tổng tiền chi */}
                                <tr>
                                    <td>
                                        <strong style={{ color: '#dc2626' }}>💸 Tổng tiền chi</strong>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.week?.current?.tongTienKhoanChi)}</strong></div>
                                        <div>{renderGrowthBadge(overview.week?.comparison?.tongTienKhoanChi, true)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.month?.current?.tongTienKhoanChi)}</strong></div>
                                        <div>{renderGrowthBadge(overview.month?.comparison?.tongTienKhoanChi, true)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.quarter?.current?.tongTienKhoanChi)}</strong></div>
                                        <div>{renderGrowthBadge(overview.quarter?.comparison?.tongTienKhoanChi, true)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.year?.current?.tongTienKhoanChi)}</strong></div>
                                        <div>{renderGrowthBadge(overview.year?.comparison?.tongTienKhoanChi, true)}</div>
                                    </td>
                                </tr>

                                {/* 8. Lãi Ròng */}
                                <tr>
                                    <td>
                                        <strong style={{ color: '#7c3aed' }}>📈 Lãi Ròng</strong>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.week?.current?.laiRong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.week?.comparison?.laiRong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.month?.current?.laiRong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.month?.comparison?.laiRong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.quarter?.current?.laiRong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.quarter?.comparison?.laiRong)}</div>
                                    </td>
                                    <td>
                                        <div><strong>{formatCurrency(overview.year?.current?.laiRong)}</strong></div>
                                        <div>{renderGrowthBadge(overview.year?.comparison?.laiRong)}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: SALES STAFF RANKINGS */}
            {activeTab === 3 && (
                <div className="dashboard-section-card">
                    <h3 className="section-header-title">
                        <EmojiEventsIcon style={{ color: '#f59e0b' }} />
                        Xếp Hạng Doanh Số Nhân Viên Kinh Doanh ({selectedPeriod.currentRange?.label || 'Kỳ này'})
                    </h3>

                    {topSales.length === 0 ? (
                        <Box p={4} textAlign="center" color="#94a3b8">
                            Chưa có dữ liệu hợp đồng phân công cho nhân viên trong kỳ này.
                        </Box>
                    ) : (
                        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontWeight: 800, width: 80 }}>Hạng</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>Nhân Viên Sale</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800 }}>Số Hợp Đồng Ký</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800 }}>Doanh Số Tạo Ra</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800 }}>Số Tiền Đã Thu</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topSales.map((sale, idx) => {
                                        let medal = `${idx + 1}`;
                                        if (idx === 0) medal = "🥇 Hạng 1";
                                        else if (idx === 1) medal = "🥈 Hạng 2";
                                        else if (idx === 2) medal = "🥉 Hạng 3";

                                        return (
                                            <TableRow
                                                key={sale.name}
                                                sx={{ bgcolor: idx === 0 ? '#fefce8' : 'inherit', '&:hover': { bgcolor: '#f8fafc' } }}
                                            >
                                                <TableCell align="center" sx={{ fontWeight: 800, color: idx < 3 ? '#b45309' : '#64748b' }}>
                                                    {medal}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                    {sale.name}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={`${sale.count} HĐ`} size="small" sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 800 }} />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a' }}>
                                                    {formatCurrency(sale.revenue)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: '#0284c7' }}>
                                                    {formatCurrency(sale.collected)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            )}

            {/* TAB 4: TOP CUSTOMERS WITH MOST SERVICES */}
            {activeTab === 4 && (
                <div className="dashboard-section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                        <div>
                            <h3 className="section-header-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <DiamondIcon style={{ color: '#ec4899', fontSize: '1.6rem' }} />
                                Khách Hàng Sử Dụng Dịch Vụ Nhiều Nhất ({selectedPeriod.currentRange?.label || 'Kỳ này'})
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                                Xếp hạng khách hàng thân thiết dựa trên tổng số lượng dịch vụ đã đăng ký và doanh số đóng góp
                            </p>
                        </div>
                    </div>

                    {/* Summary KPI Cards for Customers */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {/* 1. VIP #1 Customer */}
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #fbcfe8',
                                    background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#ec4899', color: '#fff', display: 'flex' }}>
                                        <EmojiEventsIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Khách Hàng VIP #1
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#831843', lineHeight: 1.2 }}>
                                            {topCustomers[0]?.name || 'Chưa có'}
                                        </Typography>
                                    </div>
                                </Box>
                                {topCustomers[0] ? (
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} pt={1} borderTop="1px dashed #f472b6">
                                        <Typography variant="body2" color="#9d174d" fontWeight={700}>
                                            🎯 {topCustomers[0].serviceCount} dịch vụ ({topCustomers[0].contractCount} HĐ)
                                        </Typography>
                                        <Typography variant="body2" color="#be185d" fontWeight={800}>
                                            {formatCurrency(topCustomers[0].totalSpent)}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography variant="caption" color="#9d174d">Chưa có hợp đồng phát sinh</Typography>
                                )}
                            </Paper>
                        </Grid>

                        {/* 2. Total Customers in Period */}
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #bae6fd',
                                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#0284c7', color: '#fff', display: 'flex' }}>
                                        <PeopleAltIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Tổng Khách Hàng Kỳ Này
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0c4a6e', lineHeight: 1.2 }}>
                                            {topCustomers.length} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0284c7' }}>Khách</span>
                                        </Typography>
                                    </div>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} pt={1} borderTop="1px dashed #7dd3fc">
                                    <Typography variant="body2" color="#0369a1" fontWeight={600}>
                                        Tổng hợp đồng phát sinh
                                    </Typography>
                                    <Typography variant="body2" color="#0c4a6e" fontWeight={800}>
                                        {currentMetrics.soLuongHopDong || 0} HĐ
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 3. Average Services per Customer */}
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: '16px',
                                    border: '1px solid #ddd6fe',
                                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ p: 1, borderRadius: '12px', bgcolor: '#7c3aed', color: '#fff', display: 'flex' }}>
                                        <CategoryIcon fontSize="small" />
                                    </Box>
                                    <div>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Trung Bình Dịch Vụ / Khách
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#4c1d95', lineHeight: 1.2 }}>
                                            {topCustomers.length > 0
                                                ? (topCustomers.reduce((acc, c) => acc + (c.serviceCount || 0), 0) / topCustomers.length).toFixed(1)
                                                : 0} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#7c3aed' }}>Dịch vụ</span>
                                        </Typography>
                                    </div>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1.5} pt={1} borderTop="1px dashed #c4b5fd">
                                    <Typography variant="body2" color="#6d28d9" fontWeight={600}>
                                        Tổng lượt dịch vụ dùng
                                    </Typography>
                                    <Typography variant="body2" color="#4c1d95" fontWeight={800}>
                                        {topCustomers.reduce((acc, c) => acc + (c.serviceCount || 0), 0)} lượt
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Customer Rankings Table */}
                    {topCustomers.length === 0 ? (
                        <Box p={4} textAlign="center" color="#94a3b8">
                            Chưa có dữ liệu khách hàng sử dụng dịch vụ trong kỳ này.
                        </Box>
                    ) : (
                        <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontWeight: 800, width: 85 }}>Thứ Hạng</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>Khách Hàng</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800 }}>Số Lượng Dịch Vụ</TableCell>
                                        <TableCell sx={{ fontWeight: 800 }}>Dịch Vụ Đã Đăng Ký</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800 }}>Số HĐ</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800 }}>Tổng Chi Tiêu</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 800 }}>Đã Thu / Còn Nợ</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 800 }}>Gần Nhất</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topCustomers.map((cust, idx) => {
                                        let medal = `${idx + 1}`;
                                        let rowBg = 'inherit';
                                        if (idx === 0) {
                                            medal = "🥇 Hạng 1";
                                            rowBg = '#fdf2f8';
                                        } else if (idx === 1) {
                                            medal = "🥈 Hạng 2";
                                            rowBg = '#fdf4ff';
                                        } else if (idx === 2) {
                                            medal = "🥉 Hạng 3";
                                            rowBg = '#f8fafc';
                                        }

                                        return (
                                            <TableRow
                                                key={cust.id || idx}
                                                sx={{ bgcolor: rowBg, '&:hover': { bgcolor: '#f1f5f9' } }}
                                            >
                                                <TableCell align="center" sx={{ fontWeight: 800, color: idx < 3 ? '#db2777' : '#64748b' }}>
                                                    {medal}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {cust.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CallIcon sx={{ fontSize: '0.75rem' }} /> {cust.phone} {cust.address && cust.address !== '-' ? `• ${cust.address}` : ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${cust.serviceCount} dịch vụ`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: idx === 0 ? '#fbcfe8' : '#eff6ff',
                                                            color: idx === 0 ? '#9d174d' : '#1d4ed8',
                                                            fontWeight: 800,
                                                            border: idx === 0 ? '1px solid #f472b6' : '1px solid #bfdbfe'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ maxWidth: 300 }}>
                                                    <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ py: 0.5 }}>
                                                        {cust.services && cust.services.length > 0 ? (
                                                            cust.services.map((s, sIdx) => (
                                                                <Chip
                                                                  key={sIdx}
                                                                  label={s}
                                                                  size="small"
                                                                  sx={{
                                                                      fontSize: '0.72rem',
                                                                      height: '22px',
                                                                      bgcolor: '#f1f5f9',
                                                                      color: '#334155',
                                                                      fontWeight: 600
                                                                  }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="caption" color="#94a3b8">Hợp đồng dịch vụ cưới</Typography>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${cust.contractCount} HĐ`}
                                                        size="small"
                                                        sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a' }}>
                                                    {formatCurrency(cust.totalSpent)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>
                                                        {formatShortCurrency(cust.totalPaid)}
                                                    </Typography>
                                                    {cust.totalDebt > 0 && (
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#ea580c', display: 'block' }}>
                                                            Nợ: {formatShortCurrency(cust.totalDebt)}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                        {cust.lastDate ? new Date(cust.lastDate).toLocaleDateString('vi-VN') : '-'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            )}

            {/* TAB 5: DANH SÁCH LỊCH SỬ KHÁCH HÀNG ĐÃ THANH TOÁN */}
            {activeTab === 5 && (
                <div className="dashboard-section-card">
                    {/* Header bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                        <div>
                            <h3 className="section-header-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ReceiptLongIcon style={{ color: '#0891b2', fontSize: '1.6rem' }} />
                                Danh Sách Lịch Sử Khách Hàng Đã Thanh Toán
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                                Toàn bộ các đợt thanh toán, đặt cọc và quyết toán của khách hàng theo thời gian thực
                            </p>
                        </div>

                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                            {/* Scope filter: All time vs Selected Period */}
                            <ToggleButtonGroup
                                value={paymentScope}
                                exclusive
                                onChange={(e, val) => val && setPaymentScope(val)}
                                size="small"
                                sx={{ bgcolor: '#f1f5f9', borderRadius: '10px' }}
                            >
                                <ToggleButton value="all" sx={{ fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '8px !important' }}>
                                    Tất cả thời gian
                                </ToggleButton>
                                <ToggleButton value="period" sx={{ fontWeight: 700, px: 1.5, py: 0.5, borderRadius: '8px !important' }}>
                                    Trong kỳ đang chọn
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {/* Export Excel */}
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={exportPaymentHistoryToExcel}
                                disabled={filteredPaymentHistory.length === 0}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 750,
                                    color: '#16a34a',
                                    borderColor: '#86efac',
                                    bgcolor: '#f0fdf4',
                                    '&:hover': { bgcolor: '#dcfce7', borderColor: '#4ade80' }
                                }}
                            >
                                Xuất Excel ({filteredPaymentHistory.length})
                            </Button>
                        </Stack>
                    </div>

                    {/* Summary 4 Stat Cards Strip */}
                    <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <div className="payment-stat-card">
                                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#e0f2fe', color: '#0284c7', display: 'flex' }}>
                                    <ReceiptLongIcon fontSize="medium" />
                                </Box>
                                <div>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        Tổng Lượt Thu
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                        {paymentStats.totalCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>lượt</span>
                                    </Typography>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <div className="payment-stat-card">
                                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#dcfce7', color: '#16a34a', display: 'flex' }}>
                                    <MonetizationOnIcon fontSize="medium" />
                                </Box>
                                <div>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        Tổng Tiền Thu Được
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a', lineHeight: 1.2 }}>
                                        {formatCurrency(paymentStats.totalAmount)}
                                    </Typography>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <div className="payment-stat-card">
                                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#eff6ff', color: '#2563eb', display: 'flex' }}>
                                    <AccountBalanceWalletIcon fontSize="medium" />
                                </Box>
                                <div>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        Thu Chuyển Khoản
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#2563eb', lineHeight: 1.2 }}>
                                        {formatCurrency(paymentStats.bankAmount)}
                                    </Typography>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <div className="payment-stat-card">
                                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#fef3c7', color: '#d97706', display: 'flex' }}>
                                    <SavingsIcon fontSize="medium" />
                                </Box>
                                <div>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        Thu Tiền Mặt
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706', lineHeight: 1.2 }}>
                                        {formatCurrency(paymentStats.cashAmount)}
                                    </Typography>
                                </div>
                            </div>
                        </Grid>
                    </Grid>

                    {/* Filter & Search Toolbar */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Tìm theo mã HĐ, tên khách hàng, SĐT, nội dung thanh toán, nhân viên..."
                            value={paymentSearch}
                            onChange={(e) => {
                                setPaymentSearch(e.target.value);
                                setPaymentPage(0);
                            }}
                            sx={{
                                flex: 1,
                                minWidth: 280,
                                bgcolor: '#ffffff',
                                borderRadius: '12px',
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: paymentSearch ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => { setPaymentSearch(''); setPaymentPage(0); }}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />

                        {/* Payment Method Selector */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <Select
                                value={paymentMethodFilter}
                                onChange={(e) => {
                                    setPaymentMethodFilter(e.target.value);
                                    setPaymentPage(0);
                                }}
                                sx={{ borderRadius: '12px', fontWeight: 700 }}
                            >
                                <MenuItem value="all">Tất cả phương thức</MenuItem>
                                <MenuItem value="Tiền mặt">💵 Tiền mặt</MenuItem>
                                <MenuItem value="Chuyển khoản">💳 Chuyển khoản</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Payment Table */}
                    {filteredPaymentHistory.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center', color: '#94a3b8' }}>
                            <ReceiptLongIcon sx={{ fontSize: '3.5rem', color: '#cbd5e1', mb: 1 }} />
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#64748b' }}>
                                {paymentSearch ? 'Không tìm thấy lượt thanh toán nào phù hợp' : 'Chưa có dữ liệu thanh toán'}
                            </Typography>
                            {paymentSearch && (
                                <Button size="small" onClick={() => { setPaymentSearch(''); setPaymentPage(0); }} sx={{ mt: 1, textTransform: 'none' }}>
                                    Xóa tìm kiếm
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', maxHeight: '60vh' }} className="custom-scroll">
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { bgcolor: '#f8fafc', fontWeight: 800, color: '#475569', py: 1.2 } }}>
                                            <TableCell align="center" width={50}>STT</TableCell>
                                            <TableCell width={120}>Mã HĐ</TableCell>
                                            <TableCell width={180}>Khách Hàng</TableCell>
                                            <TableCell width={140}>Ngày Thu</TableCell>
                                            <TableCell align="right" width={140}>Số Tiền Thu</TableCell>
                                            <TableCell width={130} align="center">Phương Thức</TableCell>
                                            <TableCell>Nội Dung / Đợt Thu</TableCell>
                                            <TableCell width={130}>Người Thu</TableCell>
                                            <TableCell width={140} align="center">Trạng Thái HĐ</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredPaymentHistory
                                            .slice(paymentPage * paymentRowsPerPage, paymentPage * paymentRowsPerPage + paymentRowsPerPage)
                                            .map((item, idx) => {
                                                const globalIdx = paymentPage * paymentRowsPerPage + idx + 1;
                                                const isBank = (item.phuongThuc || '').toLowerCase().includes('chuyển khoản') || (item.phuongThuc || '').toLowerCase().includes('ck');
                                                const isPaidFull = item.trangThaiHD === 'Đã thanh toán đủ' || item.conLaiHD === 0;

                                                return (
                                                    <TableRow key={item.id || idx} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                                        <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                            {globalIdx}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                                                                {item.maHopDong}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 750, color: '#0f172a' }}>
                                                                {item.khachHang}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <CallIcon sx={{ fontSize: '0.72rem' }} /> {item.soDienThoai}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                                                            {item.ngayThanhToan ? (
                                                                <>
                                                                    <div>{new Date(item.ngayThanhToan).toLocaleDateString('vi-VN')}</div>
                                                                    <Typography variant="caption" color="#94a3b8">
                                                                        {new Date(item.ngayThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                    </Typography>
                                                                </>
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a', fontSize: '0.92rem' }}>
                                                            {formatCurrency(item.soTien)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={item.phuongThuc}
                                                                size="small"
                                                                className={`payment-method-chip ${isBank ? 'payment-method-ck' : 'payment-method-tm'}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                            {item.noiDung}
                                                        </TableCell>
                                                        <TableCell sx={{ color: '#475569', fontWeight: 600 }}>
                                                            {item.nhanVien}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip
                                                                label={item.trangThaiHD}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 750,
                                                                    fontSize: '0.74rem',
                                                                    bgcolor: isPaidFull ? '#dcfce7' : '#fef3c7',
                                                                    color: isPaidFull ? '#15803d' : '#b45309',
                                                                    border: `1px solid ${isPaidFull ? '#bbf7d0' : '#fde68a'}`
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <TablePagination
                                component="div"
                                count={filteredPaymentHistory.length}
                                page={paymentPage}
                                onPageChange={(e, newPage) => setPaymentPage(newPage)}
                                rowsPerPage={paymentRowsPerPage}
                                onRowsPerPageChange={(e) => {
                                    setPaymentRowsPerPage(parseInt(e.target.value, 10));
                                    setPaymentPage(0);
                                }}
                                rowsPerPageOptions={[10, 20, 50, 100]}
                                labelRowsPerPage="Số dòng:"
                                labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
                                sx={{ borderTop: '1px solid #e2e8f0', mt: 1 }}
                            />
                        </>
                    )}
                </div>
            )}

            {/* DETAIL DRILL-DOWN MODAL FOR STATISTICAL CARDS */}
            <Dialog
                open={detailModal.open}
                onClose={closeDetailDialog}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 1,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        maxHeight: '90vh'
                    }
                }}
            >
                {/* Modal Header */}
                <DialogTitle sx={{ pb: 1, pt: 2, px: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '14px',
                                    bgcolor: '#eff6ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem'
                                }}
                            >
                                {detailModal.icon || <AssignmentIcon sx={{ color: '#2563eb' }} />}
                            </Box>
                            <div>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                    {detailModal.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                                    <span>📅 Chu kỳ: <strong style={{ color: '#0284c7' }}>{detailModal.periodLabel}</strong></span>
                                    <span>•</span>
                                    <span>
                                        {detailModal.loading 
                                            ? <span style={{ color: '#0284c7' }}>Đang tải từ máy chủ...</span> 
                                            : <>Tìm thấy <strong style={{ color: '#16a34a' }}>{filteredModalData.length}</strong> kết quả</>
                                        }
                                    </span>
                                </Typography>
                            </div>
                        </Box>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Tooltip title="Tải lại dữ liệu từ máy chủ">
                                <IconButton 
                                    onClick={() => openDetailDialog(detailModal.type)} 
                                    disabled={detailModal.loading}
                                    size="small"
                                    sx={{ color: '#64748b', '&:hover': { color: '#0284c7', bgcolor: '#f0f9ff' } }}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <IconButton onClick={closeDetailDialog} sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* Summary Quick Badges */}
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        {detailModal.type === 'expenses' ? (
                            <>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Tổng phiếu chi:</Typography>
                                    <Chip label={`${modalSummaryStats.totalCount} phiếu`} size="small" sx={{ fontWeight: 800, bgcolor: '#fee2e2', color: '#b91c1c' }} />
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Tổng tiền đã chi:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#dc2626' }}>{formatCurrency(modalSummaryStats.totalExpense)}</Typography>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Số lượng HĐ:</Typography>
                                    <Chip label={`${modalSummaryStats.totalCount} HĐ`} size="small" sx={{ fontWeight: 800, bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Tổng doanh số:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>{formatCurrency(modalSummaryStats.totalRevenue)}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Đã thu:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0891b2' }}>{formatCurrency(modalSummaryStats.totalPaid)}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Còn nợ:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ea580c' }}>{formatCurrency(modalSummaryStats.totalDebt)}</Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogTitle>

                {/* Modal Content */}
                <DialogContent sx={{ px: 3, py: 1 }}>
                    {/* Search & Export Toolbar */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 2, mt: 1 }}>
                        <TextField
                            size="small"
                            placeholder={detailModal.type === 'expenses' ? "Tìm theo nội dung, loại chi, người chi, ghi chú..." : "Tìm theo mã HĐ, tên cô dâu, chú rể, SĐT, gói chụp, nhân viên..."}
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            sx={{
                                flex: 1,
                                minWidth: 260,
                                bgcolor: '#ffffff',
                                borderRadius: '12px',
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#94a3b8' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: modalSearch ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setModalSearch('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />

                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={exportModalToExcel}
                            disabled={detailModal.loading || filteredModalData.length === 0}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 750,
                                color: '#16a34a',
                                borderColor: '#86efac',
                                bgcolor: '#f0fdf4',
                                '&:hover': { bgcolor: '#dcfce7', borderColor: '#4ade80' }
                            }}
                        >
                            Xuất Excel ({filteredModalData.length})
                        </Button>
                    </Box>

                    {/* Table View or Loading */}
                    {detailModal.loading ? (
                        <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            <CircularProgress size={42} thickness={4} sx={{ color: '#0284c7' }} />
                            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 700 }}>
                                Đang gửi yêu cầu và lấy dữ liệu mới nhất từ máy chủ...
                            </Typography>
                        </Box>
                    ) : filteredModalData.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center', color: '#94a3b8' }}>
                            <AssignmentIcon sx={{ fontSize: '3.5rem', color: '#cbd5e1', mb: 1 }} />
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#64748b' }}>
                                {modalSearch ? 'Không tìm thấy kết quả phù hợp với từ khóa' : 'Chưa có dữ liệu thống kê trong chu kỳ này'}
                            </Typography>
                            {modalSearch && (
                                <Button size="small" onClick={() => setModalSearch('')} sx={{ mt: 1, textTransform: 'none' }}>
                                    Xóa bộ lọc tìm kiếm
                                </Button>
                            )}
                        </Box>
                    ) : detailModal.type === 'expenses' ? (
                        /* Expenses Table */
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', maxHeight: '52vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { bgcolor: '#f8fafc', fontWeight: 800, color: '#475569', py: 1.2 } }}>
                                        <TableCell align="center" width={50}>STT</TableCell>
                                        <TableCell width={110}>Ngày chi</TableCell>
                                        <TableCell>Nội dung khoản chi</TableCell>
                                        <TableCell width={140}>Hạng mục / Loại</TableCell>
                                        <TableCell width={140}>Người chi / Nhận</TableCell>
                                        <TableCell align="right" width={130}>Số tiền chi</TableCell>
                                        <TableCell width={140}>Ghi chú</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredModalData.map((item, idx) => (
                                        <TableRow key={item._id || idx} sx={{ '&:hover': { bgcolor: '#fff1f2' } }}>
                                            <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                                                {item.date ? formatDateOnly(item.date) : '-'}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 750, color: '#0f172a' }}>
                                                {item.content || item.noiDung || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.category || item.loaiChi || 'Chi phí chung'}
                                                    size="small"
                                                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.72rem' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#475569', fontWeight: 600 }}>
                                                {item.person || item.nguoiChi || '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800, color: '#dc2626' }}>
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                {item.note || item.ghiChu || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        /* Contracts Table */
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', maxHeight: '52vh' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { bgcolor: '#f8fafc', fontWeight: 800, color: '#475569', py: 1.2 } }}>
                                        <TableCell align="center" width={50}>STT</TableCell>
                                        <TableCell width={120}>Mã HĐ</TableCell>
                                        <TableCell width={170}>Khách hàng</TableCell>
                                        <TableCell width={160}>Gói dịch vụ</TableCell>
                                        {detailModal.type === 'scheduled' && <TableCell width={180}>Lịch trong kỳ</TableCell>}
                                        <TableCell align="right" width={130}>Doanh số</TableCell>
                                        <TableCell align="right" width={120}>Đã thu</TableCell>
                                        <TableCell align="right" width={120}>Còn nợ</TableCell>
                                        <TableCell width={130}>Nhân viên</TableCell>
                                        <TableCell align="center" width={130}>Trạng thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredModalData.map((hd, idx) => {
                                        const val = Number(hd.thanhToan?.tongGiaTriSauGiam ?? hd.thanhToan?.tongGiaTri ?? hd.tongTien ?? hd.giaTriHopDong ?? 0);
                                        const paid = Number(hd.thanhToan?.khachHangDaThanhToan ?? 0);
                                        const debt = Number(hd.thanhToan?.conLai ?? Math.max(0, val - paid));
                                        const isDebt = debt > 0;
                                        const isPaidFull = debt === 0 && val > 0;

                                        return (
                                            <TableRow key={hd._id || hd.maHopDong || idx} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                                <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#2563eb' }}>
                                                        {hd.maHopDong}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                        {hd.ngayHopDong ? formatDateOnly(hd.ngayHopDong) : '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 750, color: '#0f172a' }}>
                                                        {hd.thongTinCoDauChuRe?.tenCoDau && hd.thongTinCoDauChuRe?.tenChuRe 
                                                            ? `${hd.thongTinCoDauChuRe.tenCoDau} & ${hd.thongTinCoDauChuRe.tenChuRe}`
                                                            : hd.thongTinCoDauChuRe?.tenCoDau || hd.thongTinCoDauChuRe?.tenChuRe || hd.tenKhachHang || 'Khách hàng'}
                                                    </Typography>
                                                    {(hd.thongTinCoDauChuRe?.soDienThoaiCoDau || hd.thongTinCoDauChuRe?.soDienThoaiChuRe) && (
                                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                                                            <CallIcon sx={{ fontSize: '0.75rem', color: '#0284c7' }} />
                                                            {hd.thongTinCoDauChuRe?.soDienThoaiCoDau || hd.thongTinCoDauChuRe?.soDienThoaiChuRe}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                        {hd.tenGoiDichVu || hd.chiTietHopDong?.tenGoi || 'Dịch vụ cưới'}
                                                    </Typography>
                                                </TableCell>
                                                {detailModal.type === 'scheduled' && (
                                                    <TableCell>
                                                        <Stack spacing={0.4}>
                                                            {(hd.matchedSchedules || []).map((s, sIdx) => (
                                                                <Chip
                                                                    key={sIdx}
                                                                    label={`${s.label}: ${formatDateOnly(s.date)}`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontSize: '0.7rem',
                                                                        height: '22px',
                                                                        bgcolor: '#faf5ff',
                                                                        color: '#7c3aed',
                                                                        fontWeight: 750,
                                                                        border: '1px solid #e9d5ff'
                                                                    }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </TableCell>
                                                )}
                                                <TableCell align="right" sx={{ fontWeight: 800, color: '#16a34a' }}>
                                                    {formatCurrency(val)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: '#0891b2' }}>
                                                    {formatCurrency(paid)}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: isDebt ? '#ea580c' : '#16a34a' }}>
                                                    {formatCurrency(debt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ fontWeight: 650, color: '#334155', display: 'block' }}>
                                                        {hd.nguoiPhucVu?.banHang ? `Sale: ${hd.nguoiPhucVu.banHang}` : 'Sale: -'}
                                                    </Typography>
                                                    {hd.nguoiPhucVu?.chupAnh && (
                                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                            Thợ: {hd.nguoiPhucVu.chupAnh}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={isPaidFull ? 'Đã thanh toán đủ' : paid > 0 ? 'Đang thanh toán' : 'Chưa thanh toán'}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '0.72rem',
                                                            fontWeight: 750,
                                                            bgcolor: isPaidFull ? '#ecfdf5' : paid > 0 ? '#fff7ed' : '#fef2f2',
                                                            color: isPaidFull ? '#059669' : paid > 0 ? '#c2410c' : '#dc2626',
                                                            border: isPaidFull ? '1px solid #a7f3d0' : paid > 0 ? '1px solid #fed7aa' : '1px solid #fecaca'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                {/* Modal Footer Actions */}
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="#94a3b8">
                        * Nhấp vào ô tìm kiếm hoặc xuất file Excel để lưu trữ dữ liệu chi tiết
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            onClick={exportModalToExcel}
                            startIcon={<FileDownloadIcon />}
                            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={closeDetailDialog}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 750,
                                px: 3,
                                bgcolor: '#0f172a',
                                '&:hover': { bgcolor: '#1e293b' }
                            }}
                        >
                            Đóng
                        </Button>
                    </Stack>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DoanhThu;
