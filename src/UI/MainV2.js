import { useState } from "react";
import logo from '../assets/logo/BETA-1 VANG@4x.png';
import './css/mainv2.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LunarDate, SolarDate } from "lunar-date-vn";
import { AuthProvider } from '../screens/Login/AuthContext/AuthContext';

import HopDongKhachHang from '../screens/HopDong/HopDongKhachHang';
import LichCuaHang from "../screens/LichCuaHang/LichCuaHang";
import QuanLyChiTieu from "../screens/QuanLyChiTieu/QuanLyChiTieu";
import LichSoanDo from "../screens/LichSoanDo/LichSoanDo";
import DoanhThu from "../screens/DoanhThu/DoanhThu";
import QuanLyKho from "../screens/QuanLyKho/QuanLyKho";
import ProtectedRoute from "../screens/Login/AuthContext/ProtectedRoute";
import LoginPage from "../screens/Login/LoginPage";

function MainV2() {
    let time = new Date().toLocaleTimeString()
    let vdate = new Date().toLocaleTimeString()
    const solar_date = new SolarDate(new Date());

    const [ctime, setTime] = useState(time)
    const [cdate, setDate] = useState(vdate)
    const dayNames = ["Chủ nhật", "Thứ hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const UpdateTime = () => {
        time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds()
        vdate = " Ngày " + new Date().getDate() + " tháng " + new Date().getMonth() + " năm " + new Date().getFullYear()
        setTime(time)
        setDate(vdate)
    }
    setInterval(UpdateTime)

    return (
        <div className="AppV2">
            <body>
                <div class="container">
                    <aside class="sidebar">
                        <div class="sidebar-header">
                            
                                <img class="logo-login" src={logo}></img>
                       
                            <div class="time-display">
                                <h2 id="clock">{ctime}</h2>
                                <p id="date">{dayNames[new Date().getDay()]}, {cdate}</p>
                                <p id="date">{"Ngày " + solar_date.toLunarDate().day + " tháng " + solar_date.toLunarDate().month + " năm " + solar_date.toLunarDate().year} </p>
                            </div>
                        </div>
                        <nav class="sidebar-nav">
                            <ul>
                                <li><Link to="/hop-dong-khach-hang"><i class="fa-solid fa-file-contract"></i> QUẢN LÝ HỢP ĐỒNG KHÁCH</Link></li>
                                <li><Link to="/lich-cua-hang"><i class="fa-solid fa-calendar-days"></i> LỊCH CỬA HÀNG</Link></li>
                                <li><Link to="/lich-soan-do"><i class="fa-solid fa-shirt"></i>LỊCH SOẠN ĐỒ</Link></li>
                                <li><Link to="/quan-ly-chi-tieu"><i class="fa-solid fa-cash-register"></i> QUẢN LÝ CHI TIÊU</Link></li>
                                <li><Link to="/bao-cao-doanh-thu"><i class="fa-solid fa-chart-line"></i> BÁO CÁO DOANH THU & KPI</Link></li>
                                <li><Link to="/quan-ly-kho"><i class="fa-solid fa-warehouse"></i> QUẢN LÝ KHO</Link></li>
                            </ul>
                        </nav>
                        <div class="user-profile">
                            <i class="fa-solid fa-user-circle"></i>
                            <div class="user-info">
                                <p class="user-name">MAI TIẾN LONG</p>
                                <p class="user-role">Nhân viên</p>
                            </div>
                        </div>
                    </aside>

                    <main class="main-content">
                        <header class="main-header">
                            <h1>HỆ THỐNG QUẢN LÝ CỬA HÀNG LONG WEDDING</h1>
                        </header>

                        <div class="content-wrapper">
                            <Routes>
                                <Route path="/hop-dong-khach-hang" element={<HopDongKhachHang />} />
                                <Route path="/lich-cua-hang" element={<LichCuaHang />} />
                                <Route path="/quan-ly-chi-tieu" element={<QuanLyChiTieu />} />
                                <Route path="/lich-soan-do" element={<LichSoanDo />} />
                                <Route path="/bao-cao-doanh-thu" element={<DoanhThu />} />
                                <Route path="/quan-ly-kho" element={<QuanLyKho />} />
                            </Routes>
                        </div>

                        <footer class="main-footer">
                            <p>LONG WEDDING COPYRIGHT 2025</p>
                        </footer>
                    </main>
                </div>

                <script src="script.js"></script>
            </body>
        </div>
    );
}

export default MainV2;
