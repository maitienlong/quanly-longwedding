import { hasPermission, getFirstAllowedPath } from "../utils/permissionHelper";
import AccessDenied from "../components/AccessDenied";
import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { useNavigate, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import logo from '../assets/logo/logo-vang.png';
import './css/mainv2.css';
import TongQuan from "../screens/TongQuan/TongQuan";
import { useAuth } from '../screens/Login/AuthContext/AuthContext';
import otherService from "../API/services/otherService";
import { updateContractTypesCache, getDichVuChinhLabel } from "../utils/contractTypesHelper";
import {
    formatMoney,
    formatShortMoney,
    isContractAssignedToUser,
    calculateUserSalaryBreakdown
} from "../utils/salaryHelper";
import { updateServiceTypesCache } from "../utils/serviceTypesHelper";
import { formatLunarDateFull } from "../utils/lunarDateUtils";
import { getEmployeeAwards } from "../utils/awardHelper";
import LockScreen from "../components/LockScreen/LockScreen";
import { toast } from "sonner";
import { getSavedPinUser } from "../utils/pinAuthUtils";
import SystemClockCalendarModal from "../components/SystemClockCalendarModal";
import CommandPaletteModal from "../components/CommandPalette/CommandPaletteModal";
import './css/luxury-theme.css';

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
    Tooltip,
    Tabs,
    Tab,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Code Splitting (Lazy Loading) cho các màn hình quản trị giúp tăng tốc độ khởi động ứng dụng
const HopDongKhachHang = lazy(() => import('../screens/HopDong/HopDongKhachHang'));
const LichCuaHang = lazy(() => import("../screens/LichCuaHang/LichCuaHang"));
const QuanLyChiTieu = lazy(() => import("../screens/QuanLyChiTieu/QuanLyChiTieu"));
const LichSoanDo = lazy(() => import("../screens/LichSoanDo/LichSoanDo"));
const DoanhThu = lazy(() => import("../screens/DoanhThu/DoanhThu"));
const QuanLyKho = lazy(() => import("../screens/QuanLyKho/QuanLyKho"));
const QuanLyTrangPhuc = lazy(() => import("../screens/QuanLyKho/QuanLyTrangPhuc"));
const QuanLyLead = lazy(() => import("../screens/QuanLyKhachHang/QuanLyLead"));
const QuanLyNhanVien = lazy(() => import("../screens/QuanLyNhanVien/QuanLyNhanVien"));
const QuanLyKhachHang = lazy(() => import("../screens/QuanLyKhachHang/QuanLyKhachHang"));
const QuanLyWebsite = lazy(() => import("../screens/QuanLyWebsite/QuanLyWebsite"));
const QuanLyThiepMoi = lazy(() => import("../screens/QuanLyThiepMoi/QuanLyThiepMoi"));
const QuanLyVoucher = lazy(() => import("../screens/QuanLyVoucher/QuanLyVoucher"));
const SystemLogs = lazy(() => import("../screens/SystemLogs/SystemLogs"));
const ThiDua = lazy(() => import("../screens/ThiDua/ThiDua"));
const CauHinh = lazy(() => import("../screens/CauHinh/CauHinh"));

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
    const [profileTab, setProfileTab] = useState(0);
    const [myMonthContracts, setMyMonthContracts] = useState([]);
    const [isLoadingSalaryData, setIsLoadingSalaryData] = useState(false);
    const { user, logout } = useAuth();

    const [ctime, setTime] = useState(new Date().toLocaleTimeString());
    const [cdate, setDate] = useState(new Date().toLocaleDateString());
    const dayNames = ["Chủ nhật", "Thứ hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    // Trạng thái mở Dialog Tiện ích Lịch, Ngày đẹp & Giờ Server
    const [openClockModal, setOpenClockModal] = useState(false);
    const [clockModalTab, setClockModalTab] = useState(0);

    // Trạng thái Khóa màn hình PIN
    const [isScreenLocked, setIsScreenLocked] = useState(() => {
        return localStorage.getItem('lw_screen_is_locked') === 'true';
    });

    // Trạng thái Command Palette (Ctrl + K)
    const [openCommandPalette, setOpenCommandPalette] = useState(false);

    // Trạng thái Chuông thông báo nhắc việc tự động (Reminders)
    const [openRemindersDialog, setOpenRemindersDialog] = useState(false);
    const [remindersData, setRemindersData] = useState({
        totalCount: 0,
        upcomingShoots: [],
        upcomingMakeups: [],
        upcomingDressPickups: [],
        overdueDressReturns: [],
        overduePostProductions: [],
        customerApprovedAlbums: []
    });

    const fetchReminders = () => {
        otherService.getReminders()
            .then(res => {
                const d = res?.data || res;
                if (d) {
                    const count =
                        (d.upcomingShoots?.length || 0) +
                        (d.upcomingMakeups?.length || 0) +
                        (d.upcomingDressPickups?.length || 0) +
                        (d.overdueDressReturns?.length || 0) +
                        (d.overduePostProductions?.length || 0) +
                        (d.customerApprovedAlbums?.length || 0);
                    setRemindersData({
                        totalCount: d.totalCount ?? count,
                        upcomingShoots: d.upcomingShoots || [],
                        upcomingMakeups: d.upcomingMakeups || [],
                        upcomingDressPickups: d.upcomingDressPickups || [],
                        overdueDressReturns: d.overdueDressReturns || [],
                        overduePostProductions: d.overduePostProductions || [],
                        customerApprovedAlbums: d.customerApprovedAlbums || []
                    });
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        if (user) {
            fetchReminders();
            const timer = setInterval(fetchReminders, 120000); // Làm mới mỗi 2 phút
            return () => clearInterval(timer);
        }
    }, [user]);

    // Lắng nghe phím tắt toàn cục Ctrl + K hoặc Cmd + K
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpenCommandPalette(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const handleTriggerLock = () => {
        const savedPin = getSavedPinUser();
        if (!savedPin) {
            toast.warning("Thiết bị này chưa cài đặt mã PIN. Vui lòng vào mục Cấu hình để cài mã PIN trước!");
            navigate('/cauhinh');
            return;
        }
        setIsMenuOpen(false);
        setIsScreenLocked(true);
        localStorage.setItem('lw_screen_is_locked', 'true');
    };

    const handleUnlock = () => {
        setIsScreenLocked(false);
        localStorage.removeItem('lw_screen_is_locked');
    };

    // Tự động khóa màn hình theo thời gian cài đặt trong Cấu hình khi không có thao tác
    useEffect(() => {
        let lastActivity = Date.now();

        const onUserActivity = () => {
            lastActivity = Date.now();
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
        events.forEach(evt => window.addEventListener(evt, onUserActivity, { passive: true }));

        const checkTimer = setInterval(() => {
            const timeoutMin = parseInt(localStorage.getItem('lw_autolock_timeout') || '0', 10);
            if (timeoutMin <= 0) return; // 0 = Tắt tự động khóa

            // Nếu màn hình đã khóa rồi thì không cần xử lý
            const isCurrentlyLocked = localStorage.getItem('lw_screen_is_locked') === 'true';
            if (isCurrentlyLocked) return;

            const idleDurationMs = Date.now() - lastActivity;
            if (idleDurationMs >= timeoutMin * 60 * 1000) {
                const savedPin = getSavedPinUser();
                if (savedPin) {
                    setIsScreenLocked(true);
                    localStorage.setItem('lw_screen_is_locked', 'true');
                }
            }
        }, 5000);

        return () => {
            events.forEach(evt => window.removeEventListener(evt, onUserActivity));
            clearInterval(checkTimer);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('sapo_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }, [isCollapsed]);

    useEffect(() => {
        if (user) {
            // Lấy thông tin user đầy đủ từ DB ngay khi vào ứng dụng
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
        }
    }, [user]);

    useEffect(() => {
        if (showDialog && user) {
            setIsLoadingSalaryData(true);
            // 1. Lấy chỉ tiêu thi đua & KPI tháng
            const p1 = otherService.getThiDuaStats({ timeRange: 'month' })
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

            // 2. Lấy danh sách hợp đồng tháng này để tính toán chi tiết hợp đồng và hoa hồng
            const p2 = otherService.LIST_HOPDONG({ filter: 'tháng này' })
                .then(res => {
                    const list = res.data?.hopDong || [];
                    if (Array.isArray(list)) {
                        const targetUser = userProfileData || user;
                        const matched = list.filter(hd => isContractAssignedToUser(hd, targetUser));
                        setMyMonthContracts(matched);
                    }
                })
                .catch(err => {
                    console.error("Lỗi lấy hợp đồng tháng:", err);
                    return otherService.LIST_HOPDONG({})
                        .then(res => {
                            const list = res.data?.hopDong || [];
                            const targetUser = userProfileData || user;
                            const matched = list.filter(hd => isContractAssignedToUser(hd, targetUser));
                            setMyMonthContracts(matched);
                        })
                        .catch(() => {});
                });

            Promise.allSettled([p1, p2]).finally(() => {
                setIsLoadingSalaryData(false);
            });
        }
    }, [showDialog, user, userProfileData]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
            setDate(new Date().toLocaleDateString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        otherService.findAllLoaiDichVu()
            .then(res => {
                if (res.status === 'success' && res.data?.loaiDichVu) {
                    updateServiceTypesCache(res.data.loaiDichVu);
                }
            })
            .catch(err => console.error("Lỗi khởi tạo loại dịch vụ:", err));

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

    const userNameDisplay = userProfileData?.fullname || 
        user?.fullname || 
        user?.hoTen || 
        user?.tenNhanVien || 
        (user?.username === 'along' ? 'Mai Tiến Long' : user?.username) || 
        'Người Dùng';

    const userRoleDisplay = userProfileData?.positon || 
        user?.positon || 
        user?.chucVu || 
        (user?.permission === 1 || user?.username === 'along' || userProfileData?.permission === 1 ? 'Quản lý' : (user?.role || 'Nhân viên'));
    const userPhoneDisplay = userProfileData?.soDienThoai || user?.soDienThoai || 'Chưa cập nhật';

    const salaryBreakdown = useMemo(() => {
        return calculateUserSalaryBreakdown(userProfileData || user, userStats, myMonthContracts);
    }, [userProfileData, user, userStats, myMonthContracts]);

    const effectiveUser = {
        ...(user || {}),
        ...(userProfileData || {})
    };

    // Kiểm tra quyền Quản trị viên / Quản lý
    const isAdmin = effectiveUser?.permission === 1 || 
                    effectiveUser?.positon === "Quản lý" || 
                    effectiveUser?.positon === "Admin" || 
                    effectiveUser?.positon === "Quản trị viên" || 
                    effectiveUser?.chucVu === "Quản lý" || 
                    effectiveUser?.role === "ADMIN" || 
                    effectiveUser?.username === "along" ||
                    (Array.isArray(effectiveUser?.permissions) && (effectiveUser?.permissions.includes('*') || effectiveUser?.permissions.includes('all')));

    const hasManagementPermissions = isAdmin || 
        hasPermission(effectiveUser, 'thi-dua') ||
        hasPermission(effectiveUser, 'quanlychitieu') ||
        hasPermission(effectiveUser, 'doanhthu') ||
        hasPermission(effectiveUser, 'quanlykho') ||
        hasPermission(effectiveUser, 'quanlytrangphuc') ||
        hasPermission(effectiveUser, 'quanlykhachhang') ||
        hasPermission(effectiveUser, 'leads') ||
        hasPermission(effectiveUser, 'quanlynhanvien') ||
        hasPermission(effectiveUser, 'quanlywebsite') ||
        hasPermission(effectiveUser, 'quanlyvoucher') ||
        hasPermission(effectiveUser, 'system-logs');

    const renderProtected = (permKey, featureName, featureIcon, Component) => {
        return hasPermission(effectiveUser, permKey) ? (
            <Component />
        ) : (
            <AccessDenied 
                featureName={featureName} 
                featureIcon={featureIcon} 
                permissionKey={permKey}
                currentUser={effectiveUser} 
            />
        );
    };

    const currentPath = location.pathname;
    const isTongQuanActive = currentPath === '/tongquan' || currentPath === '/tong-quan' || currentPath === '/';
    const isHopDongActive = currentPath === '/banhang' || currentPath === '/hopdong' || currentPath === '/ban-hang';
    const isLichCuaHangActive = currentPath === '/lichcuahang';
    const isLichSoanDoActive = currentPath === '/lichSoanDo' || currentPath === '/lichsoando';

    return (
        <div className={`container ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
            {/* Sidebar Sapo Style */}
            <aside className={`sapo-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMenuOpen ? 'mobile-open' : ''}`}>
                {/* 1. Header: Logo & Collapse Button */}
                <div className="sapo-sidebar-header">
                    <div className="sapo-brand" onClick={() => navigate('/tongquan')} title="Trang chủ Long Wedding">
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

                {/* 2.5 Quick Search Button (Command Palette Ctrl+K) */}
                {!isCollapsed ? (
                    <div 
                        className="sapo-quick-search-btn" 
                        onClick={() => setOpenCommandPalette(true)}
                        title="Tìm kiếm toàn hệ thống (Ctrl + K)"
                    >
                        <span className="sapo-quick-search-text">
                            <i className="fa-solid fa-magnifying-glass" style={{ color: '#eab308' }}></i>
                            <span>Tìm nhanh...</span>
                        </span>
                        <span className="sapo-quick-search-kbd">Ctrl K</span>
                    </div>
                ) : (
                    <div 
                        className="sapo-quick-search-btn-collapsed" 
                        onClick={() => setOpenCommandPalette(true)}
                        title="Tìm nhanh (Ctrl + K)"
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                )}

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
                        {/* 0. Tổng quan */}
                        {hasPermission(effectiveUser, 'tongquan') && (
                            <li className="sapo-nav-item">
                                <Link 
                                    to="/tongquan" 
                                    className={`sapo-nav-link ${isTongQuanActive ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    title="Tổng quan"
                                >
                                    <span className="sapo-item-icon"><i className="fa-solid fa-chart-pie" style={{ color: '#38bdf8' }}></i></span>
                                    {!isCollapsed && <span className="sapo-item-title">Tổng quan</span>}
                                </Link>
                            </li>
                        )}

                        {/* 1. Bán hàng */}
                        {hasPermission(effectiveUser, 'banhang') && (
                            <li className="sapo-nav-item">
                                <Link 
                                    to="/banhang" 
                                    className={`sapo-nav-link ${isHopDongActive ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    title="Bán hàng"
                                >
                                    <span className="sapo-item-icon"><i className="fa-solid fa-file-invoice-dollar"></i></span>
                                    {!isCollapsed && <span className="sapo-item-title">Bán hàng</span>}
                                </Link>
                            </li>
                        )}

                        {/* 2. Lịch cửa hàng */}
                        {hasPermission(effectiveUser, 'lichcuahang') && (
                            <li className="sapo-nav-item">
                                <Link 
                                    to="/lichcuahang" 
                                    className={`sapo-nav-link ${isLichCuaHangActive ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    title="Lịch cửa hàng"
                                >
                                    <span className="sapo-item-icon"><i className="fa-solid fa-calendar-check" style={{ color: '#0ea5e9' }}></i></span>
                                    {!isCollapsed && <span className="sapo-item-title">Lịch cửa hàng</span>}
                                </Link>
                            </li>
                        )}

                        {/* 3. Lịch soạn đồ */}
                        {hasPermission(effectiveUser, 'lichSoanDo') && (
                            <li className="sapo-nav-item">
                                <Link 
                                    to="/lichSoanDo" 
                                    className={`sapo-nav-link ${isLichSoanDoActive ? 'active' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    title="Lịch soạn đồ"
                                >
                                    <span className="sapo-item-icon"><i className="fa-solid fa-shirt" style={{ color: '#ec4899' }}></i></span>
                                    {!isCollapsed && <span className="sapo-item-title">Lịch soạn đồ</span>}
                                </Link>
                            </li>
                        )}

                        {/* Quản trị & Quản lý (Hiển thị linh hoạt theo từng quyền chức năng) */}
                        {hasManagementPermissions && (
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

                                {/* 3. Thi đua / KPI */}
                                {hasPermission(effectiveUser, 'thi-dua') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/thi-dua" 
                                            className={`sapo-nav-link ${currentPath === '/thi-dua' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="Thi đua & KPI"
                                        >
                                            <span className="sapo-item-icon"><i className="fa-solid fa-trophy" style={{ color: '#fbbf24' }}></i></span>
                                            {!isCollapsed && <span className="sapo-item-title">Thi đua</span>}
                                        </Link>
                                    </li>
                                )}

                                {/* 4. Quản lý chi tiêu */}
                                {hasPermission(effectiveUser, 'quanlychitieu') && (
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
                                )}

                                {/* 5. Doanh thu */}
                                {hasPermission(effectiveUser, 'doanhthu') && (
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
                                )}

                                {/* 6. Quản lý kho */}
                                {hasPermission(effectiveUser, 'quanlykho') && (
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
                                )}

                                {/* 6b. Quản lý trang phục & Lịch giữ váy */}
                                {hasPermission(effectiveUser, 'quanlytrangphuc') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/quanlytrangphuc" 
                                            className={`sapo-nav-link ${currentPath === '/quanlytrangphuc' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="Quản lý trang phục & Lịch giữ váy"
                                        >
                                            <span className="sapo-item-icon"><i className="fa-solid fa-vest" style={{ color: '#ec4899' }}></i></span>
                                            {!isCollapsed && <span className="sapo-item-title">Kho Váy & Vest</span>}
                                        </Link>
                                    </li>
                                )}

                                {/* 7. CRM (Quản lý khách hàng) */}
                                {hasPermission(effectiveUser, 'quanlykhachhang') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/quanlykhachhang" 
                                            className={`sapo-nav-link ${currentPath === '/quanlykhachhang' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="CRM - Customer Management"
                                        >
                                            <span className="sapo-item-icon"><i className="fa-solid fa-address-book" style={{ color: '#a855f7' }}></i></span>
                                            {!isCollapsed && <span className="sapo-item-title">CRM</span>}
                                        </Link>
                                    </li>
                                )}

                                {/* 7b. Quản lý Leads (n8n/Messenger) */}
                                {hasPermission(effectiveUser, 'leads') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/leads" 
                                            className={`sapo-nav-link ${currentPath === '/leads' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="Quản lý Lead Tư Vấn"
                                        >
                                            <span className="sapo-item-icon"><i className="fa-solid fa-comments" style={{ color: '#06b6d4' }}></i></span>
                                            {!isCollapsed && <span className="sapo-item-title">Lead Tư Vấn</span>}
                                        </Link>
                                    </li>
                                )}

                                {/* 8. HRM & Staff */}
                                {hasPermission(effectiveUser, 'quanlynhanvien') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/quanlynhanvien" 
                                            className={`sapo-nav-link ${currentPath === '/quanlynhanvien' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="HRM & Staff Management"
                                        >
                                            <span className="sapo-item-icon sapo-app-badge-blue">
                                                <i className="fa-solid fa-users-gear"></i>
                                            </span>
                                            {!isCollapsed && <span className="sapo-item-title">HRM & Staff</span>}
                                        </Link>
                                    </li>
                                )}

                                {/* 9. Quản lý Website */}
                                {hasPermission(effectiveUser, 'quanlywebsite') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/quanlywebsite" 
                                            className={`sapo-nav-link ${currentPath === '/quanlywebsite' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="Quản lý Website"
                                        >
                                            <span className="sapo-item-icon sapo-app-badge-green">
                                                <i className="fa-solid fa-globe"></i>
                                            </span>
                                            {!isCollapsed && (
                                                <>
                                                    <span className="sapo-item-title">Quản lý Website</span>
                                                    <i className="fa-regular fa-eye sapo-sub-action-icon" title="Xem Website"></i>
                                                </>
                                            )}
                                        </Link>
                                    </li>
                                )}

                                {/* 10. Quản lý Voucher */}
                                {hasPermission(effectiveUser, 'quanlyvoucher') && (
                                    <li className="sapo-nav-item">
                                        <Link 
                                            to="/quanlyvoucher" 
                                            className={`sapo-nav-link ${currentPath === '/quanlyvoucher' ? 'active' : ''}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            title="Quản lý Voucher"
                                        >
                                            <span className="sapo-item-icon" style={{ color: '#f59e0b' }}>
                                                <i className="fa-solid fa-ticket"></i>
                                            </span>
                                            {!isCollapsed && <span className="sapo-item-title">Quản lý Voucher</span>}
                                        </Link>
                                    </li>
                                )}

                                {/* 11. Nhật ký hệ thống */}
                                {hasPermission(effectiveUser, 'system-logs') && (
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
                                )}
                            </>
                        )}
                    </ul>
                </div>

                {/* 4. Bottom Footer: Cấu hình & User Profile */}
                <div className="sapo-sidebar-footer">
                    {/* Time & Lunar Date (compact & interactive) */}
                    {!isCollapsed ? (
                        <div 
                            className="sapo-time-card interactive"
                            onClick={() => {
                                setClockModalTab(0);
                                setOpenClockModal(true);
                            }}
                            title="Bấm để xem Ngày đẹp, Lịch âm & Giờ Server"
                        >
                            <div className="sapo-time-clock">
                                <i className="fa-regular fa-clock" style={{ marginRight: 6, fontSize: '0.9rem', color: '#38bdf8' }}></i>
                                {ctime}
                            </div>
                            <div className="sapo-time-date">{dayNames[new Date().getDay()]} - {cdate}</div>
                            <div className="sapo-time-lunar">🌙 Âm: {formatLunarDateFull(new Date())}</div>
                            <div className="sapo-time-hint">
                                <i className="fa-solid fa-sparkles" style={{ marginRight: 4 }}></i>
                                Ngày đẹp • Lịch âm • Giờ Server
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="sapo-nav-link sapo-footer-clock-btn"
                            onClick={() => {
                                setClockModalTab(0);
                                setOpenClockModal(true);
                            }}
                            title="Ngày đẹp, Lịch âm & Giờ Server"
                            style={{ cursor: 'pointer', marginBottom: 4 }}
                        >
                            <span className="sapo-item-icon"><i className="fa-solid fa-clock" style={{ color: '#38bdf8' }}></i></span>
                        </div>
                    )}

                    {/* Chuông thông báo nhắc việc tự động */}
                    <div 
                        className="sapo-nav-link sapo-footer-bell-btn"
                        onClick={() => {
                            fetchReminders();
                            setOpenRemindersDialog(true);
                        }}
                        title="Thông báo & Nhắc việc tự động"
                        style={{ cursor: 'pointer', marginBottom: 4, position: 'relative' }}
                    >
                        <span className="sapo-item-icon" style={{ position: 'relative' }}>
                            <i className="fa-solid fa-bell" style={{ color: remindersData.totalCount > 0 ? '#ef4444' : '#38bdf8' }}></i>
                            {remindersData.totalCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -8,
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    borderRadius: '10px',
                                    padding: '1px 5px',
                                    lineHeight: 1.2
                                }}>
                                    {remindersData.totalCount > 99 ? '99+' : remindersData.totalCount}
                                </span>
                            )}
                        </span>
                        {!isCollapsed && (
                            <span className="sapo-item-title" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span>Nhắc việc</span>
                                {remindersData.totalCount > 0 && (
                                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '1px 7px', borderRadius: 10 }}>
                                        {remindersData.totalCount}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>

                    {/* Nút Khóa màn hình nhanh */}
                    <div 
                        className="sapo-nav-link sapo-footer-lock-btn"
                        onClick={handleTriggerLock}
                        title="Khóa màn hình (Mã PIN)"
                        style={{ cursor: 'pointer', marginBottom: 4 }}
                    >
                        <span className="sapo-item-icon"><i className="fa-solid fa-lock" style={{ color: '#f59e0b' }}></i></span>
                        {!isCollapsed && <span className="sapo-item-title">Khóa màn hình</span>}
                    </div>

                    {/* Cấu hình link */}
                    {hasPermission(effectiveUser, 'cauhinh') && (
                        <Link 
                            to="/cauhinh" 
                            className={`sapo-nav-link sapo-settings-btn ${currentPath === '/cauhinh' ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                            title="Cấu hình hệ thống & Mẫu in"
                        >
                            <span className="sapo-item-icon"><i className="fa-solid fa-gear"></i></span>
                            {!isCollapsed && <span className="sapo-item-title">Cấu hình</span>}
                        </Link>
                    )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button 
                            className="sapo-mobile-search-btn" 
                            onClick={() => setOpenCommandPalette(true)}
                            title="Tìm nhanh (Ctrl + K)"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>Tìm</span>
                        </button>
                        <button 
                            className="sapo-mobile-bell-btn" 
                            onClick={() => {
                                fetchReminders();
                                setOpenRemindersDialog(true);
                            }}
                            title="Thông báo nhắc việc"
                            style={{
                                background: remindersData.totalCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                border: remindersData.totalCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
                                color: remindersData.totalCount > 0 ? '#ef4444' : '#38bdf8',
                                borderRadius: '8px',
                                padding: '5px 9px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                            }}
                        >
                            <i className="fa-solid fa-bell"></i>
                            {remindersData.totalCount > 0 && (
                                <span style={{ fontSize: '11px', fontWeight: 800 }}>{remindersData.totalCount}</span>
                            )}
                        </button>
                        <button 
                            className="sapo-mobile-clock-btn" 
                            onClick={() => {
                                setClockModalTab(0);
                                setOpenClockModal(true);
                            }}
                            title="Ngày đẹp, Lịch âm & Giờ Server"
                            style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                borderRadius: '8px',
                                padding: '5px 9px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                            }}
                        >
                            <i className="fa-regular fa-clock"></i>
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>{ctime.slice(0, 5)}</span>
                        </button>
                        <button 
                            className="sapo-mobile-lock-btn" 
                            onClick={handleTriggerLock}
                            title="Khóa màn hình (Mã PIN)"
                            style={{
                                background: 'rgba(245, 158, 11, 0.15)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: '#f59e0b',
                                borderRadius: '8px',
                                padding: '5px 9px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                            }}
                        >
                            <i className="fa-solid fa-lock"></i>
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>Khóa</span>
                        </button>
                        <div className="sapo-mobile-user-avatar" onClick={() => setShowDialog(true)}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                (userNameDisplay || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </div>

                <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Đang tải phân hệ...</div>}>
                <Routes>
                    <Route path="/" element={<Navigate to={getFirstAllowedPath(effectiveUser)} replace />} />
                    <Route path="/tongquan" element={renderProtected('tongquan', 'Tổng quan hệ thống', 'fa-solid fa-chart-pie', TongQuan)} />
                    <Route path="/tong-quan" element={renderProtected('tongquan', 'Tổng quan hệ thống', 'fa-solid fa-chart-pie', TongQuan)} />
                    <Route path="/banhang" element={renderProtected('banhang', 'Bán hàng & Hợp đồng', 'fa-solid fa-file-invoice-dollar', HopDongKhachHang)} />
                    <Route path="/hopdong" element={renderProtected('banhang', 'Bán hàng & Hợp đồng', 'fa-solid fa-file-invoice-dollar', HopDongKhachHang)} />
                    <Route path="/ban-hang" element={renderProtected('banhang', 'Bán hàng & Hợp đồng', 'fa-solid fa-file-invoice-dollar', HopDongKhachHang)} />
                    <Route path="/lichcuahang" element={renderProtected('lichcuahang', 'Lịch Cửa Hàng', 'fa-solid fa-calendar-check', LichCuaHang)} />
                    <Route path="/lichSoanDo" element={renderProtected('lichSoanDo', 'Lịch Soạn Đồ', 'fa-solid fa-shirt', LichSoanDo)} />

                    {/* Dynamic Permission Protected Routes */}
                    <Route path="/thi-dua" element={renderProtected('thi-dua', 'Thi đua & Vinh danh', 'fa-solid fa-trophy', ThiDua)} />
                    <Route path="/doanhthu" element={renderProtected('doanhthu', 'Báo cáo Doanh thu', 'fa-solid fa-chart-pie', DoanhThu)} />
                    <Route path="/quanlychitieu" element={renderProtected('quanlychitieu', 'Quản lý Chi tiêu', 'fa-solid fa-wallet', QuanLyChiTieu)} />
                    <Route path="/quanlykho" element={renderProtected('quanlykho', 'Bảng giá & Dịch vụ', 'fa-solid fa-boxes-stacked', QuanLyKho)} />
                    <Route path="/quanlytrangphuc" element={renderProtected('quanlytrangphuc', 'Kho Váy & Vest', 'fa-solid fa-vest', QuanLyTrangPhuc)} />
                    <Route path="/quanlykhachhang" element={renderProtected('quanlykhachhang', 'CRM Khách Hàng', 'fa-solid fa-address-book', QuanLyKhachHang)} />
                    <Route path="/leads" element={renderProtected('leads', 'Lead Tư Vấn CRM', 'fa-solid fa-comments', QuanLyLead)} />
                    <Route path="/quanlylead" element={renderProtected('leads', 'Lead Tư Vấn CRM', 'fa-solid fa-comments', QuanLyLead)} />
                    <Route path="/quanlywebsite" element={renderProtected('quanlywebsite', 'Quản lý Website & CMS', 'fa-solid fa-globe', QuanLyWebsite)} />
                    <Route path="/quanlyvoucher" element={renderProtected('quanlyvoucher', 'Quản lý Voucher', 'fa-solid fa-ticket', QuanLyVoucher)} />
                    <Route path="/quanlythiepmoi" element={<Navigate to="/quanlywebsite?tab=thiep_moi_online" replace />} />
                    <Route path="/quanlynhanvien" element={renderProtected('quanlynhanvien', 'Quản lý Nhân sự & Phân quyền', 'fa-solid fa-users-gear', QuanLyNhanVien)} />
                    <Route path="/system-logs" element={renderProtected('system-logs', 'Nhật ký hệ thống', 'fa-solid fa-shield-halved', SystemLogs)} />
                    <Route path="/cauhinh" element={renderProtected('cauhinh', 'Cấu hình hệ thống & Mẫu in', 'fa-solid fa-gear', CauHinh)} />
                    <Route path="*" element={<Navigate to={getFirstAllowedPath(effectiveUser)} replace />} />
                </Routes>
                </Suspense>

                <footer className="main-footer" style={{ textAlign: 'center', paddingTop: 10, marginTop: 10, borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                    Design by Mai Tiến Long
                </footer>
            </div>

            {/* Dialog Thông Tin Tài Khoản, Lương Thưởng, Bảng Lương & Chỉ Tiêu KPI */}
            <Dialog
                open={showDialog}
                onClose={() => setShowDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }
                }}
            >
                {/* Header Banner */}
                <Box sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', p: { xs: 2, sm: 2.5 }, color: '#fff', position: 'relative' }}>
                    <IconButton
                        size="small"
                        onClick={() => setShowDialog(false)}
                        sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8', '&:hover': { color: '#fff' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={user?.avatar || ''}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: '#0284c7',
                                    fontSize: '1.6rem',
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
                                <Stack direction="row" spacing={1} alignItems="center" mt={0.6} flexWrap="wrap">
                                    <Chip
                                        label={userRoleDisplay}
                                        size="small"
                                        sx={{ bgcolor: '#0284c7', color: '#fff', fontWeight: 700, height: 22, fontSize: '0.75rem' }}
                                    />
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        @{user?.username || 'user'}
                                    </Typography>
                                    {userStats?.rank && (
                                        <Chip
                                            label={`${userStats.medal || '🏅'} Hạng ${userStats.rank}`}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(234,179,8,0.2)', color: '#fde047', fontWeight: 800, height: 22, fontSize: '0.72rem', border: '1px solid rgba(234,179,8,0.4)' }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Stack>

                        {/* Tổng thu nhập tháng tóm tắt góc phải header */}
                        <Box sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            px: 2,
                            py: 1,
                            textAlign: 'right',
                            display: { xs: 'none', sm: 'block' }
                        }}>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                                THU NHẬP THÁNG {new Date().getMonth() + 1}/{new Date().getFullYear()}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 800, letterSpacing: '-0.3px' }}>
                                {formatMoney(salaryBreakdown.tongThuNhap)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Navigation Tabs */}
                    <Box sx={{ mt: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Tabs
                            value={profileTab}
                            onChange={(e, val) => setProfileTab(val)}
                            textColor="inherit"
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: 40,
                                '& .MuiTab-root': {
                                    minHeight: 40,
                                    py: 1,
                                    px: 2,
                                    color: '#94a3b8',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    textTransform: 'none',
                                    '&.Mui-selected': {
                                        color: '#38bdf8'
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#38bdf8',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab label={<span>💵 Bảng Lương & Thu Nhập</span>} />
                            <Tab label={<span>🎯 Chỉ Tiêu & Tiến Độ KPI</span>} />
                            <Tab label={<span>📋 Hợp Đồng Trong Tháng ({salaryBreakdown.contractDetails.length})</span>} />
                            <Tab label={<span>👤 Thông Tin & Danh Hiệu</span>} />
                        </Tabs>
                    </Box>
                </Box>

                <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc', minHeight: 420 }}>
                    {isLoadingSalaryData ? (
                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
                            <CircularProgress size={36} sx={{ color: '#0284c7' }} />
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Đang đồng bộ bảng lương, hoa hồng & chỉ tiêu KPI...
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* TAB 0: BẢNG LƯƠNG & THU NHẬP */}
                            {profileTab === 0 && (
                                <Stack spacing={2.5}>
                                    {/* Card Tổng Thu Nhập Nổi Bật */}
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                        color: '#fff',
                                        p: 2.5,
                                        borderRadius: '16px',
                                        border: '1px solid #334155',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#fde047', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    💰 Tổng thu nhập ước tính tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', my: 0.5 }}>
                                                    {formatMoney(salaryBreakdown.tongThuNhap)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                    = Lương cứng ({formatShortMoney(salaryBreakdown.luongCoBan)}) + Hoa hồng ({formatShortMoney(salaryBreakdown.hoaHongTotal)}) + Thưởng ({formatShortMoney(salaryBreakdown.bonusEst)})
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={`${salaryBreakdown.workCount} Hợp đồng`}
                                                sx={{ bgcolor: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 800, border: '1px solid rgba(56,189,248,0.3)', px: 1 }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* 3 Cards Nguồn Thu Nhập */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#f0fdf4', borderColor: '#bbf7d0', height: '100%' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <span style={{ fontSize: '1.2rem' }}>🏢</span>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>Lương cơ bản</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                    {formatMoney(salaryBreakdown.luongCoBan)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#166534', display: 'block', mt: 0.5 }}>
                                                    Lương cứng cố định hàng tháng
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#eff6ff', borderColor: '#bfdbfe', height: '100%' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af' }}>Hoa hồng thực nhận</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                                                    {formatMoney(salaryBreakdown.hoaHongTotal)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#1e40af', display: 'block', mt: 0.5 }}>
                                                    Từ {salaryBreakdown.workCount} hợp đồng đã phục vụ
                                                </Typography>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#fffbeb', borderColor: '#fde68a', height: '100%' }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                    <span style={{ fontSize: '1.2rem' }}>🎁</span>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e' }}>Thưởng KPI / Vượt mốc</Typography>
                                                </Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
                                                    {formatMoney(salaryBreakdown.bonusEst)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#92400e', display: 'block', mt: 0.5 }}>
                                                    {salaryBreakdown.isExceeded ? `Vượt ${salaryBreakdown.exceededCount} hợp đồng` : (salaryBreakdown.percentCompletion >= 100 ? 'Đạt chuẩn 100% KPI' : 'Theo mốc thi đua studio')}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    </Grid>

                                    {/* Bảng kê chi tiết cơ cấu BẢNG LƯƠNG */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>📊</span> BẢNG KÊ THỰC LĨNH LƯƠNG THÁNG {new Date().getMonth() + 1}/{new Date().getFullYear()}
                                        </Typography>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ '& th': { fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569', py: 1 } }}>
                                                    <TableCell>Khoản mục thu nhập</TableCell>
                                                    <TableCell>Diễn giải / Cơ sở tính</TableCell>
                                                    <TableCell align="right">Mức hưởng (VNĐ)</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow hover>
                                                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        🏢 1. Lương cơ bản (Lương cứng)
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        Mức lương cố định được ký kết theo chức danh {userRoleDisplay}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                        {formatMoney(salaryBreakdown.luongCoBan)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow hover>
                                                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        💎 2. Hoa hồng hợp đồng
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        Tích lũy từ doanh số {formatMoney(salaryBreakdown.tongDoanhSo)} qua {salaryBreakdown.workCount} hợp đồng
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                                                        {formatMoney(salaryBreakdown.hoaHongTotal)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow hover>
                                                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        🎁 3. Thưởng KPI & Thi đua
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#64748b' }}>
                                                        Thưởng mốc thi đua studio & vượt chỉ tiêu tháng ({salaryBreakdown.percentCompletion}%)
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#b45309' }}>
                                                        {formatMoney(salaryBreakdown.bonusEst)}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow sx={{ bgcolor: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                                                    <TableCell sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                                        🎯 TỔNG THỰC LĨNH DỰ KIẾN
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>
                                                        Lương cứng + Hoa hồng + Thưởng mốc
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem' }}>
                                                        {formatMoney(salaryBreakdown.tongThuNhap)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Paper>

                                    {/* Chính sách hoa hồng cá nhân nếu có */}
                                    {Array.isArray(userProfileData?.hoaHongTheoLoaiHD) && userProfileData.hoaHongTheoLoaiHD.length > 0 && (
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>📜</span> CHÍNH SÁCH HOA HỒNG ÁP DỤNG RIÊNG CHO BẠN
                                                </Typography>
                                                <Button size="small" onClick={() => setProfileTab(2)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}>
                                                    Xem hợp đồng tháng ➔
                                                </Button>
                                            </Box>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#e2e8f0', py: 0.8 } }}>
                                                        <TableCell>Loại hợp đồng</TableCell>
                                                        <TableCell align="right">Mức hoa hồng được hưởng</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userProfileData.hoaHongTheoLoaiHD.map((r, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell sx={{ py: 0.8 }}>{getDichVuChinhLabel(r.loaiHopDongId)}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0284c7', py: 0.8 }}>
                                                                {Number(r.loaiHoaHong) === 1 ? `${r.mucHoaHong}% Doanh số` : `${formatMoney(r.mucHoaHong)} / HĐ`}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    )}
                                </Stack>
                            )}

                            {/* TAB 1: CHỈ TIÊU & TIẾN ĐỘ KPI */}
                            {profileTab === 1 && (
                                <Stack spacing={2.5}>
                                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#ffffff', borderColor: '#e2e8f0' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                🎯 CHỈ TIÊU HỢP ĐỒNG THÁNG {new Date().getMonth() + 1}/{new Date().getFullYear()}
                                            </Typography>
                                            {userStats?.rank && (
                                                <Chip 
                                                    label={`${userStats.medal || '🏅'} Hạng ${userStats.rank} toàn Studio`} 
                                                    size="small" 
                                                    sx={{ bgcolor: userStats.rank === 1 ? '#fef3c7' : userStats.rank === 2 ? '#f1f5f9' : '#fef9c3', color: userStats.rank === 1 ? '#d97706' : '#334155', fontWeight: 800 }} 
                                                />
                                            )}
                                        </Box>
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
                                                Tiến độ thực hiện: <strong style={{ color: '#0284c7', fontSize: '1.2rem' }}>{salaryBreakdown.workCount}</strong> / {salaryBreakdown.chiTieuThang} hợp đồng
                                            </Typography>
                                            <Chip 
                                                label={`${salaryBreakdown.percentCompletion}% Target`} 
                                                size="medium" 
                                                sx={{ 
                                                    bgcolor: salaryBreakdown.percentCompletion >= 100 ? '#dcfce7' : salaryBreakdown.percentCompletion >= 50 ? '#fef3c7' : '#fee2e2', 
                                                    color: salaryBreakdown.percentCompletion >= 100 ? '#15803d' : salaryBreakdown.percentCompletion >= 50 ? '#b45309' : '#b91c1c', 
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem'
                                                }} 
                                            />
                                        </Box>

                                        {/* Progress bar */}
                                        <Box sx={{ width: '100%', height: 14, bgcolor: '#e2e8f0', borderRadius: 7, overflow: 'hidden', mb: 2.5 }}>
                                            <Box
                                                sx={{
                                                    width: `${Math.min(100, salaryBreakdown.percentCompletion)}%`,
                                                    height: '100%',
                                                    borderRadius: 7,
                                                    background: salaryBreakdown.percentCompletion >= 100 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                                                    transition: 'width 0.4s ease-in-out'
                                                }}
                                            />
                                        </Box>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, display: 'block' }}>🔥 Vượt chỉ tiêu</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                                                        {salaryBreakdown.isExceeded ? `+${salaryBreakdown.exceededCount} HĐ` : '0 HĐ'}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600, display: 'block' }}>💼 Doanh số phụ trách</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                                                        {formatMoney(salaryBreakdown.tongDoanhSo)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600, display: 'block' }}>💰 Thưởng & Hoa hồng</Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
                                                        {formatMoney(salaryBreakdown.hoaHongTotal + salaryBreakdown.bonusEst)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    {/* Khối cơ chế thi đua & thưởng mốc */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>🏆</span> QUY CHUẨN THƯỞNG THI ĐUA & KPI STUDIO
                                        </Typography>
                                        <Grid container spacing={1.5}>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a', display: 'block' }}>⭐ Đạt 100% KPI</Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>Đạt chỉ tiêu tháng được thưởng nóng và ghi nhận danh hiệu</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb', display: 'block' }}>🚀 Đạt 120% KPI</Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>Thưởng thêm 10% hoa hồng tích lũy</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706', display: 'block' }}>🔥 Đạt 150% KPI</Typography>
                                                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>Thưởng thêm 15% hoa hồng + Danh hiệu Chiến Binh Bứt Phá</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Stack>
                            )}

                            {/* TAB 2: HỢP ĐỒNG TRONG THÁNG */}
                            {profileTab === 2 && (
                                <Stack spacing={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                            📋 DANH SÁCH HỢP ĐỒNG BẠN PHỤ TRÁCH ({salaryBreakdown.contractDetails.length})
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            Tổng doanh số: <strong>{formatMoney(salaryBreakdown.tongDoanhSo)}</strong> | Hoa hồng: <strong style={{ color: '#0284c7' }}>{formatMoney(salaryBreakdown.hoaHongTotal)}</strong>
                                        </Typography>
                                    </Box>

                                    {salaryBreakdown.contractDetails.length === 0 ? (
                                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#ffffff', borderRadius: '12px' }}>
                                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                Chưa có dữ liệu hợp đồng phân công cho bạn trong tháng này.
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#ffffff' }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ '& th': { fontWeight: 800, bgcolor: '#f1f5f9', color: '#475569', py: 1 } }}>
                                                        <TableCell align="center" style={{ width: 45 }}>STT</TableCell>
                                                        <TableCell>Mã HĐ</TableCell>
                                                        <TableCell>Khách hàng</TableCell>
                                                        <TableCell>Vai trò</TableCell>
                                                        <TableCell align="right">Giá trị HĐ</TableCell>
                                                        <TableCell align="right">Hoa hồng</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {salaryBreakdown.contractDetails.map((item, idx) => (
                                                        <TableRow key={item.contract?._id || idx} hover>
                                                            <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600 }}>{idx + 1}</TableCell>
                                                            <TableCell sx={{ fontWeight: 700, color: '#0284c7' }}>
                                                                {item.contract?.maHopDong}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                                                    {item.contract?.khachHang1?.tenKhachHang || item.contract?.hoTen || 'Khách hàng'}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                    {item.contract?.khachHang1?.soDienThoai || ''}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                                    {item.roles.map((r, rIdx) => (
                                                                        <Chip key={rIdx} label={r} size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: '#f1f5f9', color: '#334155' }} />
                                                                    ))}
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                {formatMoney(item.value)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <div style={{ fontWeight: 800, color: item.commission > 0 ? '#15803d' : '#64748b' }}>
                                                                    {formatMoney(item.commission)}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                                    {item.ruleLabel}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow sx={{ bgcolor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                                        <TableCell colSpan={4} sx={{ fontWeight: 800, color: '#0f172a' }}>
                                                            TỔNG CỘNG ({salaryBreakdown.contractDetails.length} hợp đồng)
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#334155' }}>
                                                            {formatMoney(salaryBreakdown.tongDoanhSo)}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#15803d', fontSize: '0.95rem' }}>
                                                            {formatMoney(salaryBreakdown.hoaHongTotal)}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    )}
                                </Stack>
                            )}

                            {/* TAB 3: THÔNG TIN & DANH HIỆU */}
                            {profileTab === 3 && (
                                <Stack spacing={2.5}>
                                    {/* Thông tin tài khoản */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff' }}>
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

                                    {/* Thành tích & Danh hiệu được Admin trao tặng */}
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: '#ffffff' }}>
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
                                            {salaryBreakdown.percentCompletion >= 100 && (
                                                <Chip label="⭐ Đạt Chỉ Tiêu KPI" variant="outlined" color="success" sx={{ fontWeight: 700, bgcolor: '#fff' }} />
                                            )}
                                            {salaryBreakdown.isExceeded && (
                                                <Chip label="🔥 Chiến Binh Bứt Phá" variant="outlined" color="error" sx={{ fontWeight: 700, bgcolor: '#fff' }} />
                                            )}
                                            {userStats?.rank === 1 && (
                                                <Chip label="👑 Quán Quân Tháng" variant="outlined" sx={{ fontWeight: 800, bgcolor: '#fef3c7', color: '#d97706', borderColor: '#fbbf24' }} />
                                            )}
                                        </Stack>
                                    </Paper>
                                </Stack>
                            )}
                        </>
                    )}
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
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setShowDialog(false);
                                handleTriggerLock();
                            }}
                            style={{ borderRadius: 10, fontWeight: 700, padding: '8px 16px', backgroundColor: '#f59e0b', color: '#fff' }}
                        >
                            <i className="fa-solid fa-lock" style={{ marginRight: 6 }}></i> Khóa PIN
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleLogout}
                            style={{ borderRadius: 10, fontWeight: 700, padding: '8px 20px', backgroundColor: '#ef4444' }}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            {/* Dialog Tiện ích Lịch, Ngày đẹp & Giờ Server */}
            <SystemClockCalendarModal
                open={openClockModal}
                onClose={() => setOpenClockModal(false)}
                defaultTab={clockModalTab}
            />

            {/* Dialog Trung Tâm Nhắc Việc & Cảnh Báo Tự Động */}
            <Dialog
                open={openRemindersDialog}
                onClose={() => setOpenRemindersDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ style: { borderRadius: 16 } }}
            >
                <DialogTitle sx={{ bgcolor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <i className="fa-solid fa-bell" style={{ color: '#facc15' }}></i>
                        <Typography variant="subtitle1" fontWeight={800}>
                            TRUNG TÂM NHẮC VIỆC & CẢNH BÁO VẬN HÀNH ({remindersData.totalCount})
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setOpenRemindersDialog(false)} sx={{ color: '#94a3b8' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
                    {remindersData.totalCount === 0 ? (
                        <Box textAlign="center" py={4} color="#64748b">
                            <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: '#22c55e', marginBottom: 10 }}></i>
                            <Typography variant="subtitle1" fontWeight={700} color="#0f172a">Tuyệt vời! Không có công việc quá hạn hay cảnh báo khẩn nào.</Typography>
                            <Typography variant="body2">Mọi lịch chụp, trang điểm, hậu kỳ và trả váy đều đang đúng tiến độ.</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            {remindersData.customerApprovedAlbums?.length > 0 && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#38bdf8', bgcolor: '#f0f9ff' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#0369a1" mb={1}>
                                        📸 KHÁCH VỪA CHỐT ẢNH TRÊN CỔNG KHÁCH HÀNG ({remindersData.customerApprovedAlbums.length})
                                    </Typography>
                                    {remindersData.customerApprovedAlbums.map((item, idx) => (
                                        <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" py={0.6} borderBottom="1px dashed #bae6fd">
                                            <Typography variant="body2">
                                                <strong>{item.maHopDong}</strong> — {item.tenKhachHang || 'Khách hàng'} ({item.soAnhChon || 0} ảnh đã chọn)
                                            </Typography>
                                            <Button size="small" onClick={() => { setOpenRemindersDialog(false); navigate('/banhang'); }}>Xem HĐ</Button>
                                        </Box>
                                    ))}
                                </Paper>
                            )}

                            {remindersData.overduePostProductions?.length > 0 && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#f87171', bgcolor: '#fef2f2' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#b91c1c" mb={1}>
                                        ⚠️ QUÁ HẠN TRẢ ẢNH HẬU KỲ ({remindersData.overduePostProductions.length})
                                    </Typography>
                                    {remindersData.overduePostProductions.map((item, idx) => (
                                        <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" py={0.6} borderBottom="1px dashed #fecaca">
                                            <Typography variant="body2">
                                                <strong>{item.maHopDong}</strong> — {item.tenKhachHang} | Thợ: {item.thoChinhAnh || 'Chưa phân công'}
                                            </Typography>
                                            <Button size="small" color="error" onClick={() => { setOpenRemindersDialog(false); navigate('/banhang'); }}>Xử lý</Button>
                                        </Box>
                                    ))}
                                </Paper>
                            )}

                            {remindersData.overdueDressReturns?.length > 0 && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#fb923c', bgcolor: '#fff7ed' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#c2410c" mb={1}>
                                        👗 QUÁ HẠN TRẢ VÁY / TRANG PHỤC ({remindersData.overdueDressReturns.length})
                                    </Typography>
                                    {remindersData.overdueDressReturns.map((item, idx) => (
                                        <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" py={0.6} borderBottom="1px dashed #fed7aa">
                                            <Typography variant="body2">
                                                <strong>{item.maHopDong}</strong> — {item.tenKhachHang} ({item.soDienThoai || ''})
                                            </Typography>
                                            <Button size="small" color="warning" onClick={() => { setOpenRemindersDialog(false); navigate('/quanlytrangphuc'); }}>Kho Váy</Button>
                                        </Box>
                                    ))}
                                </Paper>
                            )}

                            {(remindersData.upcomingShoots?.length > 0 || remindersData.upcomingMakeups?.length > 0) && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#4ade80', bgcolor: '#f0fdf4' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#15803d" mb={1}>
                                        📅 LỊCH CHỤP & MAKEUP NGÀY MAI ({remindersData.upcomingShoots.length + remindersData.upcomingMakeups.length})
                                    </Typography>
                                    {remindersData.upcomingShoots.map((item, idx) => (
                                        <Box key={`s-${idx}`} display="flex" justifyContent="space-between" alignItems="center" py={0.6} borderBottom="1px dashed #bbf7d0">
                                            <Typography variant="body2">
                                                📷 <strong>[Chụp] {item.maHopDong}</strong> — {item.tenKhachHang} ({item.gioChup || 'Cả ngày'}) | Thợ: {item.thoChup || 'Chưa gán'}
                                            </Typography>
                                            <Button size="small" color="success" onClick={() => { setOpenRemindersDialog(false); navigate('/lichcuahang'); }}>Xem lịch</Button>
                                        </Box>
                                    ))}
                                    {remindersData.upcomingMakeups.map((item, idx) => (
                                        <Box key={`m-${idx}`} display="flex" justifyContent="space-between" alignItems="center" py={0.6} borderBottom="1px dashed #bbf7d0">
                                            <Typography variant="body2">
                                                💄 <strong>[Makeup] {item.maHopDong}</strong> — {item.tenKhachHang} | Makeup: {item.thoMake || 'Chưa gán'}
                                            </Typography>
                                            <Button size="small" color="success" onClick={() => { setOpenRemindersDialog(false); navigate('/lichcuahang'); }}>Xem lịch</Button>
                                        </Box>
                                    ))}
                                </Paper>
                            )}

                            {remindersData.upcomingDressPickups?.length > 0 && (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: '#c084fc', bgcolor: '#faf5ff' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="#7e22ce" mb={1}>
                                        🛍️ SẮP ĐẾN HẸN LẤY VÁY TRONG 3 NGÀY TỚI ({remindersData.upcomingDressPickups.length})
                                    </Typography>
                                    {remindersData.upcomingDressPickups.map((item, idx) => (
                                        <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" py={0.6} borderBottom="1px dashed #e9d5ff">
                                            <Typography variant="body2">
                                                <strong>{item.maHopDong}</strong> — {item.tenKhachHang} ({item.items?.length || 0} trang phục)
                                            </Typography>
                                            <Button size="small" onClick={() => { setOpenRemindersDialog(false); navigate('/lichSoanDo'); }}>Soạn đồ</Button>
                                        </Box>
                                    ))}
                                </Paper>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#fff' }}>
                    <Button onClick={() => setOpenRemindersDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Component Khóa Màn Hình LockScreen */}
            <LockScreen 
                isOpen={isScreenLocked}
                onUnlock={handleUnlock}
                currentUser={userProfileData || user}
                userNameDisplay={userNameDisplay}
                userRoleDisplay={userRoleDisplay}
                onLogout={handleLogout}
            />

            {/* Command Palette Spotlight Modal (Ctrl + K) */}
            <CommandPaletteModal
                isOpen={openCommandPalette}
                onClose={() => setOpenCommandPalette(false)}
                onTriggerLock={handleTriggerLock}
                onOpenClockModal={() => {
                    setClockModalTab(0);
                    setOpenClockModal(true);
                }}
            />
        </div>
    );
}

export default MainV2;
