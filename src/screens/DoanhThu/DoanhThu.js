import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

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

function DoanhThu() {
    const { showLoading, hideLoading } = useLoading();
    const [hopDongs, setHopDongs] = useState([]);
    const [period, setPeriod] = useState('month'); // 'day', 'week', 'month', 'year'

    // Load data from contracts API
    const loadData = () => {
        showLoading("Đang tải báo cáo doanh thu & KPI...");
        otherService.LIST_HOPDONG({})
            .then(res => {
                setHopDongs(res.data.hopDong || []);
            })
            .catch(err => {
                console.error(err);
                toast.error("Lỗi khi tải dữ liệu báo cáo: " + err.message);
            })
            .finally(() => hideLoading());
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter calculations based on selected period
    const getPeriodRange = () => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        if (period === 'day') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'week') {
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
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

    // Calculate aggregated metrics
    const calculateMetrics = () => {
        const { start, end } = getPeriodRange();
        
        let totalThu = 0; // cash collected in selected range
        let totalChi = 0; // cash spent in selected range
        let totalKyMoi = 0; // contract value signed in selected range
        let countContracts = 0; // number of actual client contracts signed in range

        const kpiMap = {}; // salesperson KPI mapping (signed contracts value in period)

        hopDongs.forEach(hd => {
            const isClientContract = hd.maHopDong !== 'CH-CHUNG';

            // 1. Calculate Signed Value (Ký mới)
            if (isClientContract && hd.ngayHopDong) {
                const contractDate = new Date(hd.ngayHopDong);
                if (contractDate >= start && contractDate <= end) {
                    totalKyMoi += Number(hd.tongTien || hd.giaTriHopDong || 0);
                    countContracts += 1;

                    // Group for KPI (only active client contracts signed in this period)
                    const saleName = hd.nhanVienSale && hd.nhanVienSale !== "0" ? hd.nhanVienSale.trim() : "Chưa phân công";
                    if (!kpiMap[saleName]) {
                        kpiMap[saleName] = { revenue: 0, count: 0 };
                    }
                    kpiMap[saleName].revenue += Number(hd.tongTien || hd.giaTriHopDong || 0);
                    kpiMap[saleName].count += 1;
                }
            }

            // 2. Calculate Cash Collected (Thu)
            const payments = hd.thanhToan?.cacLuotThanhToan || [];
            payments.forEach(p => {
                if (p.date) {
                    const payDate = new Date(p.date);
                    if (payDate >= start && payDate <= end) {
                        totalThu += Number(p.amount || 0);
                    }
                }
            });

            // 3. Calculate Cash Spent (Chi)
            const expenses = hd.cacLuotChi || [];
            expenses.forEach(e => {
                if (e.date) {
                    const expDate = new Date(e.date);
                    if (expDate >= start && expDate <= end) {
                        totalChi += Number(e.amount || 0);
                    }
                }
            });
        });

        // Convert KPI mapping to sorted array
        const kpiRankings = Object.keys(kpiMap).map(name => ({
            name,
            revenue: kpiMap[name].revenue,
            count: kpiMap[name].count
        }));
        // Sort descending by revenue
        kpiRankings.sort((a, b) => b.revenue - a.revenue);

        return {
            totalThu,
            totalChi,
            totalKyMoi,
            profit: totalThu - totalChi,
            countContracts,
            kpiRankings
        };
    };

    // Calculate chart details based on selected period
    const calculateChartData = () => {
        const now = new Date();
        const data = [];

        if (period === 'day') {
            // Group by hour segments: 8h-11h, 11h-14h, 14h-17h, 17h-20h, 20h-23h
            const slots = [
                { label: "8h-11h", start: 8, end: 11 },
                { label: "11h-14h", start: 11, end: 14 },
                { label: "14h-17h", start: 14, end: 17 },
                { label: "17h-20h", start: 17, end: 20 },
                { label: "20h-23h", start: 20, end: 23 }
            ];
            
            slots.forEach(slot => {
                let thu = 0;
                let chi = 0;
                hopDongs.forEach(hd => {
                    const payments = hd.thanhToan?.cacLuotThanhToan || [];
                    payments.forEach(p => {
                        if (p.date) {
                            const date = new Date(p.date);
                            if (date.toDateString() === now.toDateString() && date.getHours() >= slot.start && date.getHours() < slot.end) {
                                thu += Number(p.amount || 0);
                            }
                        }
                    });

                    const expenses = hd.cacLuotChi || [];
                    expenses.forEach(e => {
                        if (e.date) {
                            const date = new Date(e.date);
                            if (date.toDateString() === now.toDateString() && date.getHours() >= slot.start && date.getHours() < slot.end) {
                                chi += Number(e.amount || 0);
                            }
                        }
                    });
                });
                data.push({ label: slot.label, thu, chi });
            });

        } else if (period === 'week') {
            // Group by Day of Week (Thứ 2 to CN)
            const dayNamesShort = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
            const currentDay = now.getDay();
            const mondayDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
            
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date();
                dayDate.setDate(mondayDiff + i);
                dayDate.setHours(0,0,0,0);
                
                let thu = 0;
                let chi = 0;

                hopDongs.forEach(hd => {
                    const payments = hd.thanhToan?.cacLuotThanhToan || [];
                    payments.forEach(p => {
                        if (p.date) {
                            const pDate = new Date(p.date);
                            if (pDate.toDateString() === dayDate.toDateString()) {
                                thu += Number(p.amount || 0);
                            }
                        }
                    });

                    const expenses = hd.cacLuotChi || [];
                    expenses.forEach(e => {
                        if (e.date) {
                            const eDate = new Date(e.date);
                            if (eDate.toDateString() === dayDate.toDateString()) {
                                chi += Number(e.amount || 0);
                            }
                        }
                    });
                });

                data.push({ label: dayNamesShort[i], thu, chi });
            }

        } else if (period === 'month') {
            // Group by 4 Weeks of the current month
            const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const segments = [
                { label: "Tuần 1", start: 1, end: 7 },
                { label: "Tuần 2", start: 8, end: 14 },
                { label: "Tuần 3", start: 15, end: 21 },
                { label: "Tuần 4", start: 22, end: totalDays }
            ];

            segments.forEach(seg => {
                let thu = 0;
                let chi = 0;

                hopDongs.forEach(hd => {
                    const payments = hd.thanhToan?.cacLuotThanhToan || [];
                    payments.forEach(p => {
                        if (p.date) {
                            const date = new Date(p.date);
                            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && date.getDate() >= seg.start && date.getDate() <= seg.end) {
                                thu += Number(p.amount || 0);
                            }
                        }
                    });

                    const expenses = hd.cacLuotChi || [];
                    expenses.forEach(e => {
                        if (e.date) {
                            const date = new Date(e.date);
                            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && date.getDate() >= seg.start && date.getDate() <= seg.end) {
                                chi += Number(e.amount || 0);
                            }
                        }
                    });
                });

                data.push({ label: seg.label, thu, chi });
            });

        } else if (period === 'year') {
            // Group by 12 months
            const monthLabels = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
            for (let m = 0; m < 12; m++) {
                let thu = 0;
                let chi = 0;

                hopDongs.forEach(hd => {
                    const payments = hd.thanhToan?.cacLuotThanhToan || [];
                    payments.forEach(p => {
                        if (p.date) {
                            const date = new Date(p.date);
                            if (date.getMonth() === m && date.getFullYear() === now.getFullYear()) {
                                thu += Number(p.amount || 0);
                            }
                        }
                    });

                    const expenses = hd.cacLuotChi || [];
                    expenses.forEach(e => {
                        if (e.date) {
                            const date = new Date(e.date);
                            if (date.getMonth() === m && date.getFullYear() === now.getFullYear()) {
                                chi += Number(e.amount || 0);
                            }
                        }
                    });
                });

                data.push({ label: monthLabels[m], thu, chi });
            }
        }

        return data;
    };

    // Responsive glassmorphic react SVG charting
    const renderSVGChart = (chartData) => {
        const maxVal = Math.max(...chartData.map(d => Math.max(d.thu, d.chi)), 1000000);
        
        const width = 600;
        const height = 280;
        const paddingLeft = 70;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;
        
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        
        return (
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="grad-thu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2ecc71" stopOpacity="0.85"/>
                        <stop offset="100%" stopColor="#2ecc71" stopOpacity="0.25"/>
                    </linearGradient>
                    <linearGradient id="grad-chi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e74c3c" stopOpacity="0.85"/>
                        <stop offset="100%" stopColor="#e74c3c" stopOpacity="0.25"/>
                    </linearGradient>
                </defs>
                
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = paddingTop + chartHeight * (1 - ratio);
                    // Format currency nicely in millions
                    const val = maxVal * ratio;
                    let label = "";
                    if (val >= 1000000) {
                        label = (val / 1000000).toFixed(1).replace('.0', '') + " Tr";
                    } else if (val >= 1000) {
                        label = (val / 1000).toFixed(0) + " K";
                    } else {
                        label = val.toFixed(0);
                    }
                    return (
                        <g key={idx}>
                            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f0f0f0" strokeWidth="1"/>
                            <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10.5" fill="#7f8c8d">{label}</text>
                        </g>
                    );
                })}
                
                {/* Bars rendering */}
                {chartData.map((d, idx) => {
                    const step = chartWidth / chartData.length;
                    const xCenter = paddingLeft + step * idx + step / 2;
                    
                    const barWidth = Math.min(step * 0.32, 16);
                    const thuHeight = (d.thu / maxVal) * chartHeight;
                    const chiHeight = (d.chi / maxVal) * chartHeight;
                    
                    const xThu = xCenter - barWidth - 2;
                    const xChi = xCenter + 2;
                    
                    const yThu = paddingTop + chartHeight - thuHeight;
                    const yChi = paddingTop + chartHeight - chiHeight;
                    
                    return (
                        <g key={idx}>
                            {/* Thu Bar */}
                            <rect x={xThu} y={yThu} width={barWidth} height={thuHeight} fill="url(#grad-thu)" rx="3"/>
                            
                            {/* Chi Bar */}
                            <rect x={xChi} y={yChi} width={barWidth} height={chiHeight} fill="url(#grad-chi)" rx="3"/>
                            
                            {/* Column Labels */}
                            <text x={xCenter} y={height - paddingBottom + 18} textAnchor="middle" fontSize="11" fill="#4f5d75" fontWeight="500">
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    };

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
                    color: #1976d2;
                    margin: 0;
                }
                .DoanhThu-card {
                    padding: 20px;
                    border-radius: 12px;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.03);
                    transition: transform 0.2s;
                }
                .DoanhThu-card:hover {
                    transform: translateY(-3px);
                }
                .DoanhThu-card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem;
                }
                .DoanhThu-card-title {
                    font-size: 0.85rem;
                    font-weight: bold;
                    color: #7f8c8d;
                    margin: 0 0 6px 0;
                    letter-spacing: 0.5px;
                }
                .DoanhThu-card-value {
                    font-size: 1.45rem;
                    font-weight: bold;
                    color: #2c3e50;
                    margin: 0;
                }
                .DoanhThu-chart-container {
                    padding: 20px;
                    border-radius: 12px;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.03);
                    height: 100%;
                }
                .DoanhThu-kpi-container {
                    padding: 20px;
                    border-radius: 12px;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.03);
                    height: 100%;
                }
                .kpi-medal {
                    font-size: 1.25rem;
                }
            `}</style>

            {/* HEADER & TIME PERIOD SELECTOR */}
            <div className="DoanhThu-header">
                <h2>BÁO CÁO DOANH THU & KPI</h2>
                <ToggleButtonGroup
                    value={period}
                    exclusive
                    onChange={(e, val) => val && setPeriod(val)}
                    aria-label="time period filter"
                    size="small"
                >
                    <ToggleButton value="day" style={{ padding: '8px 16px', fontWeight: 'bold' }}>Hôm Nay</ToggleButton>
                    <ToggleButton value="week" style={{ padding: '8px 16px', fontWeight: 'bold' }}>Tuần Này</ToggleButton>
                    <ToggleButton value="month" style={{ padding: '8px 16px', fontWeight: 'bold' }}>Tháng Này</ToggleButton>
                    <ToggleButton value="year" style={{ padding: '8px 16px', fontWeight: 'bold' }}>Năm Nay</ToggleButton>
                </ToggleButtonGroup>
            </div>

            {/* SUMMARY METRICS CARDS */}
            <Grid container spacing={3} style={{ marginBottom: '25px' }}>
                {/* 1. TỔNG THU */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#e8f8f5', color: '#2ecc71' }}>
                            <i className="fa-solid fa-arrow-trend-up"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">TỔNG THU (ĐÃ THU)</p>
                            <p className="DoanhThu-card-value" style={{ color: '#2ecc71' }}>
                                {metrics.totalThu.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>

                {/* 2. TỔNG CHI */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#fdedec', color: '#e74c3c' }}>
                            <i className="fa-solid fa-arrow-trend-down"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">TỔNG CHI TIÊU</p>
                            <p className="DoanhThu-card-value" style={{ color: '#e74c3c' }}>
                                {metrics.totalChi.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>

                {/* 3. LỢI NHUẬN */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ 
                            backgroundColor: metrics.profit >= 0 ? '#ebf5fb' : '#fef9e7', 
                            color: metrics.profit >= 0 ? '#3498db' : '#f39c12' 
                        }}>
                            <i className="fa-solid fa-scale-balanced"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">LỢI NHUẬN THỰC TẾ</p>
                            <p className="DoanhThu-card-value" style={{ color: metrics.profit >= 0 ? '#3498db' : '#f39c12' }}>
                                {metrics.profit.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>

                {/* 4. TỔNG HỢP ĐỒNG KÝ MỚI */}
                <Grid item xs={12} sm={6} md={3}>
                    <div className="DoanhThu-card">
                        <div className="DoanhThu-card-icon" style={{ backgroundColor: '#f4ecf7', color: '#9b59b6' }}>
                            <i className="fa-solid fa-file-invoice-dollar"></i>
                        </div>
                        <div>
                            <p className="DoanhThu-card-title">KÝ MỚI ({metrics.countContracts} HĐ)</p>
                            <p className="DoanhThu-card-value" style={{ color: '#9b59b6' }}>
                                {metrics.totalKyMoi.toLocaleString('vi-VN')} đ
                            </p>
                        </div>
                    </div>
                </Grid>
            </Grid>

            {/* CHARTS & KPI TABLE */}
            <Grid container spacing={3}>
                {/* SVG Chart columns */}
                <Grid item xs={12} lg={7}>
                    <div className="DoanhThu-chart-container">
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#2c3e50', fontWeight: 'bold' }}>
                            Biểu đồ Thu & Chi {period === 'day' ? 'Hôm nay' : period === 'week' ? 'Tuần này' : period === 'month' ? 'Tháng này' : 'Năm nay'}
                        </h3>
                        <Box style={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {chartData.length === 0 ? (
                                <p style={{ color: '#999' }}>Không đủ dữ liệu hiển thị biểu đồ</p>
                            ) : (
                                renderSVGChart(chartData)
                            )}
                        </Box>
                        <Box display="flex" justifyContent="center" gap={4} mt={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: '#2ecc71' }}></div>
                                <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>Tổng Thu</span>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: '#e74c3c' }}></div>
                                <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>Tổng Chi</span>
                            </Box>
                        </Box>
                    </div>
                </Grid>

                {/* KPI Employee Ranking Table */}
                <Grid item xs={12} lg={5}>
                    <div className="DoanhThu-kpi-container">
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#2c3e50', fontWeight: 'bold' }}>
                            Xếp hạng KPI Nhân viên (Ký mới)
                        </h3>
                        <TableContainer style={{ maxHeight: '290px' }}>
                            <Table size="small">
                                <TableHead style={{ backgroundColor: '#fafafa' }}>
                                    <TableRow>
                                        <TableCell align="center" style={{ fontWeight: 'bold', width: '70px' }}>Hạng</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Nhân viên Sale</TableCell>
                                        <TableCell align="right" style={{ fontWeight: 'bold' }}>Doanh số</TableCell>
                                        <TableCell align="center" style={{ fontWeight: 'bold', width: '80px' }}>Số HĐ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {metrics.kpiRankings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" style={{ padding: '20px', color: '#999' }}>
                                                Không có dữ liệu KPI trong khoảng thời gian này.
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
                                                    backgroundColor: index === 0 ? 'rgba(241, 196, 15, 0.05)' : 'inherit'
                                                }}>
                                                    <TableCell align="center" style={{ fontWeight: 'bold' }}>{medal}</TableCell>
                                                    <TableCell style={{ fontWeight: '500' }}>{ranking.name}</TableCell>
                                                    <TableCell align="right" style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                                                        {ranking.revenue.toLocaleString('vi-VN')} đ
                                                    </TableCell>
                                                    <TableCell align="center">{ranking.count}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}

export default DoanhThu;