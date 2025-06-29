import * as React from 'react';
import logo from './assets/logo/BETA-1 XANH@4x.png';
import './App.css';

import HopDong from './screens/HopDong';

import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import CongViec from './screens/CongViec';
import BaoCao from './screens/BaoCao';
import KeToan from './screens/KeToan';
import NhanVien from './screens/NhanVien';
import SanPham from './screens/SanPham';
import ThongBao from './screens/ThongBao';
import HomePage from './screens/HomPage';
import ThueDo from './screens/ThueDo/ThueDo';
import MainV2 from './UI/MainV2';


function App() {

  var menu = [
    {
      name: "Trang Chủ",
      to: "/",
      icon: "fa fa-shopping-cart text-aqua",
      index: 0
    },
    {
      name: "Hợp Đồng",
      to: "/hop-dong",
      icon: "fa fa-shopping-cart text-aqua",
      index: 1
    },
    {
      name: "Thuê Đồ",
      to: "/thue-do",
      icon: "fa fa fa-address-book",
      index: 2
    }, {
      name: "Báo Cáo",
      to: "/bao-cao",
      icon: "fa fa-shopping-bag text-aqua",
      index: 3
    },
    {
      name: "Sale",
      to: "/sale",
      icon: "fa fa-shopping-basket",
      index: 4
    },
    {
      name: "Kế Toán",
      to: "/ke-toan",
       icon: "fa fa-money",
      index: 5
    },
    {
      name: "Công Việc",
      to: "/cong-vi",
      icon: "fa fa-calendar text-aqua",
      index: 6
    },
    {
      name: "Nhân Viên",
      to: "/nhan-vien",
      icon: "fa fa-user text-aqua",
      index: 7
    },
    {
      name: "Sản Phẩm",
      to: "/san-pham",
      icon: "fa fa-cube  text-aqua",  
      index: 8
    },
    {
      name: "Đào Tạo",
      to: "/dao-tao",
      icon: "fa fa-shopping-bag  text-aqua",
      index: 9
    },
    {
      name: "Bài Viết",
      to: "/bai-viet",
      icon: "fa fa-newspaper  text-aqua",
      index: 10
    },
    {
      name: "Khách Hàng",
      to: "/khach-hang",
      icon: "fa fa-face-smile  text-aqua",
      index: 11
    },
    {
      name: "Khai Báo",
      to: "/khai-bao",
      icon: "fa fa-list-ol  text-purple",
      index: 12
    }
  ]

  return (
    <div className="App">
      {/* <div className="containers">
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
            {
              menu.map((item, i) => (
                <li>
                  <Link to={item.to}><span><i class={item.icon} aria-hidden="true"></i>{"    "+item.name}</span></Link >
                </li>
              ))
            }
          </ul>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hop-dong" element={<HopDong />} />
            <Route path="/thue-do" element={<ThueDo />} />
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
      </div> */}

      <MainV2 />
    </div>
  );
}

export default App;
