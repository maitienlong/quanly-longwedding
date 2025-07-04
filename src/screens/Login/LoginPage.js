import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './login.css'; // File CSS chúng ta sẽ tạo ở bước 2
import logo from '../../assets/logo/BETA-1 VANG.png'
const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setError(''); // Xóa lỗi cũ

        // Kiểm tra input
        if (!email || !password) {
            setError('Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }

        // --- Logic đăng nhập ---
        // Trong ứng dụng thực tế, bạn sẽ gọi API ở đây.
        // Ở đây, chúng ta chỉ giả lập việc kiểm tra tài khoản.
        if (email === 'admin@longwedding.vn' && password === 'password123') {
            console.log('Đăng nhập thành công!');
            onLoginSuccess(); // Gọi hàm được truyền từ App.js để báo hiệu đăng nhập thành công
        } else {
            setError('Email hoặc mật khẩu không chính xác.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img className='logo-login' src={logo} alt='logo' />
                    <p>Đăng nhập hệ thống quản lý</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faUser} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Tên đăng nhập hoặc Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faLock} className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-btn">Đăng nhập</button>
                </form>

                <div className="login-footer">
                    <a href="#">DESIGN BY MAITIENLONG</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;