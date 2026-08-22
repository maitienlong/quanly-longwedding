import React, { useState, useEffect, useMemo } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import { useAuth } from '../Login/AuthContext/AuthContext';
import './thiDua.css';

// Material UI components
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Stack,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Grid,
    Card,
    Typography,
    Tabs,
    Tab,
    LinearProgress,
    Tooltip,
    IconButton,
    Avatar,
    useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import logoDefault from '../../assets/logo/logo-vang.png';

// Format currency
const formatMoney = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
};

const formatShortMoney = (val) => {
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

// Format input number with thousand separators (e.g. 100000000 -> "100.000.000")
const formatInputNumber = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const numStr = String(val).replace(/\D/g, '');
    if (!numStr) return '';
    return Number(numStr).toLocaleString('vi-VN');
};

// Parse input string back to raw number
const parseInputNumber = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/\D/g, '');
    return clean ? Number(clean) : 0;
};

function ThiDua() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();

    const isManager = user?.positon === "Quản lý" || user?.permission === 1 || user?.role === "ADMIN" || user?.username === "along";

    // Main Tab State (0: Thi Đua & Vinh Danh, 1: KPI & Mục Tiêu Cửa Hàng, 2: Phân Tích & Chiến Lược)
    const [activeTab, setActiveTab] = useState(0);

    // Filters state
    const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [position, setPosition] = useState('Tất cả');

    // Data state
    const [stats, setStats] = useState([]);
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalWork: 0,
        totalExceededCount: 0,
        totalHoaHongFund: 0,
        totalBonusFund: 0,
        totalRewardFund: 0
    });
    const [storeData, setStoreData] = useState({
        target: {
            targetRevenue: 0,
            targetContracts: 0,
            targetProfit: 0,
            growthRateExpected: 15,
            bonusPool: 0,
            notes: ""
        },
        actual: {
            totalRevenue: 0,
            totalContracts: 0,
            totalPaid: 0,
            averageOrderValue: 0
        },
        completion: {
            revenuePercent: 0,
            contractsPercent: 0,
            overallPercent: 0
        },
        growthMoM: {
            revenuePercent: 0,
            contractsPercent: 0,
            aovPercent: 0,
            prevRevenue: 0,
            prevContracts: 0
        },
        forecast: {
            dailyAvgRevenue: 0,
            dailyAvgContracts: 0,
            forecastRevenue: 0,
            forecastContracts: 0,
            forecastCompletionPct: 0,
            remainingRevenueNeeded: 0,
            remainingContractsNeeded: 0,
            requiredDailyRevenue: 0,
            requiredDailyContracts: 0
        },
        departmentSummary: {}
    });
    const [timeline, setTimeline] = useState({
        totalDays: 30,
        daysPassed: 1,
        daysRemaining: 29
    });
    const [periodLabel, setPeriodLabel] = useState('Tháng này');
    const [periodKey, setPeriodKey] = useState('');
    const [insights, setInsights] = useState([]);

    // Dialog Settings State
    const [openTargetDialog, setOpenTargetDialog] = useState(false);
    const [dialogTab, setDialogTab] = useState(0); // 0: Store Target, 1: Staff Targets
    const [editStoreTarget, setEditStoreTarget] = useState({
        targetRevenue: 100000000,
        targetContracts: 20,
        targetProfit: 40000000,
        growthRateExpected: 15,
        bonusPool: 3000000,
        notes: ""
    });
    const [editTargetsList, setEditTargetsList] = useState([]);

    // Fetch Stats API
    const fetchStats = () => {
        showLoading("Đang tải dữ liệu thi đua & KPI...");
        const payload = {
            timeRange,
            startDate: timeRange === 'custom' ? startDate : undefined,
            endDate: timeRange === 'custom' ? endDate : undefined,
            position
        };

        otherService.getThiDuaStats(payload)
            .then(res => {
                const resData = res.data?.data || res.data || {};
                if (resData.stats) {
                    setStats(resData.stats || []);
                    setSummary(resData.summary || {});
                    if (resData.store) setStoreData(resData.store);
                    if (resData.timeline) setTimeline(resData.timeline);
                    if (resData.periodLabel) setPeriodLabel(resData.periodLabel);
                    if (resData.periodKey) setPeriodKey(resData.periodKey);
                    if (resData.insights) setInsights(resData.insights);

                    // Initialize editStoreTarget with current target
                    if (resData.store?.target) {
                        setEditStoreTarget({
                            targetRevenue: resData.store.target.targetRevenue || 100000000,
                            targetContracts: resData.store.target.targetContracts || 20,
                            targetProfit: resData.store.target.targetProfit || 40000000,
                            growthRateExpected: resData.store.target.growthRateExpected || 15,
                            bonusPool: resData.store.target.bonusPool || 3000000,
                            notes: resData.store.target.notes || ""
                        });
                    }
                }
            })
            .catch(err => {
                console.error(err);
                toast.error("Lỗi khi tải dữ liệu thi đua: " + (err.message || "Không thể kết nối máy chủ"));
            })
            .finally(() => hideLoading());
    };

    useEffect(() => {
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange, position]);

    const handleOpenTargetDialog = () => {
        setEditTargetsList(stats.map(item => ({
            username: item.username,
            fullname: item.fullname,
            positon: item.positon,
            chiTieuTuan: item.chiTieuTuan || 5,
            chiTieuThang: item.chiTieuThang || 20,
            chiTieuNam: item.chiTieuNam || 200,
            chiTieuDoanhSoThang: item.chiTieuDoanhSoThang || 0,
            luongHoaHong: item.luongHoaHong || 0,
            loaiHoaHong: item.loaiHoaHong || 0
        })));
        setOpenTargetDialog(true);
    };

    const handleSaveStoreTarget = () => {
        showLoading("Đang lưu mục tiêu cửa hàng...");
        const payload = {
            periodKey,
            periodType: timeRange,
            targetRevenue: Number(editStoreTarget.targetRevenue) || 0,
            targetContracts: Number(editStoreTarget.targetContracts) || 0,
            targetProfit: Number(editStoreTarget.targetProfit) || 0,
            growthRateExpected: Number(editStoreTarget.growthRateExpected) || 0,
            bonusPool: Number(editStoreTarget.bonusPool) || 0,
            notes: editStoreTarget.notes || ""
        };

        otherService.updateStoreTarget(payload)
            .then(() => {
                toast.success("Cập nhật mục tiêu cửa hàng thành công!");
                fetchStats();
            })
            .catch(err => {
                toast.error("Lỗi cập nhật mục tiêu cửa hàng: " + err.message);
            })
            .finally(() => hideLoading());
    };

    const handleSaveStaffTargets = () => {
        showLoading("Đang lưu thay đổi chỉ tiêu nhân viên...");
        otherService.updateBatchTargets({ targets: editTargetsList })
            .then(() => {
                toast.success("Cập nhật chỉ tiêu nhân viên thành công!");
                setOpenTargetDialog(false);
                fetchStats();
            })
            .catch(err => {
                toast.error("Lỗi cập nhật chỉ tiêu nhân viên: " + err.message);
                hideLoading();
            });
    };

    // Calculate Top 3 for Podium
    const top3 = useMemo(() => stats.slice(0, 3), [stats]);
    const top1 = top3[0] || null;
    const top2 = top3[1] || null;
    const top3_staff = top3[2] || null;

    // SVG Bar Chart rendering for Staff
    const renderStaffChart = () => {
        if (!stats || stats.length === 0) return null;

        const maxWork = Math.max(...stats.map(s => Math.max(s.countWork, s.target)), 10);
        const chartHeight = 220;
        const barWidth = Math.min(42, Math.max(20, Math.floor(620 / stats.length)));

        return (
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
                <svg width="100%" height={chartHeight + 65} viewBox={`0 0 ${Math.max(720, stats.length * 85)} ${chartHeight + 65}`}>
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = chartHeight * (1 - ratio) + 20;
                        const val = Math.round(maxWork * ratio);
                        return (
                            <g key={i}>
                                <line x1="40" y1={y} x2="100%" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                                <text x="32" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{val}</text>
                            </g>
                        );
                    })}

                    {/* Bars for each user */}
                    {stats.map((item, idx) => {
                        const step = Math.max(75, Math.floor(720 / stats.length));
                        const x = 60 + idx * step;
                        const workH = (item.countWork / maxWork) * chartHeight;
                        const targetH = (item.target / maxWork) * chartHeight;
                        const yWork = chartHeight - workH + 20;
                        const yTarget = chartHeight - targetH + 20;

                        const isExceeded = item.isExceeded;

                        return (
                            <g key={item.username || idx} className="chart-bar-group">
                                {/* Target dash line marker */}
                                <line 
                                    x1={x - 8} 
                                    y1={yTarget} 
                                    x2={x + barWidth + 8} 
                                    y2={yTarget} 
                                    stroke="#ef4444" 
                                    strokeWidth="2.5" 
                                    strokeDasharray="3 3"
                                />

                                {/* Work Bar */}
                                <rect
                                    x={x}
                                    y={yWork}
                                    width={barWidth}
                                    height={Math.max(workH, 4)}
                                    rx="6"
                                    fill={isExceeded ? "url(#exceededGrad)" : "url(#standardGrad)"}
                                    style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
                                />

                                {/* Work Count Label above bar */}
                                <text 
                                    x={x + barWidth / 2} 
                                    y={yWork - 8} 
                                    fontSize="11" 
                                    fontWeight="bold" 
                                    fill={isExceeded ? "#15803d" : "#0f172a"} 
                                    textAnchor="middle"
                                >
                                    {item.countWork} {isExceeded ? "🔥" : ""}
                                </text>

                                {/* User name below bar */}
                                <text 
                                    x={x + barWidth / 2} 
                                    y={chartHeight + 38} 
                                    fontSize="11" 
                                    fill="#334155" 
                                    fontWeight="600" 
                                    textAnchor="middle"
                                >
                                    {item.fullname?.split(' ').slice(-2).join(' ') || item.fullname}
                                </text>
                                <text 
                                    x={x + barWidth / 2} 
                                    y={chartHeight + 52} 
                                    fontSize="9.5" 
                                    fill="#64748b" 
                                    textAnchor="middle"
                                >
                                    {item.completionPercent}% CT
                                </text>
                            </g>
                        );
                    })}

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="exceededGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="standardGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    };

    return (
        <div className="thidua-container">
            {/* 1. HEADER & CONTROLS */}
            <div className="thidua-header">
                <div className="thidua-title-group">
                    <div className="thidua-badge-top">
                        <i className="fa-solid fa-bolt"></i> LONG WEDDING KPI & COMPETITION SYSTEM
                    </div>
                    <h2>
                        <i className="fa-solid fa-trophy" style={{ color: '#fbbf24' }}></i> THI ĐƯA & KPI CHIẾN LƯỢC
                    </h2>
                    <p className="thidua-subtitle">
                        Đo lường hiệu suất toàn diện: KPI Cửa hàng, Xếp hạng Vinh danh Đội ngũ và Phân tích Mục tiêu Tăng trưởng ({periodLabel})
                    </p>
                </div>

                <div className="thidua-controls">
                    <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#fff', borderRadius: 2 }}>
                        <InputLabel>Mốc thời gian</InputLabel>
                        <Select
                            value={timeRange}
                            label="Mốc thời gian"
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="week">Tuần này</MenuItem>
                            <MenuItem value="month">Tháng này</MenuItem>
                            <MenuItem value="quarter">Quý này</MenuItem>
                            <MenuItem value="year">Năm nay</MenuItem>
                            <MenuItem value="custom">Tùy chỉnh ngày</MenuItem>
                        </Select>
                    </FormControl>

                    {timeRange === 'custom' && (
                        <Box display="flex" gap={1} alignItems="center">
                            <TextField
                                size="small"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                sx={{ bgcolor: '#fff', borderRadius: 2, width: 145 }}
                            />
                            <span>-</span>
                            <TextField
                                size="small"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                sx={{ bgcolor: '#fff', borderRadius: 2, width: 145 }}
                            />
                            <Button variant="contained" size="small" onClick={fetchStats}>Lọc</Button>
                        </Box>
                    )}

                    <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#fff', borderRadius: 2 }}>
                        <InputLabel>Chức vụ</InputLabel>
                        <Select
                            value={position}
                            label="Chức vụ"
                            onChange={(e) => setPosition(e.target.value)}
                        >
                            <MenuItem value="Tất cả">Tất cả chức vụ</MenuItem>
                            <MenuItem value="Nhân viên Sale">Nhân viên Sale</MenuItem>
                            <MenuItem value="Thợ chụp hình">Thợ chụp hình</MenuItem>
                            <MenuItem value="Thợ trang điểm">Thợ trang điểm</MenuItem>
                            <MenuItem value="Thợ chỉnh ảnh">Thợ chỉnh ảnh</MenuItem>
                            <MenuItem value="Nhân viên phục vụ">Nhân viên phục vụ</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Tải lại dữ liệu mới nhất">
                        <IconButton onClick={fetchStats} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', p: 1 }}>
                            <i className="fa-solid fa-rotate"></i>
                        </IconButton>
                    </Tooltip>

                    {isManager && (
                        <Button
                            variant="contained"
                            className="btn-target-settings"
                            onClick={handleOpenTargetDialog}
                            startIcon={<i className="fa-solid fa-sliders"></i>}
                        >
                            Thiết Lập Chỉ Tiêu
                        </Button>
                    )}
                </div>
            </div>

            {/* 2. NAVIGATION TABS */}
            <div className="thidua-tab-nav">
                <Tabs 
                    value={activeTab} 
                    onChange={(e, val) => setActiveTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            minHeight: 48,
                            borderRadius: '12px 12px 0 0',
                            px: 3
                        }
                    }}
                >
                    <Tab 
                        icon={<i className="fa-solid fa-medal" style={{ marginRight: 6, color: '#f59e0b' }}></i>} 
                        iconPosition="start" 
                        label="🏆 Bảng Thi Đua & Vinh Danh Nhân Viên" 
                    />
                    <Tab 
                        icon={<i className="fa-solid fa-store" style={{ marginRight: 6, color: '#0ea5e9' }}></i>} 
                        iconPosition="start" 
                        label="🏬 KPI & Mục Tiêu Tăng Trưởng Cửa Hàng" 
                    />
                    <Tab 
                        icon={<i className="fa-solid fa-chart-line" style={{ marginRight: 6, color: '#10b981' }}></i>} 
                        iconPosition="start" 
                        label="📈 Phân Tích Hiệu Suất & Chiến Lược" 
                    />
                </Tabs>
            </div>

            {/* TAB CONTENT 0: BẢNG THI ĐUA & VINH DANH NHÂN VIÊN */}
            {activeTab === 0 && (
                <div className="tab-pane-content">
                    {/* KPI SUMMARY CARDS */}
                    <div className="kpi-cards-grid">
                        <div className="kpi-card glass-card">
                            <div className="kpi-card-info">
                                <span className="kpi-card-label">Tổng số công việc</span>
                                <h3>{summary.totalWork || 0} <span className="kpi-unit">CV</span></h3>
                                <div className="kpi-subtext">Đóng góp từ {summary.totalUsers || 0} nhân sự</div>
                            </div>
                            <div className="kpi-card-icon kpi-icon-blue">
                                <i className="fa-solid fa-briefcase"></i>
                            </div>
                        </div>

                        <div className="kpi-card glass-card">
                            <div className="kpi-card-info">
                                <span className="kpi-card-label">Vượt chỉ tiêu thi đua</span>
                                <h3 style={{ color: '#16a34a' }}>
                                    {summary.totalExceededCount || 0} <span className="kpi-unit">nhân viên</span>
                                </h3>
                                <div className="kpi-subtext">
                                    Đạt tỷ lệ {summary.totalUsers > 0 ? Math.round((summary.totalExceededCount / summary.totalUsers) * 100) : 0}% đội ngũ
                                </div>
                            </div>
                            <div className="kpi-card-icon kpi-icon-green">
                                <i className="fa-solid fa-award"></i>
                            </div>
                        </div>

                        <div className="kpi-card glass-card">
                            <div className="kpi-card-info">
                                <span className="kpi-card-label">Quán quân dẫn đầu</span>
                                <h3 className="kpi-top1-name">
                                    {top1 ? top1.fullname : 'Chưa có'}
                                </h3>
                                <div className="kpi-subtext" style={{ color: '#d97706', fontWeight: 600 }}>
                                    {top1 ? `${top1.countWork} CV (${top1.completionPercent}% chỉ tiêu)` : '-'}
                                </div>
                            </div>
                            <div className="kpi-card-icon kpi-icon-gold">
                                <i className="fa-solid fa-crown"></i>
                            </div>
                        </div>

                        <div className="kpi-card glass-card">
                            <div className="kpi-card-info">
                                <span className="kpi-card-label">Quỹ thưởng & Hoa hồng</span>
                                <h3 style={{ color: '#9333ea' }}>
                                    {formatShortMoney(summary.totalRewardFund || (summary.totalHoaHongFund + summary.totalBonusFund) || 0)}
                                </h3>
                                <div className="kpi-subtext">
                                    Thưởng thi đua: {formatMoney(summary.totalBonusFund || 0)}
                                </div>
                            </div>
                            <div className="kpi-card-icon kpi-icon-purple">
                                <i className="fa-solid fa-coins"></i>
                            </div>
                        </div>
                    </div>

                    {/* PODIUM TOP 3 VINH DANH */}
                    {top3.length > 0 && (
                        <div className="podium-container">
                            <div className="podium-title">
                                <h3>👑 BẢNG VINH DANH TOP BỨT PHÁ XUẤT SẮC NHẤT</h3>
                                <p>Ghi nhận nỗ lực bứt phá của những chiến binh dẫn đầu trong {periodLabel}</p>
                            </div>

                            <div className="podium-flex">
                                {/* RANK 2 */}
                                {top2 && (
                                    <div className="podium-item podium-rank-2">
                                        <div className="podium-avatar-wrapper">
                                            <span className="podium-badge-icon">🥈</span>
                                            <Avatar 
                                                src={top2.avatar || logoDefault} 
                                                alt={top2.fullname}
                                                className="podium-avatar silver-glow"
                                            />
                                            <div className="podium-user-name">{top2.fullname}</div>
                                            <div className="podium-user-role">{top2.positon}</div>
                                        </div>
                                        <div className="podium-card podium-box-2">
                                            <div className="podium-rank-label">Á QUÂN</div>
                                            <div className="podium-work-count">{top2.countWork} CV</div>
                                            <div className="podium-target-pct">{top2.completionPercent}% chỉ tiêu</div>
                                            <div className="podium-score-badge">⭐ {top2.competitionScore} điểm</div>
                                            {top2.isExceeded && (
                                                <span className="badge-exceeded" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                                                    🔥 VƯỢT {top2.percentExceeded}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RANK 1 */}
                                {top1 && (
                                    <div className="podium-item podium-rank-1">
                                        <div className="podium-avatar-wrapper">
                                            <span className="podium-badge-icon">🥇</span>
                                            <Avatar 
                                                src={top1.avatar || logoDefault} 
                                                alt={top1.fullname}
                                                className="podium-avatar gold-glow"
                                            />
                                            <div className="podium-user-name" style={{ color: '#fbbf24', fontSize: '1.15rem' }}>
                                                {top1.fullname}
                                            </div>
                                            <div className="podium-user-role" style={{ color: '#fef08a' }}>{top1.positon}</div>
                                        </div>
                                        <div className="podium-card podium-box-1">
                                            <div className="podium-rank-label" style={{ color: '#fef08a', fontWeight: 'bold' }}>QUÁN QUÂN</div>
                                            <div className="podium-work-count" style={{ fontSize: '1.9rem', color: '#fff' }}>{top1.countWork} CV</div>
                                            <div className="podium-target-pct">{top1.completionPercent}% chỉ tiêu</div>
                                            <div className="podium-score-badge" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                                                🏆 {top1.competitionScore} điểm
                                            </div>
                                            {top1.isExceeded && (
                                                <span className="badge-exceeded" style={{ marginTop: '8px', background: '#fff', color: '#15803d', fontWeight: 'bold' }}>
                                                    🔥 VƯỢT {top1.percentExceeded}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RANK 3 */}
                                {top3_staff && (
                                    <div className="podium-item podium-rank-3">
                                        <div className="podium-avatar-wrapper">
                                            <span className="podium-badge-icon">🥉</span>
                                            <Avatar 
                                                src={top3_staff.avatar || logoDefault} 
                                                alt={top3_staff.fullname}
                                                className="podium-avatar bronze-glow"
                                            />
                                            <div className="podium-user-name">{top3_staff.fullname}</div>
                                            <div className="podium-user-role">{top3_staff.positon}</div>
                                        </div>
                                        <div className="podium-card podium-box-3">
                                            <div className="podium-rank-label">QUÝ QUÂN</div>
                                            <div className="podium-work-count">{top3_staff.countWork} CV</div>
                                            <div className="podium-target-pct">{top3_staff.completionPercent}% chỉ tiêu</div>
                                            <div className="podium-score-badge">⭐ {top3_staff.competitionScore} điểm</div>
                                            {top3_staff.isExceeded && (
                                                <span className="badge-exceeded" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                                                    🔥 VƯỢT {top3_staff.percentExceeded}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* INTERACTIVE CHART SECTION */}
                    <div className="thidua-chart-card">
                        <div className="chart-card-header">
                            <div>
                                <h3>📊 Biểu Đồ Công Việc Thực Hiện vs Mốc Chỉ Tiêu</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                                    Đường đỏ nét đứt thể hiện mốc chỉ tiêu của từng nhân viên
                                </p>
                            </div>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <div className="legend-box" style={{ background: '#10b981' }}></div>
                                    <span>Vượt chỉ tiêu</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-box" style={{ background: '#0284c7' }}></div>
                                    <span>Trong chỉ tiêu</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-box" style={{ background: '#ef4444', height: '2.5px' }}></div>
                                    <span>Chỉ tiêu mục tiêu</span>
                                </div>
                            </div>
                        </div>
                        {renderStaffChart()}
                    </div>

                    {/* DETAILED STATS TABLE */}
                    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ p: 2.5, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <div>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="fa-solid fa-list-check" style={{ color: '#3b82f6' }}></i> Bảng Chi Tiết Thành Tích Thi Đua & Hoa Hồng
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Bao gồm chỉ tiêu, điểm thi đua, danh hiệu và dự toán hoa hồng kèm tiền thưởng
                                </Typography>
                            </div>
                            <Chip 
                                label={`${stats.length} Nhân Sự`} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ fontWeight: 'bold' }} 
                            />
                        </Box>

                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#334155', py: 1.5 } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ width: '65px' }}>HẠNG</TableCell>
                                        <TableCell style={{ width: '220px' }}>NHÂN VIÊN</TableCell>
                                        <TableCell style={{ width: '150px' }}>CHỨC VỤ</TableCell>
                                        <TableCell align="center" style={{ width: '130px' }}>ĐẠT / CHỈ TIÊU</TableCell>
                                        <TableCell align="center" style={{ width: '150px' }}>% TIẾN ĐỘ</TableCell>
                                        <TableCell align="right" style={{ width: '140px' }}>DOANH SỐ PHỤC VỤ</TableCell>
                                        <TableCell align="center" style={{ width: '110px' }}>ĐIỂM THI ĐUA</TableCell>
                                        <TableCell align="right" style={{ width: '150px' }}>HOA HỒNG + THƯỞNG</TableCell>
                                        <TableCell align="center" style={{ width: '170px' }}>DANH HIỆU & TRẠNG THÁI</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" style={{ padding: '40px', color: '#94a3b8' }}>
                                                Chưa có dữ liệu thống kê cho mốc thời gian này.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stats.map((item) => (
                                            <TableRow 
                                                key={item.username || item._id} 
                                                sx={{ 
                                                    backgroundColor: item.isExceeded ? '#f0fdf4' : item.rank === 1 ? '#fffbeb' : 'inherit',
                                                    '&:hover': { backgroundColor: '#f1f5f9' } 
                                                }}
                                            >
                                                <TableCell align="center">
                                                    {item.rank === 1 && <span style={{ fontSize: '1.3rem' }}>🥇</span>}
                                                    {item.rank === 2 && <span style={{ fontSize: '1.3rem' }}>🥈</span>}
                                                    {item.rank === 3 && <span style={{ fontSize: '1.3rem' }}>🥉</span>}
                                                    {item.rank > 3 && <b style={{ color: '#64748b' }}>#{item.rank}</b>}
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Avatar 
                                                            src={item.avatar || logoDefault} 
                                                            sx={{ 
                                                                width: 38, 
                                                                height: 38, 
                                                                border: item.rank === 1 ? '2px solid #fbbf24' : '1px solid #e2e8f0' 
                                                            }} 
                                                        />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                                {item.fullname}
                                                            </Typography>
                                                            {item.username && (
                                                                <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
                                                                    @{item.username}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={item.positon || 'Nhân viên'} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: item.isExceeded ? '#16a34a' : '#0f172a' }}>
                                                        {item.countWork}
                                                    </span> 
                                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}> / {item.target} CV</span>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ width: '100%', mr: 1 }}>
                                                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: item.completionPercent >= 100 ? '#16a34a' : '#0284c7' }}>
                                                                {item.completionPercent}%
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={Math.min(100, item.completionPercent)} 
                                                            sx={{
                                                                height: 6,
                                                                borderRadius: 3,
                                                                bgcolor: '#e2e8f0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    borderRadius: 3,
                                                                    backgroundColor: item.completionPercent >= 120 ? '#10b981' : item.completionPercent >= 100 ? '#22c55e' : item.completionPercent >= 75 ? '#0ea5e9' : '#f59e0b'
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right" style={{ fontWeight: 600, color: '#334155' }}>
                                                    {formatMoney(item.tongDoanhSo || 0)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <span className="score-badge">
                                                        ⭐ {item.competitionScore || 0}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <div style={{ fontWeight: 800, color: '#9333ea', fontSize: '0.95rem' }}>
                                                        {formatMoney(item.totalRewardEst || item.hoaHongEst || 0)}
                                                    </div>
                                                    {item.bonusEst > 0 && (
                                                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                                                            + Thưởng: {formatShortMoney(item.bonusEst)}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                        {item.isExceeded ? (
                                                            <span className="badge-exceeded">
                                                                🔥 VƯỢT {item.percentExceeded}%
                                                            </span>
                                                        ) : item.completionPercent >= 100 ? (
                                                            <span className="badge-reached">
                                                                ⭐ ĐẠT CHỈ TIÊU
                                                            </span>
                                                        ) : (
                                                            <span className="badge-normal">
                                                                {item.honorBadge} {item.honorTitle}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </div>
            )}

            {/* TAB CONTENT 1: KPI & MỤC TIÊU TĂNG TRƯỞNG CỬA HÀNG */}
            {activeTab === 1 && (
                <div className="tab-pane-content">
                    {/* STORE KPI OVERVIEW */}
                    <div className="store-kpi-grid">
                        {/* REVENUE TARGET CARD */}
                        <div className="store-kpi-card glass-card">
                            <div className="store-kpi-header">
                                <div>
                                    <span className="store-kpi-sub">Mục tiêu Doanh thu</span>
                                    <h4>DOANH THU CỬA HÀNG</h4>
                                </div>
                                <div className="store-kpi-icon icon-revenue">
                                    <i className="fa-solid fa-sack-dollar"></i>
                                </div>
                            </div>

                            <div className="store-kpi-values">
                                <div className="val-actual">{formatMoney(storeData.actual?.totalRevenue || 0)}</div>
                                <div className="val-target">/ Mục tiêu: {formatMoney(storeData.target?.targetRevenue || 0)}</div>
                            </div>

                            <div className="store-progress-wrapper">
                                <div className="progress-info">
                                    <span>Tỷ lệ hoàn thành:</span>
                                    <strong style={{ color: storeData.completion?.revenuePercent >= 100 ? '#10b981' : '#0284c7' }}>
                                        {storeData.completion?.revenuePercent || 0}%
                                    </strong>
                                </div>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min(100, storeData.completion?.revenuePercent || 0)} 
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            backgroundColor: storeData.completion?.revenuePercent >= 100 ? '#10b981' : '#0284c7'
                                        }
                                    }}
                                />
                            </div>

                            <div className="store-kpi-footer">
                                <span>Còn thiếu: <b>{formatMoney(storeData.forecast?.remainingRevenueNeeded || 0)}</b></span>
                                <span>Đã thu tiền: <b>{formatMoney(storeData.actual?.totalPaid || 0)}</b></span>
                            </div>
                        </div>

                        {/* CONTRACTS TARGET CARD */}
                        <div className="store-kpi-card glass-card">
                            <div className="store-kpi-header">
                                <div>
                                    <span className="store-kpi-sub">Mục tiêu Số Hợp Đồng</span>
                                    <h4>SỐ HỢP ĐỒNG KÝ MỚI</h4>
                                </div>
                                <div className="store-kpi-icon icon-contract">
                                    <i className="fa-solid fa-file-signature"></i>
                                </div>
                            </div>

                            <div className="store-kpi-values">
                                <div className="val-actual">{storeData.actual?.totalContracts || 0} <span style={{ fontSize: '1rem', color: '#64748b' }}>HĐ</span></div>
                                <div className="val-target">/ Mục tiêu: {storeData.target?.targetContracts || 0} HĐ</div>
                            </div>

                            <div className="store-progress-wrapper">
                                <div className="progress-info">
                                    <span>Tỷ lệ hoàn thành:</span>
                                    <strong style={{ color: storeData.completion?.contractsPercent >= 100 ? '#10b981' : '#f59e0b' }}>
                                        {storeData.completion?.contractsPercent || 0}%
                                    </strong>
                                </div>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min(100, storeData.completion?.contractsPercent || 0)} 
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            backgroundColor: storeData.completion?.contractsPercent >= 100 ? '#10b981' : '#f59e0b'
                                        }
                                    }}
                                />
                            </div>

                            <div className="store-kpi-footer">
                                <span>Còn thiếu: <b>{storeData.forecast?.remainingContractsNeeded || 0} HĐ</b></span>
                                <span>Giá trị TB/Đơn: <b>{formatMoney(storeData.actual?.averageOrderValue || 0)}</b></span>
                            </div>
                        </div>

                        {/* RUN-RATE FORECAST CARD */}
                        <div className="store-kpi-card glass-card card-forecast">
                            <div className="store-kpi-header">
                                <div>
                                    <span className="store-kpi-sub">Dự Báo Cuối Kỳ (Run-rate)</span>
                                    <h4>DỰ KIẾN KẾT QUẢ KHI VỀ ĐÍCH</h4>
                                </div>
                                <div className="store-kpi-icon icon-forecast">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                </div>
                            </div>

                            <div className="forecast-metrics">
                                <div className="forecast-item">
                                    <span className="forecast-lbl">Tốc độ hiện tại:</span>
                                    <div className="forecast-val">{formatMoney(storeData.forecast?.dailyAvgRevenue || 0)} / ngày</div>
                                </div>
                                <div className="forecast-item">
                                    <span className="forecast-lbl">Dự kiến kết thúc kỳ:</span>
                                    <div className="forecast-val highlight-gold">
                                        {formatMoney(storeData.forecast?.forecastRevenue || 0)}
                                    </div>
                                    <span className="forecast-sub">
                                        (~{storeData.forecast?.forecastCompletionPct || 0}% mục tiêu đề ra)
                                    </span>
                                </div>
                            </div>

                            <div className="store-kpi-footer">
                                <span>Đã qua: <b>{timeline.daysPassed}/{timeline.totalDays} ngày</b></span>
                                <span>Còn lại: <b>{timeline.daysRemaining} ngày</b></span>
                            </div>
                        </div>

                        {/* REQUIRED DAILY RUN-RATE CARD */}
                        <div className="store-kpi-card glass-card card-required">
                            <div className="store-kpi-header">
                                <div>
                                    <span className="store-kpi-sub">Chỉ Tiêu Mỗi Ngày Còn Lại</span>
                                    <h4>TỐC ĐỘ CẦN THIẾT ĐỂ ĐẠT 100%</h4>
                                </div>
                                <div className="store-kpi-icon icon-target-daily">
                                    <i className="fa-solid fa-bullseye"></i>
                                </div>
                            </div>

                            <div className="required-box">
                                <div className="required-revenue">
                                    {formatMoney(storeData.forecast?.requiredDailyRevenue || 0)}
                                    <span className="required-unit"> / ngày</span>
                                </div>
                                <div className="required-contracts">
                                    Hoặc <b>{storeData.forecast?.requiredDailyContracts || 0} hợp đồng / ngày</b> trong {timeline.daysRemaining} ngày tới
                                </div>
                            </div>

                            <div className="store-kpi-footer">
                                <span>Quỹ thưởng hoàn thành: <b>{formatMoney(storeData.target?.bonusPool || 0)}</b></span>
                            </div>
                        </div>
                    </div>

                    {/* PERIOD OVER PERIOD GROWTH COMPARISON */}
                    <div className="growth-compare-section glass-card">
                        <div className="section-title-wrap">
                            <h3><i className="fa-solid fa-chart-simple" style={{ color: '#0ea5e9' }}></i> TĂNG TRƯỞNG SO VỚI KỲ TRƯỚC</h3>
                            <p>So sánh tốc độ phát triển thực tế so với kỳ liền kề trước đó</p>
                        </div>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <div className="growth-metric-card">
                                    <span className="growth-lbl">Tăng trưởng Doanh thu</span>
                                    <div className="growth-val-wrap">
                                        <div className={`growth-badge ${storeData.growthMoM?.revenuePercent >= 0 ? 'growth-up' : 'growth-down'}`}>
                                            <i className={`fa-solid ${storeData.growthMoM?.revenuePercent >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                                            {storeData.growthMoM?.revenuePercent > 0 ? `+${storeData.growthMoM?.revenuePercent}%` : `${storeData.growthMoM?.revenuePercent}%`}
                                        </div>
                                    </div>
                                    <span className="growth-sub">Kỳ trước: {formatMoney(storeData.growthMoM?.prevRevenue || 0)}</span>
                                </div>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <div className="growth-metric-card">
                                    <span className="growth-lbl">Tăng trưởng Số Hợp Đồng</span>
                                    <div className="growth-val-wrap">
                                        <div className={`growth-badge ${storeData.growthMoM?.contractsPercent >= 0 ? 'growth-up' : 'growth-down'}`}>
                                            <i className={`fa-solid ${storeData.growthMoM?.contractsPercent >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                                            {storeData.growthMoM?.contractsPercent > 0 ? `+${storeData.growthMoM?.contractsPercent}%` : `${storeData.growthMoM?.contractsPercent}%`}
                                        </div>
                                    </div>
                                    <span className="growth-sub">Kỳ trước: {storeData.growthMoM?.prevContracts || 0} Hợp đồng</span>
                                </div>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <div className="growth-metric-card">
                                    <span className="growth-lbl">Giá Trị Đơn Bình Quân (AOV)</span>
                                    <div className="growth-val-wrap">
                                        <div className={`growth-badge ${storeData.growthMoM?.aovPercent >= 0 ? 'growth-up' : 'growth-down'}`}>
                                            <i className={`fa-solid ${storeData.growthMoM?.aovPercent >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                                            {storeData.growthMoM?.aovPercent > 0 ? `+${storeData.growthMoM?.aovPercent}%` : `${storeData.growthMoM?.aovPercent}%`}
                                        </div>
                                    </div>
                                    <span className="growth-sub">Hiện tại: {formatMoney(storeData.actual?.averageOrderValue || 0)} / đơn</span>
                                </div>
                            </Grid>
                        </Grid>
                    </div>

                    {/* DEPARTMENT PERFORMANCE BREAKDOWN */}
                    <div className="dept-breakdown-section glass-card">
                        <div className="section-title-wrap">
                            <h3><i className="fa-solid fa-users-viewfinder" style={{ color: '#8b5cf6' }}></i> HIỆU SUẤT ĐÓNG GÓP THEO BỘ PHẬN</h3>
                            <p>Phân bổ số lượng công việc và doanh số phục vụ theo từng khối chức vụ</p>
                        </div>

                        <div className="dept-grid">
                            {Object.entries(storeData.departmentSummary || {}).map(([deptName, deptData]) => (
                                <div key={deptName} className="dept-card">
                                    <div className="dept-header">
                                        <span className="dept-name">{deptName}</span>
                                        <Chip label={`${deptData.count} nhân sự`} size="small" sx={{ fontWeight: 600 }} />
                                    </div>
                                    <div className="dept-body">
                                        <div className="dept-stat-row">
                                            <span>Số công việc hoàn thành:</span>
                                            <b>{deptData.jobs} CV</b>
                                        </div>
                                        <div className="dept-stat-row">
                                            <span>Doanh số đóng góp:</span>
                                            <b style={{ color: '#0284c7' }}>{formatMoney(deptData.revenue)}</b>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: PHÂN TÍCH HIỆU SUẤT & CHIẾN LƯỢC TĂNG TRƯỞNG */}
            {activeTab === 2 && (
                <div className="tab-pane-content">
                    {/* AUTOMATED AI GROWTH INSIGHTS */}
                    <div className="insights-container">
                        <div className="insights-title">
                            <h3><i className="fa-solid fa-lightbulb" style={{ color: '#f59e0b' }}></i> ĐÁNH GIÁ TỔNG QUAN & KHUYẾN NGHỊ CHIẾN LƯỢC</h3>
                            <p>Tự động phân tích tình hình đạt chỉ tiêu và gợi ý giải pháp tăng tốc</p>
                        </div>

                        <div className="insights-grid">
                            {insights.map((ins, idx) => (
                                <div key={idx} className={`insight-card insight-${ins.type}`}>
                                    <div className="insight-icon">
                                        {ins.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
                                        {ins.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
                                        {ins.type === 'warning' && <i className="fa-solid fa-triangle-exclamation"></i>}
                                        {ins.type === 'celebration' && <i className="fa-solid fa-champagne-glasses"></i>}
                                    </div>
                                    <div className="insight-content">
                                        <h4>{ins.title}</h4>
                                        <p>{ins.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STRATEGY BLUEPRINT CARDS */}
                    <div className="strategy-grid">
                        <div className="strategy-card glass-card">
                            <div className="strategy-icon icon-rocket">
                                <i className="fa-solid fa-rocket"></i>
                            </div>
                            <h4>1. Đẩy Mạnh Chốt Sale & Upsell</h4>
                            <p>Tập trung giới thiệu các gói combo trọn gói (Chụp cưới + Váy tiệc + Phóng sự cưới) để nâng cao giá trị đơn bình quân (AOV).</p>
                        </div>

                        <div className="strategy-card glass-card">
                            <div className="strategy-icon icon-speed">
                                <i className="fa-solid fa-gauge-high"></i>
                            </div>
                            <h4>2. Tối Ưu Quy Trình Phục Vụ</h4>
                            <p>Rút ngắn thời gian chỉnh sửa ảnh và giao sản phẩm nhằm tăng mức độ hài lòng và nhận thêm giới thiệu từ khách hàng cũ.</p>
                        </div>

                        <div className="strategy-card glass-card">
                            <div className="strategy-icon icon-reward">
                                <i className="fa-solid fa-hand-holding-dollar"></i>
                            </div>
                            <h4>3. Kích Hoạt Thưởng Nóng Thi Đua</h4>
                            <p>Áp dụng mức thưởng thi đua linh hoạt cho nhân viên vượt mốc 120% và 150% chỉ tiêu để tạo động lực bứt phá mạnh mẽ.</p>
                        </div>

                        <div className="strategy-card glass-card">
                            <div className="strategy-icon icon-team">
                                <i className="fa-solid fa-users-between-lines"></i>
                            </div>
                            <h4>4. Đào Tạo & Kèm Cặp Nội Bộ</h4>
                            <p>Tổ chức chia sẻ kinh nghiệm từ Quán quân và các nhân sự Top đầu cho những nhân sự đang nỗ lực đạt chỉ tiêu.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. DIALOG ADJUST STORE TARGETS & STAFF KPI */}
            <Dialog 
                open={openTargetDialog} 
                onClose={() => setOpenTargetDialog(false)} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, overflow: 'hidden' }
                }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <i className="fa-solid fa-sliders" style={{ color: '#fbbf24' }}></i>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            THIẾT LẬP CHỈ TIÊU & MỤC TIÊU TĂNG TRƯỞNG
                        </Typography>
                    </Box>
                    <Chip label={periodLabel} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }} />
                </DialogTitle>

                <Tabs
                    value={dialogTab}
                    onChange={(e, val) => setDialogTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: '#f8fafc' }}
                >
                    <Tab label="🏬 Mục Tiêu Cửa Hàng (Doanh Thu & HĐ)" sx={{ fontWeight: 700, textTransform: 'none' }} />
                    <Tab label="👤 Chỉ Tiêu Nhân Viên (Từng Vị Trí)" sx={{ fontWeight: 700, textTransform: 'none' }} />
                </Tabs>

                <DialogContent dividers sx={{ p: 3 }}>
                    {/* TAB 0: STORE TARGET SETTINGS */}
                    {dialogTab === 0 && (
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <Typography variant="body2" color="text.secondary">
                                Thiết lập mục tiêu kinh doanh cho toàn cửa hàng trong kỳ <b>{periodLabel}</b>:
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Doanh thu mục tiêu (VNĐ)"
                                        type="text"
                                        fullWidth
                                        value={formatInputNumber(editStoreTarget.targetRevenue)}
                                        onChange={(e) => setEditStoreTarget({ ...editStoreTarget, targetRevenue: parseInputNumber(e.target.value) })}
                                        placeholder="100.000.000"
                                        helperText={`Bằng chữ: ${formatMoney(editStoreTarget.targetRevenue)}`}
                                        inputProps={{ style: { fontWeight: 700, color: '#0f172a' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Số lượng hợp đồng mục tiêu"
                                        type="number"
                                        fullWidth
                                        value={editStoreTarget.targetContracts}
                                        onChange={(e) => setEditStoreTarget({ ...editStoreTarget, targetContracts: Number(e.target.value) || 0 })}
                                        helperText="Tổng số hợp đồng kỳ vọng ký mới"
                                        inputProps={{ style: { fontWeight: 700, color: '#0f172a' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Quỹ thưởng thi đua hoàn thành (VNĐ)"
                                        type="text"
                                        fullWidth
                                        value={formatInputNumber(editStoreTarget.bonusPool)}
                                        onChange={(e) => setEditStoreTarget({ ...editStoreTarget, bonusPool: parseInputNumber(e.target.value) })}
                                        placeholder="3.000.000"
                                        helperText={`Bằng chữ: ${formatMoney(editStoreTarget.bonusPool)}`}
                                        inputProps={{ style: { fontWeight: 700, color: '#0f172a' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="% Tăng trưởng kỳ vọng so với kỳ trước"
                                        type="number"
                                        fullWidth
                                        value={editStoreTarget.growthRateExpected}
                                        onChange={(e) => setEditStoreTarget({ ...editStoreTarget, growthRateExpected: Number(e.target.value) || 0 })}
                                        helperText="Ví dụ: 15% tăng trưởng"
                                        inputProps={{ style: { fontWeight: 700, color: '#0f172a' } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Ghi chú mục tiêu / Khẩu hiệu chiến dịch thi đua"
                                        multiline
                                        rows={2}
                                        fullWidth
                                        value={editStoreTarget.notes}
                                        onChange={(e) => setEditStoreTarget({ ...editStoreTarget, notes: e.target.value })}
                                        placeholder="Nhập thông điệp truyền cảm hứng cho đội ngũ..."
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* TAB 1: STAFF TARGET SETTINGS */}
                    {dialogTab === 1 && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Điều chỉnh chỉ tiêu số lượng công việc (Tuần/Tháng/Năm) và cơ chế hoa hồng cho từng nhân viên:
                            </Typography>

                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 380 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#f1f5f9' } }}>
                                            <TableCell>NHÂN VIÊN</TableCell>
                                            <TableCell>CHỨC VỤ</TableCell>
                                            <TableCell align="center" style={{ width: '110px' }}>CT TUẦN</TableCell>
                                            <TableCell align="center" style={{ width: '110px' }}>CT THÁNG</TableCell>
                                            <TableCell align="center" style={{ width: '110px' }}>CT NĂM</TableCell>
                                            <TableCell align="center" style={{ width: '150px' }}>HOA HỒNG</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {editTargetsList.map((item, idx) => (
                                            <TableRow key={item.username || idx}>
                                                <TableCell>
                                                    <b>{item.fullname}</b>
                                                    {item.username && (
                                                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                                                            @{item.username}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item.positon}</TableCell>
                                                <TableCell align="center">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.chiTieuTuan}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            const updated = [...editTargetsList];
                                                            updated[idx].chiTieuTuan = val;
                                                            setEditTargetsList(updated);
                                                        }}
                                                        inputProps={{ style: { textAlign: 'center', padding: '6px', fontWeight: 600 } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.chiTieuThang}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            const updated = [...editTargetsList];
                                                            updated[idx].chiTieuThang = val;
                                                            setEditTargetsList(updated);
                                                        }}
                                                        inputProps={{ style: { textAlign: 'center', padding: '6px', fontWeight: 600 } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.chiTieuNam}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            const updated = [...editTargetsList];
                                                            updated[idx].chiTieuNam = val;
                                                            setEditTargetsList(updated);
                                                        }}
                                                        inputProps={{ style: { textAlign: 'center', padding: '6px', fontWeight: 600 } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <TextField
                                                        type="text"
                                                        size="small"
                                                        value={item.loaiHoaHong === 1 ? item.luongHoaHong : formatInputNumber(item.luongHoaHong)}
                                                        onChange={(e) => {
                                                            const val = item.loaiHoaHong === 1 ? Number(e.target.value) || 0 : parseInputNumber(e.target.value);
                                                            const updated = [...editTargetsList];
                                                            updated[idx].luongHoaHong = val;
                                                            setEditTargetsList(updated);
                                                        }}
                                                        helperText={item.loaiHoaHong === 1 ? "% Doanh số" : "VNĐ / CV"}
                                                        inputProps={{ style: { textAlign: 'center', padding: '6px', fontWeight: 600 } }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    <Button onClick={() => setOpenTargetDialog(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Đóng
                    </Button>
                    {dialogTab === 0 ? (
                        <Button 
                            onClick={handleSaveStoreTarget} 
                            variant="contained" 
                            color="primary"
                            startIcon={<i className="fa-solid fa-floppy-disk"></i>}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            Lưu Mục Tiêu Cửa Hàng
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSaveStaffTargets} 
                            variant="contained" 
                            color="warning"
                            startIcon={<i className="fa-solid fa-floppy-disk"></i>}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            Lưu Chỉ Tiêu Nhân Viên
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ThiDua;
