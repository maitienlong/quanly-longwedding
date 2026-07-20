import React, { useState, useEffect } from 'react';
import otherService from '../../API/services/otherService';
import { useLoading } from "../../context/LoadingContext";
import { toast } from 'sonner';
import { useAuth } from '../Login/AuthContext/AuthContext';
import './thiDua.css';

// Material UI components
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import logoDefault from '../../assets/logo/BETA-1 VANG@4x.png';

function ThiDua() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showLoading, hideLoading } = useLoading();
    const { user } = useAuth();

    const isManager = user?.positon === "Quản lý" || user?.permission === 1;

    // Filters state
    const [timeRange, setTimeRange] = useState('month'); // week, month, year, custom
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [position, setPosition] = useState('Tất cả');

    // Data state
    const [stats, setStats] = useState([]);
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalWork: 0,
        totalExceededCount: 0,
        totalHoaHongFund: 0
    });

    // Dialog Target Adjustment State
    const [openTargetDialog, setOpenTargetDialog] = useState(false);
    const [editTargetsList, setEditTargetsList] = useState([]);

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
                if (res.data && res.data.status === 'success') {
                    setStats(res.data.data.stats || []);
                    setSummary(res.data.data.summary || {});
                } else if (res.status === 'success') {
                    setStats(res.data.stats || []);
                    setSummary(res.data.summary || {});
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
            chiTieuNam: item.chiTieuNam || 200
        })));
        setOpenTargetDialog(true);
    };

    const handleSaveTargets = () => {
        showLoading("Đang lưu thay đổi chỉ tiêu...");
        otherService.updateBatchTargets({ targets: editTargetsList })
            .then(() => {
                toast.success("Cập nhật chỉ tiêu thành công!");
                setOpenTargetDialog(false);
                fetchStats();
            })
            .catch(err => {
                toast.error("Lỗi cập nhật chỉ tiêu: " + err.message);
                hideLoading();
            });
    };

    // Calculate Top 3 for Podium
    const top3 = stats.slice(0, 3);
    const top1 = top3[0] || null;
    const top2 = top3[1] || null;
    const top3_staff = top3[2] || null;

    // SVG Bar Chart rendering
    const renderChart = () => {
        if (!stats || stats.length === 0) return null;

        const maxWork = Math.max(...stats.map(s => Math.max(s.countWork, s.target)), 10);
        const chartHeight = 220;
        const barWidth = Math.min(45, Math.max(20, Math.floor(600 / stats.length)));

        return (
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
                <svg width="100%" height={chartHeight + 60} viewBox={`0 0 ${Math.max(700, stats.length * 80)} ${chartHeight + 60}`}>
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = chartHeight * (1 - ratio) + 20;
                        const val = Math.round(maxWork * ratio);
                        return (
                            <g key={i}>
                                <line x1="40" y1={y} x2="100%" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" />
                                <text x="30" y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{val}</text>
                            </g>
                        );
                    })}

                    {/* Bars for each user */}
                    {stats.map((item, idx) => {
                        const step = Math.max(70, Math.floor(700 / stats.length));
                        const x = 60 + idx * step;
                        const workH = (item.countWork / maxWork) * chartHeight;
                        const targetH = (item.target / maxWork) * chartHeight;
                        const yWork = chartHeight - workH + 20;
                        const yTarget = chartHeight - targetH + 20;

                        const isExceeded = item.isExceeded;

                        return (
                            <g key={item.username} className="chart-bar-group">
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
                                    fill={isExceeded ? "url(#exceededGradient)" : "url(#normalGradient)"}
                                    style={{ transition: 'all 0.5s ease' }}
                                />

                                {/* Work Count Label above bar */}
                                <text 
                                    x={x + barWidth / 2} 
                                    y={yWork - 6} 
                                    fontSize="11" 
                                    fontWeight="bold" 
                                    fill={isExceeded ? "#15803d" : "#0f172a"} 
                                    textAnchor="middle"
                                >
                                    {item.countWork} {isExceeded ? "🏆" : ""}
                                </text>

                                {/* User name below bar */}
                                <text 
                                    x={x + barWidth / 2} 
                                    y={chartHeight + 40} 
                                    fontSize="11" 
                                    fill="#475569" 
                                    fontWeight="600" 
                                    textAnchor="middle"
                                >
                                    {item.fullname.split(' ').pop()}
                                </text>
                            </g>
                        );
                    })}

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="exceededGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#15803d" />
                        </linearGradient>
                        <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    };

    return (
        <div className="thidua-container">
            {/* HEADER & CONTROLS */}
            <div className="thidua-header">
                <div className="thidua-title-group">
                    <h2>
                        <i className="fa-solid fa-trophy"></i> THI ĐƯA & KPI NHÂN VIÊN
                    </h2>
                    <p>Bảng tổng kết thi đua, biểu đồ công việc và vinh danh nhân viên vượt chỉ tiêu</p>
                </div>

                <div className="thidua-controls">
                    <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#fff', borderRadius: 1 }}>
                        <InputLabel>Mốc thời gian</InputLabel>
                        <Select
                            value={timeRange}
                            label="Mốc thời gian"
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="week">Tuần này</MenuItem>
                            <MenuItem value="month">Tháng này</MenuItem>
                            <MenuItem value="year">Năm nay</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160, bgcolor: '#fff', borderRadius: 1 }}>
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

                    {isManager && (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleOpenTargetDialog}
                            startIcon={<i className="fa-solid fa-sliders"></i>}
                            sx={{ height: 40, fontWeight: 'bold' }}
                        >
                            Điều Chỉnh Chỉ Tiêu
                        </Button>
                    )}
                </div>
            </div>

            {/* KPI SUMMARY CARDS */}
            <div className="kpi-cards-grid">
                <div className="kpi-card">
                    <div className="kpi-card-info">
                        <p>Tổng số công việc</p>
                        <h3>{summary.totalWork || 0} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>công việc</span></h3>
                    </div>
                    <div className="kpi-card-icon kpi-icon-blue">
                        <i className="fa-solid fa-briefcase"></i>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-card-info">
                        <p>Vượt chỉ tiêu</p>
                        <h3 style={{ color: '#16a34a' }}>{summary.totalExceededCount || 0} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>nhân viên</span></h3>
                    </div>
                    <div className="kpi-card-icon kpi-icon-green">
                        <i className="fa-solid fa-award"></i>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-card-info">
                        <p>Quán quân dẫn đầu</p>
                        <h3 style={{ fontSize: '1.3rem', color: '#d97706' }}>{top1 ? top1.fullname : 'Chưa có'}</h3>
                    </div>
                    <div className="kpi-card-icon kpi-icon-gold">
                        <i className="fa-solid fa-crown"></i>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-card-info">
                        <p>Quỹ hoa hồng dự kiến</p>
                        <h3 style={{ color: '#9333ea', fontSize: '1.4rem' }}>
                            {Number(summary.totalHoaHongFund || 0).toLocaleString('vi-VN')} đ
                        </h3>
                    </div>
                    <div className="kpi-card-icon kpi-icon-purple">
                        <i className="fa-solid fa-coins"></i>
                    </div>
                </div>
            </div>

            {/* PODIUM TOP 3 VINH DẠNH */}
            {top3.length > 0 && (
                <div className="podium-container">
                    <div className="podium-title">
                        <h3>🏆 BẢNG VINH DẠNH TOP BỨT PHÁ KPI</h3>
                        <p>Ghi nhận những nỗ lực xuất sắc nhất trong {timeRange === 'week' ? 'Tuần' : timeRange === 'year' ? 'Năm' : 'Tháng'}</p>
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
                                        sx={{ width: 68, height: 68, border: '3px solid #94a3b8', margin: '0 auto 10px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} 
                                    />
                                    <div className="podium-user-name">{top2.fullname}</div>
                                    <div className="podium-user-role">{top2.positon}</div>
                                </div>
                                <div className="podium-card podium-box-2">
                                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Á QUÂN</div>
                                    <div className="podium-work-count">{top2.countWork} CV</div>
                                    <div className="podium-target-pct">{top2.completionPercent}% chỉ tiêu</div>
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
                                        sx={{ width: 84, height: 84, border: '4px solid #fbbf24', margin: '0 auto 10px auto', boxShadow: '0 6px 16px rgba(251, 191, 36, 0.4)' }} 
                                    />
                                    <div className="podium-user-name" style={{ fontSize: '1.1rem', color: '#fbbf24' }}>{top1.fullname}</div>
                                    <div className="podium-user-role">{top1.positon}</div>
                                </div>
                                <div className="podium-card podium-box-1">
                                    <div style={{ color: '#fef08a', fontWeight: 'bold', fontSize: '0.9rem' }}>QUÁN QUÂN</div>
                                    <div className="podium-work-count" style={{ fontSize: '1.8rem', color: '#fff' }}>{top1.countWork} CV</div>
                                    <div className="podium-target-pct" style={{ bgcolor: 'rgba(255,255,255,0.25)' }}>{top1.completionPercent}% chỉ tiêu</div>
                                    {top1.isExceeded && (
                                        <span className="badge-exceeded" style={{ marginTop: '8px', bgcolor: '#fff', color: '#15803d' }}>
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
                                        sx={{ width: 68, height: 68, border: '3px solid #b45309', margin: '0 auto 10px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} 
                                    />
                                    <div className="podium-user-name">{top3_staff.fullname}</div>
                                    <div className="podium-user-role">{top3_staff.positon}</div>
                                </div>
                                <div className="podium-card podium-box-3">
                                    <div style={{ color: '#fde68a', fontSize: '0.85rem' }}>HẠNG 3</div>
                                    <div className="podium-work-count">{top3_staff.countWork} CV</div>
                                    <div className="podium-target-pct">{top3_staff.completionPercent}% chỉ tiêu</div>
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
                    <h3>📊 Biểu Đồ Số Lượng Công Việc vs Mốc Chỉ Tiêu</h3>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="legend-box" style={{ background: '#22c55e' }}></div>
                            <span>Vượt chỉ tiêu</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-box" style={{ background: '#3b82f6' }}></div>
                            <span>Trong chỉ tiêu</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-box" style={{ background: '#ef4444', height: '2px' }}></div>
                            <span>Đường mốc chỉ tiêu</span>
                        </div>
                    </div>
                </div>
                {renderChart()}
            </div>

            {/* DETAILED STATS TABLE */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                        📋 Bảng Chi Tiết Thành Tích Thi Đua & Hoa Hồng
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader>
                        <TableHead sx={{ '& th': { backgroundColor: '#f8fafc', fontWeight: 'bold', color: '#475569' } }}>
                            <TableRow>
                                <TableCell align="center" style={{ width: '60px' }}>HẠNG</TableCell>
                                <TableCell style={{ width: '200px' }}>NHÂN VIÊN</TableCell>
                                <TableCell style={{ width: '150px' }}>CHỨC VỤ</TableCell>
                                <TableCell align="center" style={{ width: '150px' }}>ĐẠT / CHỈ TIÊU</TableCell>
                                <TableCell align="center" style={{ width: '140px' }}>% HOÀN THÀNH</TableCell>
                                <TableCell align="right" style={{ width: '160px' }}>HOA HỒNG DỰ KIẾN</TableCell>
                                <TableCell align="center" style={{ width: '160px' }}>TRẠNG THÁI</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" style={{ padding: '30px', color: '#94a3b8' }}>
                                        Chưa có dữ liệu thống kê cho mốc thời gian này.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stats.map((item) => (
                                    <TableRow 
                                        key={item.username} 
                                        sx={{ 
                                            backgroundColor: item.isExceeded ? '#f0fdf4' : 'inherit',
                                            '&:hover': { backgroundColor: '#f8fafc' } 
                                        }}
                                    >
                                        <TableCell align="center">
                                            {item.rank === 1 && <span style={{ fontSize: '1.2rem' }}>🥇</span>}
                                            {item.rank === 2 && <span style={{ fontSize: '1.2rem' }}>🥈</span>}
                                            {item.rank === 3 && <span style={{ fontSize: '1.2rem' }}>🥉</span>}
                                            {item.rank > 3 && <b>#{item.rank}</b>}
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Avatar src={item.avatar || logoDefault} sx={{ width: 36, height: 36, border: '1px solid #e2e8f0' }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                                                        {item.fullname}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        @{item.username}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{item.positon || '-'}</TableCell>
                                        <TableCell align="center">
                                            <b style={{ fontSize: '1rem', color: item.isExceeded ? '#16a34a' : '#0f172a' }}>
                                                {item.countWork}
                                            </b> / {item.target} CV
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={`${item.completionPercent}%`}
                                                size="small"
                                                color={item.completionPercent >= 100 ? "success" : item.completionPercent >= 75 ? "primary" : "default"}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" style={{ fontWeight: 'bold', color: '#9333ea' }}>
                                            {Number(item.hoaHongEst || 0).toLocaleString('vi-VN')} đ
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.isExceeded ? (
                                                <span className="badge-exceeded">
                                                    🔥 VƯỢT CHỈ TIÊU ({item.percentExceeded}%)
                                                </span>
                                            ) : item.completionPercent >= 100 ? (
                                                <span className="badge-reached">
                                                    ✅ ĐẠT CHỈ TIÊU
                                                </span>
                                            ) : (
                                                <span className="badge-normal">
                                                    ⏳ ĐANG THỰC HIỆN
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* DIALOG ADJUST TARGETS BATCH */}
            <Dialog open={openTargetDialog} onClose={() => setOpenTargetDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle style={{ fontWeight: 'bold', color: '#d97706', borderBottom: '1px solid #eee' }}>
                    ⚙️ ĐIỀU CHỈNH CHỈ TIÊU CÔNG VIỆC NHÂN VIÊN
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Quản lý có thể điều chỉnh chỉ tiêu Tuần, Tháng và Năm cho từng nhân viên dưới đây:
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>NHÂN VIÊN</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>CHỨC VỤ</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', width: '120px' }}>CT TUẦN (CV)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', width: '120px' }}>CT THÁNG (CV)</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', width: '120px' }}>CT NĂM (CV)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {editTargetsList.map((item, idx) => (
                                    <TableRow key={item.username}>
                                        <TableCell>
                                            <b>{item.fullname}</b>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>@{item.username}</div>
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
                                                inputProps={{ style: { textAlign: 'center' } }}
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
                                                inputProps={{ style: { textAlign: 'center' } }}
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
                                                inputProps={{ style: { textAlign: 'center' } }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button onClick={() => setOpenTargetDialog(false)} color="inherit">
                        Hủy
                    </Button>
                    <Button onClick={handleSaveTargets} variant="contained" color="warning">
                        Lưu chỉ tiêu
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ThiDua;
