import React from 'react';
import './css/mynavbar.css';

const MyNavbar = () => {
  return (
    <div className="container">
      <div className="header">
        <div className="logo">
          <img src="https://placehold.co/200x200.png" alt="Logo" />
          <span>LONG WEDDING - HỆ THỐNG QUẢN TRỊ</span>
        </div>
        <div className="contact">
          <img src="path/to/your/phone.png" alt="Phone" />
          <span>0979 789 658</span>
          <img src="path/to/your/email.png" alt="Email" />
          <span>wutenlong@gmail.com</span>
        </div>
      </div>
      <div className="navigation">
        <a href="#">Giới thiệu</a>
        <a href="#">Dịch vụ</a>
        <a href="#">Khóa học</a>
        <a href="#">Sản phẩm</a>
        <a href="#">Liên hệ</a>
        <a href="#">Tin tức</a>
      </div>
      <div className="content">

      </div>
      <div className="footer">
        <span>Copyright 2023. Thiết kế bởi wutenlong.com</span>
      </div>
    </div>
  );
};

export default MyNavbar;