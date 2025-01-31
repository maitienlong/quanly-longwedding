import * as React from 'react';
import logo from './assets/logo/BETA-1 XANH@4x.png';
import './App.css';

import HopDong from './screens/HopDong';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import GavelIcon from '@mui/icons-material/Gavel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CampaignIcon from '@mui/icons-material/Campaign';
import CongViec from './screens/CongViec';
import BaoCao from './screens/BaoCao';
import KeToan from './screens/KeToan';
import NhanVien from './screens/NhanVien';
import SanPham from './screens/SanPham';
import ThongBao from './screens/ThongBao';


function App() {
  return (
    <div className="App">
      <div className="containers">
        <div className="header">
          <div className="logo">
            <img src={logo} alt="Logo" />
            <span>LONG WEDDING - HỆ THỐNG QUẢN TRỊ</span>
          </div>
          <div className="contact">
            <Stack direction="row" spacing={2}>
              <Avatar sx={{ bgcolor: deepOrange[500] }}>L</Avatar>
            </Stack>
          </div>
        </div>
        <div className="navigation">
          <ul className='menu'>
            <li>
              <Link to="/hop-dong"><GavelIcon /> <span>Hợp Đồng</span></Link >
            </li>
            <li>
              <Link to="/cong-viec"><CalendarMonthIcon /> <span>Công Việc</span></Link >
            </li>
            <li>
              <Link to="/bao-cao"><BarChartIcon /> <span>Báo Cáo</span></Link >
            </li>
            <li>
              <Link to="/ke-toan"><AttachMoneyIcon /> <span>Kế Toán</span></Link >
            </li>
            <li>
              <Link to="/nhan-vien"><PeopleAltIcon /> <span>Nhân Viên</span></Link >
            </li>
            <li>
              <Link to="/san-pham"><WarehouseIcon /> <span>Sản Phẩm</span></Link >
            </li>
            <li>
              <Link to="/thong-bao"><CampaignIcon /> <span>Thông Báo</span></Link >
            </li>
          </ul>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<HopDong />} />
            <Route path="/hop-dong" element={<HopDong />} />
            <Route path="/cong-viec" element={<CongViec />} />
            <Route path="/bao-cao" element={<BaoCao />} />
            <Route path="/ke-toan" element={<KeToan />} />
            <Route path="/nhan-vien" element={<NhanVien />} />
            <Route path="/san-pham" element={<SanPham />} />
            <Route path="/thong-bao" element={<ThongBao />} />
          </Routes>
        </div>
        <div className="footer">
          <span>Copyright 2025. Thiết kế bởi LONG TECHNOLOGY</span>
        </div>
      </div>
    </div>
  );
}

export default App;
