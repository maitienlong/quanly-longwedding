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
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
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
        setErrorMessage('');

        // Kiểm tra input
        if (!email.trim() || !password) {
            const msg = "Vui lòng nhập đầy đủ tài khoản và mật khẩu!";
            setErrorMessage(msg);
            toast.warning(msg);
            return;
        }

        setLoading(true);
        // Gọi API đăng nhập
        authService.login({ username: email.trim(), password: password })
            .then((response) => {
                if (response.status === 'success') {
                    login(response.data);
                    toast.success("Đăng nhập thành công!");
                    navigate('/'); // Chuyển hướng về trang chính
                } else {
                    const msg = response.message || "Tài khoản hoặc mật khẩu không chính xác!";
                    setErrorMessage(msg);
                    toast.error(msg);
                }
            })
            .catch((error) => {
                console.error('Login failed:', error);
                const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : "Tài khoản hoặc mật khẩu không chính xác!");
                setErrorMessage(msg);
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (errorMessage) setErrorMessage('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errorMessage) setErrorMessage('');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img className='logo-login' src={logo} alt='logo' />
                    <p>Đăng nhập hệ thống quản lý</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <div className="input-group">
                        <FontAwesomeIcon icon={faUser} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Nhập tài khoản"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faLock} className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            autoComplete="current-password"
                        />
                        <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#">DESIGN BY MAITIENLONG</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
