import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './login.css'; // File CSS chúng ta sẽ tạo ở bước 2
import logo from '../../assets/logo/BETA-1 VANG.png';
import { toast } from 'sonner';
import { useAuth } from './AuthContext/AuthContext';

import authService from '../../API/services/authService';


const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoggedIn } = useAuth();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const reason = searchParams.get('reason');
        if (reason === 'expired') {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            navigate('/login', { replace: true });
        } else if (reason === 'inactivity') {
            toast.error("Bạn đã bị đăng xuất tự động do không có hoạt động trong 15 phút!");
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        if (isLoggedIn) navigate('/');
    }, [isLoggedIn, navigate]);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Kiểm tra input
        if (!email || !password) {
            return;
        }
        // Gọi API đăng nhập
        authService.login({ username: email, password: password })
            .then((response) => {

                if (response.status === 'success') {
                    login(response.data);
                    toast.success("Đăng nhập thành công!");
                    navigate('/'); // Chuyển hướng về trang chính
                } else {
                    toast.error(response.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
                }

            })
            .catch((error) => {
                console.error('Login failed:', error);
                toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại.");
            });
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
                            type="text"
                            placeholder="Nhập tài khoản"
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
