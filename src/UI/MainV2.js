import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo/BETA-1 VANG@4x.png';
import './css/mainv2.css';
import { SolarDate } from "lunar-date-vn";
import HopDongKhachHang from '../screens/HopDong/HopDongKhachHang';
import LichCuaHang from "../screens/LichCuaHang/LichCuaHang";
import QuanLyChiTieu from "../screens/QuanLyChiTieu/QuanLyChiTieu";
import LichSoanDo from "../screens/LichSoanDo/LichSoanDo";
import DoanhThu from "../screens/DoanhThu/DoanhThu";
import QuanLyKho from "../screens/QuanLyKho/QuanLyKho";
import QuanLyNhanVien from "../screens/QuanLyNhanVien/QuanLyNhanVien";
import QuanLyKhachHang from "../screens/QuanLyKhachHang/QuanLyKhachHang";
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../screens/Login/AuthContext/AuthContext';
import { toast } from 'sonner';

function MainV2() {
    const navigate = useNavigate();
    const [showDialog, setShowDialog] = useState(false);
    const [user, setUser] = useState(
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    );
    const { logout } = useAuth();

    const [ctime, setTime] = useState(new Date().toLocaleTimeString());
    const [cdate, setDate] = useState(new Date().toLocaleDateString());
    const solar_date = new SolarDate(new Date());
    const dayNames = ["Chủ nhật", "Thứ hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
            setDate(new Date().toLocaleDateString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Đăng xuất thành công!");
        navigate('/login');
    };

    return (
        <div className="AppV2">
            <div className="container">
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="logo-title-group">
                            <img className="logo-login" src={logo} alt="logo" />
                            <h1 className="mobile-only-title">HỆ THỐNG QUẢN LÝ CỬA HÀNG LONG WEDDING</h1>
                        </div>
                        <div className="time-display">
                            <h2 id="clock">{ctime}</h2>
                            <p id="date">{dayNames[new Date().getDay()]}, {cdate}</p>
                            <p id="date">
                                {"Ngày " +
                                    solar_date.toLunarDate().day +
                                    " tháng " +
                                    solar_date.toLunarDate().month +
                                    " năm " +
                                    solar_date.toLunarDate().year}
                            </p>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <ul>
                            <li><Link to="/hop-dong-khach-hang"><i className="fa-solid fa-file-contract"></i> QUẢN LÝ HỢP ĐỒNG KHÁCH</Link></li>
                            <li><Link to="/lich-cua-hang"><i className="fa-solid fa-calendar-days"></i> LỊCH CỬA HÀNG</Link></li>
                            <li><Link to="/lich-soan-do"><i className="fa-solid fa-shirt"></i> LỊCH SOẠN ĐỒ</Link></li>
                            <li><Link to="/quan-ly-chi-tieu"><i className="fa-solid fa-cash-register"></i> QUẢN LÝ CHI TIÊU</Link></li>
                            <li><Link to="/bao-cao-doanh-thu"><i className="fa-solid fa-chart-line"></i> BÁO CÁO DOANH THU & KPI</Link></li>
                            <li><Link to="/quan-ly-kho"><i className="fa-solid fa-warehouse"></i> QUẢN LÝ KHO</Link></li>
                            <li><Link to="/quan-ly-nhan-vien"><i className="fa-solid fa-users-gear"></i> QUẢN LÝ NHÂN VIÊN</Link></li>
                            <li><Link to="/quan-ly-khach-hang"><i className="fa-solid fa-users"></i> QUẢN LÝ KHÁCH HÀNG</Link></li>
                        </ul>
                    </nav>

                    {/* ✅ Khi click vào đây sẽ mở dialog */}
                    <div className="user-profile" onClick={() => setShowDialog(true)}>
                        <i className="fa-solid fa-user-circle"></i>
                        <div className="user-info">
                            <p className="user-name">{user?.fullname || "Người dùng"}</p>
                            <p className="user-role">{user?.positon || "Chức vụ"}</p>
                        </div>
                    </div>
                </aside>

                <main className="main-content">
                    <header className="main-header">
                        <h1>HỆ THỐNG QUẢN LÝ CỬA HÀNG LONG WEDDING</h1>
                    </header>

                    <div className="content-wrapper">
                        <Routes>
                            <Route path="/hop-dong-khach-hang" element={<HopDongKhachHang />} />
                            <Route path="/lich-cua-hang" element={<LichCuaHang />} />
                            <Route path="/quan-ly-chi-tieu" element={<QuanLyChiTieu />} />
                            <Route path="/lich-soan-do" element={<LichSoanDo />} />
                            <Route path="/bao-cao-doanh-thu" element={<DoanhThu />} />
                            <Route path="/quan-ly-kho" element={<QuanLyKho />} />
                            <Route path="/quan-ly-nhan-vien" element={<QuanLyNhanVien />} />
                            <Route path="/quan-ly-khach-hang" element={<QuanLyKhachHang />} />
                        </Routes>
                    </div>

                    <footer className="main-footer">
                        <p>LONG WEDDING COPYRIGHT 2025</p>
                    </footer>
                </main>
            </div>

            {/* 🎯 Dialog hiển thị thông tin người dùng */}
            {showDialog && (
                <div className="dialog-overlay" onClick={() => setShowDialog(false)}>
                    <div className="dialog" onClick={(e) => e.stopPropagation()}>
                        {/* 🔴 Nút đóng góc phải */}
                        <button className="dialog-close-btn" onClick={() => setShowDialog(false)}>
                            ×
                        </button>

                        <img
                            src={user?.avatar || "https://scontent.fhan5-9.fna.fbcdn.net/v/t39.30808-6/540694805_2780834042087100_7085640180785329332_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=vGwBach99ogQ7kNvwHlCCyz&_nc_oc=AdkPsams-aoLPGXTLiDj9UD1EYedRsgzJ4foDlb3anqV2ggGa3tBwDAzYTapDRxSTWY&_nc_zt=23&_nc_ht=scontent.fhan5-9.fna&_nc_gid=U4OIpzD-nFY3oSELh1v_wQ&oh=00_Afd5c05opBDNkeSxbT4cPHYHOoBbKCSODUxFp27PHabglQ&oe=68F04A4D"}
                            alt="avatar"
                            className="dialog-avatar"
                        />
                        <h2>{user?.fullname || "Tên người dùng"}</h2>
                        <p><strong>Ngày sinh:</strong> {user?.birthday || "01/01/1990"}</p>
                        <p><strong>Chức vụ:</strong> {user?.position || "Nhân viên"}</p>

                        <button className="logout-btn" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainV2;
