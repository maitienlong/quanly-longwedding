import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';

// Material UI components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

function DoanhThu() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const [hopDongs, setHopDongs] = useState([]);
    const [chiTieus, setChiTieus] = useState([]);
    const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year'

    // Load data from contracts API and chiTieu API
    const loadData = () => {
        showLoading("Đang tải báo cáo hợp đồng & doanh thu...");
        Promise.all([
            otherService.LIST_HOPDONG({}),
            otherService.LIST_CHITIEU({})
        ])
        .then(([resHD, resCT]) => {
            setHopDongs(resHD.data.hopDong || []);
            setChiTieus(resCT.data.chiTieu || []);
        })
        .catch(err => {
            console.error(err);
            toast.error("Lỗi khi tải dữ liệu báo cáo: " + (err.message || "Lỗi kết nối"));
        })
        .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Overall contract statistics by period (Today, Week, Month, Year)
    const calculateOverallContractStats = () => {
        const now = new Date();

        // 1. Today
        const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        // 2. Week (Monday to Sunday)
        const currentDay = now.getDay();
        const mondayDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const startWeek = new Date(now.getFullYear(), now.getMonth(), mondayDiff, 0, 0, 0, 0);
        const endWeek = new Date(now.getFullYear(), now.getMonth(), mondayDiff + 6, 23, 59, 59, 999);

        // 3. Month
        const startMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // 4. Year
        const startYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const endYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        let countToday = 0, revenueToday = 0;
        let countWeek = 0, revenueWeek = 0;
        let countMonth = 0, revenueMonth = 0;
        let countYear = 0, revenueYear = 0;

        hopDongs.forEach(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return;
            if (!hd.ngayHopDong) return;

            const d = new Date(hd.ngayHopDong);
            const val = Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || hd.tongTien || hd.giaTriHopDong || 0);

            if (d >= startToday && d <= endToday) {
                countToday++;
                revenueToday += val;
            }
            if (d >= startWeek && d <= endWeek) {
                countWeek++;
                revenueWeek += val;
            }
            if (d >= startMonth && d <= endMonth) {
                countMonth++;
                revenueMonth += val;
            }
            if (d >= startYear && d <= endYear) {
                countYear++;
                revenueYear += val;
            }
        });

        return {
            today: { count: countToday, revenue: revenueToday },
            week: { count: countWeek, revenue: revenueWeek },
            month: { count: countMonth, revenue: revenueMonth },
            year: { count: countYear, revenue: revenueYear }
        };
    };

    // Period range helper
    const getPeriodRange = () => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        if (period === 'day') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);
            end.setDate(diff + 6);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'month') {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'year') {
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31);
            end.setHours(23, 59, 59, 999);
        }
        return { start, end };
    };

    // Calculate aggregated metrics for selected period & salesperson rankings
    const calculateMetrics = () => {
        const { start, end } = getPeriodRange();
        const kpiMap = {};

        hopDongs.forEach(hd => {
            if (hd.maHopDong === 'CH-CHUNG') return;
            if (hd.ngayHopDong) {
                const contractDate = new Date(hd.ngayHopDong);
                if (contractDate >= start && contractDate <= end) {
                    const saleName = hd.nhanVienSale && hd.nhanVienSale !== "0" ? hd.nhanVienSale.trim() : "Chưa phân công";
                    if (!kpiMap[saleName]) {
                        kpiMap[saleName] = { revenue: 0, count: 0 };
                    }
                    kpiMap[saleName].revenue += Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || hd.tongTien || hd.giaTriHopDong || 0);
                    kpiMap[saleName].count += 1;
                }
            }
        });

        const kpiRankings = Object.keys(kpiMap).map(name => ({
            name,
            revenue: kpiMap[name].revenue,
            count: kpiMap[name].count
        }));
        kpiRankings.sort((a, b) => b.revenue - a.revenue);

        return { kpiRankings };
    };

    // Calculate chart details (Contract count & Revenue) based on selected period
    const calculateChartData = () => {
        const now = new Date();
        const data = [];

        if (period === 'day') {
            const slots = [
                { label: "8h-11h", start: 8, end: 11 },
                { label: "11h-14h", start: 11, end: 14 },
                { label: "14h-17h", start: 14, end: 17 },
                { label: "17h-20h", start: 17, end: 20 },
                { label: "20h-23h", start: 20, end: 23 }
            ];
            
            slots.forEach(slot => {
                let count = 0;
                let revenue = 0;
                hopDongs.forEach(hd => {
                    if (hd.maHopDong === 'CH-CHUNG') return;
                    if (hd.ngayHopDong) {
                        const date = new Date(hd.ngayHopDong);
                        if (date.toDateString() === now.toDateString() && date.getHours() >= slot.start && date.getHours() < slot.end) {
                            count += 1;
                            revenue += Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0);
                        }
                    }
                });

                data.push({ label: slot.label, count, revenue });
            });

        } else if (period === 'week') {
            const dayNamesShort = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
            const currentDay = now.getDay();
            const mondayDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
            
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date();
                dayDate.setDate(mondayDiff + i);
                dayDate.setHours(0,0,0,0);
                
                let count = 0;
                let revenue = 0;

                hopDongs.forEach(hd => {
                    if (hd.maHopDong === 'CH-CHUNG') return;
                    if (hd.ngayHopDong) {
                        const pDate = new Date(hd.ngayHopDong);
                        if (pDate.toDateString() === dayDate.toDateString()) {
                            count += 1;
                            revenue += Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0);
                        }
                    }
                });

                data.push({ label: dayNamesShort[i], count, revenue });
            }

        } else if (period === 'month') {
            const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const segments = [
                { label: "Tuần 1", start: 1, end: 7 },
                { label: "Tuần 2", start: 8, end: 14 },
                { label: "Tuần 3", start: 15, end: 21 },
                { label: "Tuần 4", start: 22, end: totalDays }
            ];

            segments.forEach(seg => {
                let count = 0;
                let revenue = 0;

                hopDongs.forEach(hd => {
                    if (hd.maHopDong === 'CH-CHUNG') return;
                    if (hd.ngayHopDong) {
                        const date = new Date(hd.ngayHopDong);
                        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && date.getDate() >= seg.start && date.getDate() <= seg.end) {
                            count += 1;
                            revenue += Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0);
                        }
                    }
                });

                data.push({ label: seg.label, count, revenue });
            });

        } else if (period === 'year') {
            const monthLabels = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
            for (let m = 0; m < 12; m++) {
                let count = 0;
                let revenue = 0;

                hopDongs.forEach(hd => {
                    if (hd.maHopDong === 'CH-CHUNG') return;
                    if (hd.ngayHopDong) {
                        const date = new Date(hd.ngayHopDong);
                        if (date.getMonth() === m && date.getFullYear() === now.getFullYear()) {
                            count += 1;
                            revenue += Number(hd.thanhToan?.tongGiaTriSauGiam || hd.thanhToan?.tongGiaTri || 0);
                        }
                    }
                });

                data.push({ label: monthLabels[m], count, revenue });
            }
        }

        return data;
    };

    // Glassmorphic SVG Bar Chart for Contract Counts & Revenue
    const renderSVGChart = (chartData) => {
        const maxCount = Math.max(...chartData.map(d => d.count), 5);
        
        const width = 600;
        const height = 280;
        const paddingLeft = 50;
        const paddingRight = 20;
        const paddingTop = 30;
        const paddingBottom = 40;
        
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        
        return (
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="grad-contract-bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4"/>
                    </linearGradient>
                </defs>
                
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingTop + chartHeight * (1 - ratio);
                    const val = Math.round(maxCount * ratio);
                    return (
                        <g key={idx}>
                            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
                            <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b" fontWeight="500">{val} HĐ</text>
                        </g>
                    );
                })}
                
                {/* Bars rendering */}
                {chartData.map((d, idx) => {
                    const step = chartWidth / chartData.length;
                    const xCenter = paddingLeft + step * idx + step / 2;
                    
                    const barWidth = Math.min(step * 0.45, 36);
                    const barHeight = (d.count / maxCount) * chartHeight;
                    const xBar = xCenter - barWidth / 2;
                    const yBar = paddingTop + chartHeight - barHeight;
                    
                    return (
                        <g key={idx}>
                            {/* Contract Count Bar */}
                            <rect 
                                x={xBar} 
                                y={yBar} 
                                width={barWidth} 
                                height={Math.max(barHeight, 4)} 
                                fill="url(#grad-contract-bar)" 
                                rx="6"
                            />

                            {/* Count Badge on top of Bar */}
                            <text 
                                x={xCenter} 
                                y={yBar - 6} 
                                textAnchor="middle" 
                                fontSize="12" 
                                fill="#1e40af" 
                                fontWeight="bold"
                            >
                                {d.count > 0 ? `${d.count} HĐ` : '0'}
                            </text>

                            {/* Revenue label below badge if present */}
                            {d.revenue > 0 && (
                                <text 
                                    x={xCenter} 
                                    y={yBar - 20} 
                                    textAnchor="middle" 
                                    fontSize="10" 
                                    fill="#059669" 
                                    fontWeight="600"
                                >
                                    {(d.revenue / 1000000).toFixed(1)}Tr
                                </text>
                            )}

                            {/* Column Labels */}
                            <text x={xCenter} y={height - paddingBottom + 20} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

    const overallStats = calculateOverallContractStats();
    const metrics = calculateMetrics();
    const chartData = calculateChartData();

    return (
        <div className="DoanhThu" style={{ padding: '20px' }}>
            <style>{`
                .DoanhThu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .DoanhThu-header h2 {
                    font-size: 1.8rem;
                    font-weight: bold;
                    color: #0f172a;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .DoanhThu-card {
                    padding: 20px;
                    border-radius: 16px;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s ease;
                }
                .DoanhThu-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                }
                .DoanhThu-card-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                }
                .DoanhThu-card-title {
                    font-size: 0.85rem;
                    font-weight: bold;
                    color: #64748b;
                    margin: 0 0 4px 0;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .DoanhThu-card-value {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                .DoanhThu-card-sub {
                    font-size: 0.85rem;
                    color: #059669;
                    font-weight: 600;
                    margin: 2px 0 0 0;
                }
                .DoanhThu-chart-container {
                    padding: 24px;
                    border-radius: 16px;
                    background: white;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid #e2e8f0;
                    height: 100%;
                }
                .DoanhThu-kpi-container {
                    padding: 24px;
                    border-radius: 16px;
                    background: white;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid #e2e8f0;
                    height: 100%;
                }
                .kpi-medal {
                    font-size: 1.25rem;
                }
            `}</style>

            {/* HEADER & TIME PERIOD SELECTOR */}
            <div className="DoanhThu-header" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0' }}>
                <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', textAlign: isMobile ? 'center' : 'left' }}>
                    <i className="fa-solid fa-chart-line" style={{ color: '#2563eb' }}></i> BÁO CÁO HỢP ĐỒNG & DOANH THU
                </h2>
                <ToggleButtonGroup
                    value={period}
                    exclusive
                    onChange={(e, val) => val && setPeriod(val)}
                    aria-label="time period filter"
                    size="small"
                    style={{ width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}
                >
                    <ToggleButton value="day" style={{ padding: isMobile ? '6px 10px' : '8px 16px', fontWeight: 'bold' }}>Hôm Nay</ToggleButton>
                    <ToggleButton value="week" style={{ padding: isMobile ? '6px 10px' : '8px 16px', fontWeight: 'bold' }}>Tuần Này</ToggleButton>
                    <ToggleButton value="month" style={{ padding: isMobile ? '6px 10px' : '8px 16px', fontWeight: 'bold' }}>Tháng Này</ToggleButton>
                    <ToggleButton value="year" style={{ padding: isMobile ? '6px 10px' : '8px 16px', fontWeight: 'bold' }}>Năm Nay</ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* 4 CARDS HIGHLIGHTING CONTRACT COUNTS FOR TODAY, THIS WEEK, THIS MONTH, THIS YEAR */}
            <Grid container spacing={3} style={{ marginBottom: '25px' }}>
                {/* 1. HÔM NAY */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            <i className="fa-solid fa-calendar-day"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">HỢP ĐỒNG HÔM NAY</p>
                            <p className="DoanhThu-card-value" style={{ color: '#2563eb' }}>
                                {overallStats.today.count} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>HĐ</span>
                            </p>
                            <p className="DoanhThu-card-sub">
                                {overallStats.today.revenue.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>

                {/* 2. TUẦN NÀY */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                            <i className="fa-solid fa-calendar-week"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">HỢP ĐỒNG TUẦN NÀY</p>
                            <p className="DoanhThu-card-value" style={{ color: '#16a34a' }}>
                                {overallStats.week.count} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>HĐ</span>
                            </p>
                            <p className="DoanhThu-card-sub">
                                {overallStats.week.revenue.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>

                {/* 3. THÁNG NÀY */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                            <i className="fa-solid fa-calendar-days"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">HỢP ĐỒNG THÁNG NÀY</p>
                            <p className="DoanhThu-card-value" style={{ color: '#d97706' }}>
                                {overallStats.month.count} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>HĐ</span>
                            </p>
                            <p className="DoanhThu-card-sub">
                                {overallStats.month.revenue.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>

                {/* 4. NĂM NÀY */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                            <i className="fa-solid fa-chart-pie"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">HỢP ĐỒNG NĂM NÀY</p>
                            <p className="DoanhThu-card-value" style={{ color: '#9333ea' }}>
                                {overallStats.year.count} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>HĐ</span>
                            </p>
                            <p className="DoanhThu-card-sub">
                                {overallStats.year.revenue.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>
            </Grid>

            {/* CHARTS & KPI TABLE */}
            <Grid container spacing={3}>
                {/* SVG Chart columns for Contract Count */}
                <Grid item xs={12} lg={7}>
                    <div className="DoanhThu-chart-container">
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 'bold' }}>
                            📊 Biểu đồ Số Lượng Hợp Đồng {period === 'day' ? 'Hôm nay' : period === 'week' ? 'Tuần này' : period === 'month' ? 'Tháng này' : 'Năm nay'}
                        </h3>
                        <Box style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {chartData.length === 0 ? (
                                <p style={{ color: '#94a3b8' }}>Không đủ dữ liệu hiển thị biểu đồ</p>
                            ) : (
                                renderSVGChart(chartData)
                            )}
                        </Box>
                    </div>
                </Grid>

                {/* KPI Employee Ranking Table */}
                <Grid item xs={12} lg={5}>
                    <div className="DoanhThu-kpi-container">
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 'bold' }}>
                            🏆 Xếp Hạng Sale Theo Hợp Đồng Ký Mới
                        </h3>
                        {isMobile ? (
                            <Stack spacing={1}>
                                {metrics.kpiRankings.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                                        Không có dữ liệu hợp đồng trong khoảng thời gian này.
                                    </div>
                                ) : (
                                    metrics.kpiRankings.map((ranking, index) => {
                                        let medal = index + 1;
                                        if (index === 0) medal = <span className="kpi-medal">🥇</span>;
                                        else if (index === 1) medal = <span className="kpi-medal">🥈</span>;
                                        else if (index === 2) medal = <span className="kpi-medal">🥉</span>;

                                        return (
                                            <Card key={ranking.name} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: index === 0 ? 'rgba(254, 243, 199, 0.5)' : 'white' }}>
                                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                            <Typography variant="h6" fontWeight="bold">{medal}</Typography>
                                                            <Typography variant="body1" fontWeight="bold">{ranking.name}</Typography>
                                                        </Box>
                                                        <Box textAlign="right">
                                                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                                {ranking.count} hợp đồng
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {ranking.revenue.toLocaleString('vi-VN')} đ
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </Stack>
                        ) : (
                        <TableContainer style={{ maxHeight: '290px', overflow: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead sx={{ '& th': { backgroundColor: '#f8fafc', color: '#475569', fontWeight: 'bold' } }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ fontWeight: 'bold', width: '70px' }}>Hạng</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Nhân viên Sale</TableCell>
                                        <TableCell align="center" style={{ fontWeight: 'bold', width: '90px' }}>Số HĐ</TableCell>
                                        <TableCell align="right" style={{ fontWeight: 'bold' }}>Doanh số</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {metrics.kpiRankings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" style={{ padding: '20px', color: '#94a3b8' }}>
                                                Không có dữ liệu hợp đồng trong khoảng thời gian này.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        metrics.kpiRankings.map((ranking, index) => {
                                            let medal = index + 1;
                                            if (index === 0) medal = <span className="kpi-medal">🥇</span>;
                                            else if (index === 1) medal = <span className="kpi-medal">🥈</span>;
                                            else if (index === 2) medal = <span className="kpi-medal">🥉</span>;
                                            
                                            return (
                                                <TableRow key={ranking.name} style={{
                                                    backgroundColor: index === 0 ? 'rgba(254, 243, 199, 0.4)' : 'inherit'
                                                }}>
                                                    <TableCell align="center" style={{ fontWeight: 'bold' }}>{medal}</TableCell>
                                                    <TableCell style={{ fontWeight: '500' }}>{ranking.name}</TableCell>
                                                    <TableCell align="center" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                                        {ranking.count} HĐ
                                                    </TableCell>
                                                    <TableCell align="right" style={{ color: '#059669', fontWeight: 'bold' }}>
                                                        {ranking.revenue.toLocaleString('vi-VN')} đ
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        )}
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

export default DoanhThu;
