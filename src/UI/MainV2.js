import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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
import CauHinh from "../screens/CauHinh/CauHinh";
import { useAuth } from '../screens/Login/AuthContext/AuthContext';
import otherService from "../API/services/otherService";
import { updateContractTypesCache } from "../utils/contractTypesHelper";
import { formatLunarDateFull } from "../utils/lunarDateUtils";
import { getEmployeeAwards } from "../utils/awardHelper";

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
    Grid,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function MainV2() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDialog, setShowDialog] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sapo_sidebar_collapsed') === 'true';
    });
    const [openSubmenu, setOpenSubmenu] = useState(true);
    const [userStats, setUserStats] = useState(null);
    const [userProfileData, setUserProfileData] = useState(null);
    const { user, logout } = useAuth();

    const [ctime, setTime] = useState(new Date().toLocaleTimeString());
    const [cdate, setDate] = useState(new Date().toLocaleDateString());
    const dayNames = ["Chủ nhật", "Thứ hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    useEffect(() => {
        localStorage.setItem('sapo_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }, [isCollapsed]);

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

    const currentPath = location.pathname;
    const isHopDongActive = currentPath === '/';

    const [openLichSubmenu, setOpenLichSubmenu] = useState(() => {
        return location.pathname === '/lichcuahang' || location.pathname === '/lichSoanDo';
    });

    const isLichActive = currentPath === '/lichcuahang' || currentPath === '/lichSoanDo';

    return (
        <div className={`container ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
            {/* Sidebar Sapo Style */}
            <aside className={`sapo-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMenuOpen ? 'mobile-open' : ''}`}>
                {/* 1. Header: Logo & Collapse Button */}
                <div className="sapo-sidebar-header">
                    <div className="sapo-brand" onClick={() => navigate('/')} title="Trang chủ Long Wedding">
                        <img src={logo} alt="Logo" className="sapo-brand-logo" />
                        {!isCollapsed && (
                            <div className="sapo-brand-text">
                                <span className="sapo-brand-name">LONG WEDDING STUDIO</span>
                            </div>
                        )}
                    </div>

                    <button 
                        className="sapo-collapse-btn" 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
                        aria-label="Toggle Sidebar"
                    >
                        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>

                {/* Mobile Close Bar */}
                <div className="sapo-mobile-header">
                    <span>Menu Quản Trị</span>
                    <button className="sapo-mobile-close-btn" onClick={() => setIsMenuOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* 3. Navigation List */}
                <div className="sapo-sidebar-nav">
                    <ul className="sapo-nav-list">
                        {/* 1. Bán hàng */}
                        <li className="sapo-nav-item">
                            <Link 
                                to="/" 
                                className={`sapo-nav-link ${currentPath === '/' ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                                title="Bán hàng"
                            >
                                <span className="sapo-item-icon"><i className="fa-solid fa-file-invoice-dollar"></i></span>
                                {!isCollapsed && <span className="sapo-item-title">Bán hàng</span>}
                            </Link>
                        </li>

                        {/* 2. Lịch (Dropdown: Lịch cửa hàng, Lịch soạn đồ) */}
                        <li className={`sapo-nav-item has-submenu ${isLichActive || openLichSubmenu ? 'submenu-open' : ''}`}>
                            <div 
                                className={`sapo-nav-link parent-link ${isLichActive ? 'active-parent' : ''}`}
                                onClick={() => setOpenLichSubmenu(!openLichSubmenu)}
                                title="Lịch"
                            >
                                <span className="sapo-item-icon"><i className="fa-solid fa-calendar-days"></i></span>
                                {!isCollapsed && (
                                    <>
                                        <span className="sapo-item-title">Lịch</span>
                                        <span className={`sapo-submenu-arrow ${openLichSubmenu ? 'open' : ''}`}>
                                            <i className="fa-solid fa-chevron-down"></i>
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Submenu Lịch */}
                            {!isCollapsed && openLichSubmenu && (
                                <ul className="sapo-submenu-list">
                                    <li>
                                        <Link 
                                            to="/lichcuahang" 
                                            className={`sapo-sub-link ${currentPath === '/lichcuahang' ? 'active-sub' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Lịch cửa hàng
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/lichSoanDo" 
                                            className={`sapo-sub-link ${currentPath === '/lichSoanDo' ? 'active-sub' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Lịch soạn đồ
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>

                        {/* Quản trị & Quản lý */}
                        {isAdmin && (
                            <>
                                <li className="sapo-section-divider"></li>
                                <li className="sapo-section-header">
                                    {!isCollapsed ? (
                                        <>
                                            <span className="sapo-section-title">QUẢN LÝ & VẬN HÀNH</span>
                                            <i className="fa-regular fa-plus-circle sapo-section-add" title="Chức năng"></i>
                                        </>
                                    ) : (
                                        <div className="sapo-collapsed-divider"></div>
                                    )}
                                </li>

                                {/* 3. Thi đua */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/thi-dua" 
                                        className={`sapo-nav-link ${currentPath === '/thi-dua' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Thi đua"
                                    >
                                        <span className="sapo-item-icon"><i className="fa-solid fa-trophy" style={{ color: '#fbbf24' }}></i></span>
                                        {!isCollapsed && <span className="sapo-item-title">Thi đua</span>}
                                    </Link>
                                </li>

                                {/* 4. Quản lý chi tiêu */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/quanlychitieu" 
                                        className={`sapo-nav-link ${currentPath === '/quanlychitieu' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Quản lý chi tiêu"
                                    >
                                        <span className="sapo-item-icon"><i className="fa-solid fa-wallet" style={{ color: '#f87171' }}></i></span>
                                        {!isCollapsed && <span className="sapo-item-title">Quản lý chi tiêu</span>}
                                    </Link>
                                </li>

                                {/* 5. Doanh thu */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/doanhthu" 
                                        className={`sapo-nav-link ${currentPath === '/doanhthu' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Doanh thu"
                                    >
                                        <span className="sapo-item-icon"><i className="fa-solid fa-chart-pie" style={{ color: '#38bdf8' }}></i></span>
                                        {!isCollapsed && <span className="sapo-item-title">Doanh thu</span>}
                                    </Link>
                                </li>

                                {/* 6. Quản lý kho */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/quanlykho" 
                                        className={`sapo-nav-link ${currentPath === '/quanlykho' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Quản lý kho"
                                    >
                                        <span className="sapo-item-icon"><i className="fa-solid fa-boxes-stacked" style={{ color: '#fb923c' }}></i></span>
                                        {!isCollapsed && <span className="sapo-item-title">Quản lý kho</span>}
                                    </Link>
                                </li>

                                {/* 7. Quản lý khách hàng */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/quanlykhachhang" 
                                        className={`sapo-nav-link ${currentPath === '/quanlykhachhang' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Quản lý khách hàng"
                                    >
                                        <span className="sapo-item-icon"><i className="fa-solid fa-address-book" style={{ color: '#a855f7' }}></i></span>
                                        {!isCollapsed && <span className="sapo-item-title">Quản lý khách hàng</span>}
                                    </Link>
                                </li>

                                {/* 8. Quản lý nhân viên */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/quanlynhanvien" 
                                        className={`sapo-nav-link ${currentPath === '/quanlynhanvien' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Quản lý nhân viên"
                                    >
                                        <span className="sapo-item-icon sapo-app-badge-blue">
                                            <i className="fa-solid fa-users-gear"></i>
                                        </span>
                                        {!isCollapsed && <span className="sapo-item-title">Quản lý nhân viên</span>}
                                    </Link>
                                </li>

                                {/* 9. Quản lý website */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/quanlywebsite" 
                                        className={`sapo-nav-link ${currentPath === '/quanlywebsite' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Quản lý website"
                                    >
                                        <span className="sapo-item-icon sapo-app-badge-green">
                                            <i className="fa-solid fa-globe"></i>
                                        </span>
                                        {!isCollapsed && (
                                            <>
                                                <span className="sapo-item-title">Quản lý website</span>
                                                <i className="fa-regular fa-eye sapo-sub-action-icon" title="Xem website"></i>
                                            </>
                                        )}
                                    </Link>
                                </li>

                                {/* 10. Nhật ký hệ thống */}
                                <li className="sapo-nav-item">
                                    <Link 
                                        to="/system-logs" 
                                        className={`sapo-nav-link ${currentPath === '/system-logs' ? 'active' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        title="Nhật ký hệ thống"
                                    >
                                        <span className="sapo-item-icon"><i className="fa-solid fa-shield-halved" style={{ color: '#ec4899' }}></i></span>
                                        {!isCollapsed && <span className="sapo-item-title">Nhật ký hệ thống</span>}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                {/* 4. Bottom Footer: Cấu hình & User Profile */}
                <div className="sapo-sidebar-footer">
                    {/* Time & Lunar Date (compact) */}
                    {!isCollapsed && (
                        <div className="sapo-time-card">
                            <div className="sapo-time-clock">{ctime}</div>
                            <div className="sapo-time-date">{dayNames[new Date().getDay()]} - {cdate}</div>
                            <div className="sapo-time-lunar">🌙 Âm: {formatLunarDateFull(new Date())}</div>
                        </div>
                    )}

                    {/* Cấu hình link */}
                    <Link 
                        to="/cauhinh" 
                        className={`sapo-nav-link sapo-settings-btn ${currentPath === '/cauhinh' ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                        title="Cấu hình & Mẫu in"
                    >
                        <span className="sapo-item-icon"><i className="fa-solid fa-gear"></i></span>
                        {!isCollapsed && <span className="sapo-item-title">Cấu hình</span>}
                    </Link>

                    {/* User profile card */}
                    <div 
                        className="sapo-user-card" 
                        onClick={() => setShowDialog(true)}
                        title="Xem tài khoản & chỉ tiêu cá nhân"
                    >
                        <div className="sapo-user-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                (userNameDisplay || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="sapo-user-meta">
                                <div className="sapo-user-name">{userNameDisplay}</div>
                                <div className="sapo-user-role">{userRoleDisplay}</div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {isMenuOpen && (
                <div className="sapo-mobile-backdrop" onClick={() => setIsMenuOpen(false)}></div>
            )}

            {/* Main Content */}
            <div className="main-content">
                {/* Mobile Top Navbar with Hamburger */}
                <div className="sapo-mobile-topbar">
                    <button className="sapo-mobile-menu-btn" onClick={() => setIsMenuOpen(true)}>
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <div className="sapo-mobile-brand-title">
                        <img src={logo} alt="Logo" style={{ height: 28, marginRight: 8 }} />
                        <span>LONG WEDDING</span>
                    </div>
                    <div className="sapo-mobile-user-avatar" onClick={() => setShowDialog(true)}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            (userNameDisplay || 'U').charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                <Routes>
                    <Route path="/" element={<HopDongKhachHang />} />
                    <Route path="/lichcuahang" element={<LichCuaHang />} />
                    <Route path="/lichSoanDo" element={<LichSoanDo />} />
                    <Route path="/cauhinh" element={<CauHinh />} />

                    {/* Protected Admin Routes */}
                    <Route path="/thi-dua" element={isAdmin ? <ThiDua /> : <Navigate to="/" replace />} />
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
                            src={user?.avatar || ''}
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
                            const chiTieuThang = userStats?.chiTieuThang || user?.chiTieuThang || userStats?.target || 20;
                            const workCount = userStats?.countWork ?? userStats?.workCount ?? 0;
                            const percent = userStats?.completionPercent ?? (chiTieuThang > 0 ? Math.round((workCount / chiTieuThang) * 100) : 0);
                            const exceeded = userStats?.percentExceeded ?? (userStats?.isExceeded ? Math.max(0, percent - 100) : 0);
                            const hoaHong = userStats?.totalRewardEst ?? userStats?.hoaHongEst ?? userStats?.hoaHong ?? 0;
                            const rank = userStats?.rank || null;
                            const medal = userStats?.medal || (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);
                            const honorTitle = userStats?.honorTitle || (percent >= 100 ? 'Ngôi Sao Đạt Chuẩn' : 'Đang Nỗ Lực');

                            return (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            🎯 CHỈ TIÊU & TIẾN ĐỘ KPI (THÁNG NÀY)
                                        </Typography>
                                        {rank && (
                                            <Chip 
                                                label={`${medal || '#'} Hạng ${rank}`} 
                                                size="small" 
                                                sx={{ bgcolor: rank === 1 ? '#fef3c7' : rank === 2 ? '#f1f5f9' : '#fef9c3', color: rank === 1 ? '#d97706' : '#334155', fontWeight: 800 }} 
                                            />
                                        )}
                                    </Box>
                                    
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
                                                width: `${Math.min(100, percent)}%`,
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
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                    {userStats?.isExceeded ? `+${exceeded}%` : `${Math.max(0, workCount - chiTieuThang)} HĐ`}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Box sx={{ p: 1.2, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600, display: 'block' }}>💰 Hoa hồng & Thưởng</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#b45309' }}>{hoaHong.toLocaleString('vi-VN')} đ</Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            );
                        })()}

                        {/* Thành tích & Danh hiệu được Admin trao tặng */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                🏆 THÀNH TÍCH & DANH HIỆU
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                {getEmployeeAwards(user?.username, user).map((badge, idx) => (
                                    <Chip 
                                        key={idx} 
                                        label={badge} 
                                        sx={{ 
                                            fontWeight: 700, 
                                            bgcolor: '#fffbeb', 
                                            color: '#b45309', 
                                            border: '1px solid #fde68a' 
                                        }} 
                                    />
                                ))}
                                {userStats?.completionPercent >= 100 && (
                                    <Chip label="⭐ Đạt Chỉ Tiêu KPI" variant="outlined" color="success" sx={{ fontWeight: 700, bgcolor: '#fff' }} />
                                )}
                                {userStats?.isExceeded && (
                                    <Chip label="🔥 Chiến Binh Bứt Phá" variant="outlined" color="error" sx={{ fontWeight: 700, bgcolor: '#fff' }} />
                                )}
                                {userStats?.rank === 1 && (
                                    <Chip label="👑 Quán Quân Tháng" variant="outlined" sx={{ fontWeight: 800, bgcolor: '#fef3c7', color: '#d97706', borderColor: '#fbbf24' }} />
                                )}
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
