import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, Navigate } from "react-router-dom";
import logo from '../assets/logo/logo-vang.png';
import './css/mainv2.css';
import HopDongKhachHang from '../screens/HopDong/HopDongKhachHang';
import LichCuaHang from "../screens/LichCuaHang/LichCuaHang";
import QuanLyChiTieu from "../screens/QuanLyChiTieu/QuanLyChiTieu";
import LichSoanDo from "../screens/LichSoanDo/LichSoanDo";
import DoanhThu from "../screens/DoanhThu/DoanhThu";
import QuanLyKho from "../screens/QuanLyKho/QuanLyKho";
import QuanLyNhanVien from "../screens/QuanLyNhanVien/QuanLyNhanVien";
import QuanLyKhachHang from "../screens/QuanLyKhachHang/QuanLyKhachHang";
import QuanLyWebsite from "../screens/QuanLyWebsite/QuanLyWebsite";
import SystemLogs from "../screens/SystemLogs/SystemLogs";
import ThiDua from "../screens/ThiDua/ThiDua";
import { useAuth } from '../screens/Login/AuthContext/AuthContext';
import otherService from "../API/services/otherService";
import { updateContractTypesCache } from "../utils/contractTypesHelper";
import { formatLunarDateFull } from "../utils/lunarDateUtils";

// Material UI components for reliable centered Dialog
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
    Box,
    Stack,
    Avatar,
    Chip,
    Paper,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function MainV2() {
    const navigate = useNavigate();
    const [showDialog, setShowDialog] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [userProfileData, setUserProfileData] = useState(null);
    const { user, logout } = useAuth();

    const [ctime, setTime] = useState(new Date().toLocaleTimeString());
    const [cdate, setDate] = useState(new Date().toLocaleDateString());
    const dayNames = ["Chủ nhật", "Thứ hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    useEffect(() => {
        if (showDialog && user) {
            // Lấy thông tin user đầy đủ từ DB
            otherService.findUsers({})
                .then(res => {
                    const list = res.data?.users || res.data || [];
                    if (Array.isArray(list)) {
                        const found = list.find(u => 
                            (u.username && u.username.toLowerCase() === user?.username?.toLowerCase()) ||
                            (u._id && user._id && u._id.toString() === user._id.toString())
                        );
                        if (found) {
                            setUserProfileData(found);
                        }
                    }
                })
                .catch(err => console.error("Lỗi lấy danh sách user:", err));

            // Lấy chỉ tiêu thi đua & KPI
            otherService.getThiDuaStats({ timeRange: 'month' })
                .then(res => {
                    const allStats = res.data?.data?.stats || res.data?.stats || [];
                    if (Array.isArray(allStats)) {
                        const myStat = allStats.find(s => 
                            (s.username && s.username.toLowerCase() === user?.username?.toLowerCase()) ||
                            (s.fullname && (user?.fullname || user?.hoTen) && s.fullname.toLowerCase() === (user?.fullname || user?.hoTen).toLowerCase())
                        );
                        if (myStat) setUserStats(myStat);
                    }
                })
                .catch(err => console.error("Lỗi lấy chỉ tiêu thi đua cá nhân:", err));
        }
    }, [showDialog, user]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
            setDate(new Date().toLocaleDateString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        otherService.findAllLoaiHopDong()
            .then(res => {
                if (res.status === 'success' && res.data.loaiHopDong) {
                    updateContractTypesCache(res.data.loaiHopDong);
                }
            })
            .catch(err => {
                console.error("Lỗi khởi tạo loại hợp đồng:", err);
            });
    }, []);

    const handleLogout = () => {
        logout();
        setShowDialog(false);
    };

    const userNameDisplay = userProfileData?.fullname || user?.fullname || user?.hoTen || user?.tenNhanVien || user?.username || 'Người Dùng';
    const userRoleDisplay = userProfileData?.positon || user?.positon || user?.chucVu || user?.role || (user?.permission === 1 ? 'Quản lý' : 'Nhân viên');
    const userPhoneDisplay = userProfileData?.soDienThoai || user?.soDienThoai || 'Chưa cập nhật';

    // Kiểm tra quyền Quản trị viên / Quản lý
    const isAdmin = user?.permission === 1 || 
                    userProfileData?.permission === 1 || 
                    user?.positon === "Quản lý" || 
                    userProfileData?.positon === "Quản lý" || 
                    user?.chucVu === "Quản lý" || 
                    user?.role === "ADMIN" || 
                    user?.username === "along";

    return (
        <div className="container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <div className="logo logo-title-group" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', marginBottom: 15 }} onClick={() => navigate('/')}>
                        <img src={logo} alt="Logo" className="logo-login" style={{ maxHeight: 85, maxWidth: '90%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }} />
                        <span className="mobile-only-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                            LONG WEDDING
                        </span>
                    </div>

                    <div className="time-display" style={{ marginTop: 10 }}>
                        <div id="clock">{ctime}</div>
                        <div id="date">
                            <div>{dayNames[new Date().getDay()]} - {cdate}</div>
                            <div style={{ color: '#fbbf24', fontSize: '0.82rem', marginTop: 4, fontWeight: 500 }}>
                                🌙 Âm: {formatLunarDateFull(new Date())}
                            </div>
                        </div>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                    </button>
                </div>

                <div className={`sidebar-nav ${isMenuOpen ? 'open' : ''}`}>
                    <ul>
                        <li>
                            <Link to="/" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-file-contract"></i> Hợp Đồng KH
                            </Link>
                        </li>
                        <li>
                            <Link to="/lichcuahang" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-calendar-days"></i> Lịch Cửa Hàng
                            </Link>
                        </li>
                        <li>
                            <Link to="/lichSoanDo" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-clipboard-list"></i> Lịch Soạn Đồ
                            </Link>
                        </li>
                        <li>
                            <Link to="/thi-dua" onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-trophy"></i> Thi Đua
                            </Link>
                        </li>

                        {/* Chức năng quản trị viên / Quản lý */}
                        {isAdmin && (
                            <>
                                <li>
                                    <Link to="/doanhthu" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-chart-pie"></i> Doanh Thu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/quanlychitieu" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-wallet"></i> Quản Lý Chi Tiêu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/quanlykho" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-boxes-stacked"></i> Quản Lý Kho
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/quanlykhachhang" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-address-book"></i> Khách Hàng
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/quanlywebsite" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-globe"></i> Quản Lý Website
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/quanlynhanvien" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-users-gear"></i> Quản Lý Nhân Viên
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/system-logs" onClick={() => setIsMenuOpen(false)}>
                                        <i className="fa-solid fa-shield-halved"></i> Nhật Ký Hệ Thống
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="user-profile" onClick={() => setShowDialog(true)}>
                    <i className="fa-solid fa-user-circle"></i>
                    <div className="user-info">
                        <div className="user-name">
                            {userNameDisplay}
                        </div>
                        <div className="user-role">
                            {userRoleDisplay}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<HopDongKhachHang />} />
                    <Route path="/lichcuahang" element={<LichCuaHang />} />
                    <Route path="/lichSoanDo" element={<LichSoanDo />} />
                    <Route path="/thi-dua" element={<ThiDua />} />

                    {/* Protected Admin Routes */}
                    <Route path="/doanhthu" element={isAdmin ? <DoanhThu /> : <Navigate to="/" replace />} />
                    <Route path="/quanlychitieu" element={isAdmin ? <QuanLyChiTieu /> : <Navigate to="/" replace />} />
                    <Route path="/quanlykho" element={isAdmin ? <QuanLyKho /> : <Navigate to="/" replace />} />
                    <Route path="/quanlykhachhang" element={isAdmin ? <QuanLyKhachHang /> : <Navigate to="/" replace />} />
                    <Route path="/quanlywebsite" element={isAdmin ? <QuanLyWebsite /> : <Navigate to="/" replace />} />
                    <Route path="/quanlynhanvien" element={isAdmin ? <QuanLyNhanVien /> : <Navigate to="/" replace />} />
                    <Route path="/system-logs" element={isAdmin ? <SystemLogs /> : <Navigate to="/" replace />} />
                </Routes>

                <footer className="main-footer" style={{ textAlign: 'center', paddingTop: 16, marginTop: 16, borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    Design by Mai Tiến Long
                </footer>
            </div>

            {/* Dialog Thông Tin Tài Khoản, Chỉ Tiêu & Thành Tích Cá Nhân */}
            <Dialog
                open={showDialog}
                onClose={() => setShowDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }
                }}
            >
                {/* Header Banner */}
                <Box sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', p: 3, color: '#fff', position: 'relative' }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowDialog(false)}
                        sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', '&:hover': { color: '#fff' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Stack direction="row" spacing={2.5} alignItems="center">
                        <Avatar
                            sx={{
                                width: 68,
                                height: 68,
                                bgcolor: '#0284c7',
                                fontSize: '1.8rem',
                                fontWeight: 800,
                                boxShadow: '0 4px 14px rgba(2,132,199,0.4)',
                                border: '3px solid #38bdf8'
                            }}
                        >
                            {(userNameDisplay || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                                {userNameDisplay}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" mt={0.8}>
                                <Chip
                                    label={userRoleDisplay}
                                    size="small"
                                    sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 700, height: 22, fontSize: '0.75rem' }}
                                />
                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                    @{user?.username || 'user'}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <DialogContent style={{ padding: '24px' }}>
                    <Stack spacing={2.5}>
                        {/* Thông tin tài khoản */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                👤 THÔNG TIN TÀI KHOẢN
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Họ và tên</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{userNameDisplay}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Chức vụ</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0284c7' }}>{userRoleDisplay}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Tên đăng nhập</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{user?.username || '-'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Số điện thoại</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{userPhoneDisplay}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Chỉ tiêu KPI & Tiến độ tháng này */}
                        {(() => {
                            const chiTieuThang = userStats?.chiTieuThang || user?.chiTieuThang || 20;
                            const workCount = userStats?.workCount || 0;
                            const percent = Math.min(100, Math.round((workCount / chiTieuThang) * 100));
                            const exceeded = userStats?.exceededCount || Math.max(0, workCount - chiTieuThang);
                            const hoaHong = userStats?.hoaHong || 0;

                            return (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        🎯 CHỈ TIÊU & TIẾN ĐỘ KPI (THÁNG NÀY)
                                    </Typography>
                                    
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                                            Đã hoàn thành: <strong style={{ color: '#0284c7', fontSize: '1rem' }}>{workCount}</strong> / {chiTieuThang} hợp đồng
                                        </Typography>
                                        <Chip 
                                            label={`${percent}% Target`} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: percent >= 100 ? '#dcfce7' : percent >= 50 ? '#fef3c7' : '#fee2e2', 
                                                color: percent >= 100 ? '#15803d' : percent >= 50 ? '#b45309' : '#b91c1c', 
                                                fontWeight: 800,
                                                fontSize: '0.75rem'
                                            }} 
                                        />
                                    </Box>

                                    <Box sx={{ width: '100%', height: 10, bgcolor: '#e2e8f0', borderRadius: 5, overflow: 'hidden', mb: 2 }}>
                                        <Box
                                            sx={{
                                                width: `${percent}%`,
                                                height: '100%',
                                                borderRadius: 5,
                                                background: percent >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                                                transition: 'width 0.4s ease-in-out'
                                            }}
                                        />
                                    </Box>

                                    <Grid container spacing={1.5}>
                                        <Grid item xs={6}>
                                            <Box sx={{ p: 1.2, bgcolor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block' }}>🔥 Vượt chỉ tiêu</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#15803d' }}>+{exceeded} HĐ</Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ p: 1.2, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600, display: 'block' }}>💰 Hoa hồng tích lũy</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#b45309' }}>{hoaHong.toLocaleString('vi-VN')} đ</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            );
                        })()}

                        {/* Thành tích thi đua */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                🏆 THÀNH TÍCH & DANH HIỆU
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip label="🎖️ Nhân Viên Chính Thức" variant="outlined" color="primary" sx={{ fontWeight: 600, bgcolor: '#fff' }} />
                                <Chip label="⚡ Đạt Chỉ Tiêu KPI" variant="outlined" color="success" sx={{ fontWeight: 600, bgcolor: '#fff' }} />
                                <Chip label="⭐ Thành Viên Năng Nổ" variant="outlined" color="warning" sx={{ fontWeight: 600, bgcolor: '#fff' }} />
                            </Stack>
                        </Paper>
                    </Stack>
                </DialogContent>

                <DialogActions style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => setShowDialog(false)}
                        style={{ borderRadius: 10, color: '#64748b', borderColor: '#cbd5e1', fontWeight: 600 }}
                    >
                        Đóng cửa sổ
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleLogout}
                        style={{ borderRadius: 10, fontWeight: 700, padding: '8px 20px', backgroundColor: '#ef4444' }}
                    >
                        🚪 Đăng xuất
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default MainV2;
