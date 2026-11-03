import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    faUser, 
    faLock, 
    faEye, 
    faEyeSlash, 
    faRightToBracket
} from '@fortawesome/free-solid-svg-icons';
import './login.css';
import logo from '../../assets/logo/BETA-1 VANG.png';
import { toast } from 'sonner';
import { useAuth } from './AuthContext/AuthContext';
import authService from '../../API/services/authService';
import {
    getRememberedUsername,
    saveRememberedUsername,
    clearRememberedUsername,
    saveDeviceCredentials,
    clearDeviceCredentials
} from '../../utils/pinAuthUtils';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoggedIn } = useAuth();

    // Password login states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Initial Load: Check remembered username & default rememberMe to true
    useEffect(() => {
        const remembered = getRememberedUsername();
        if (remembered) {
            setEmail(remembered);
        }
        const savedRemember = localStorage.getItem('lw_remember_login');
        setRememberMe(savedRemember !== 'false');
    }, []);

    // 2. Reason redirect handler
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const reason = searchParams.get('reason');
        if (reason === 'expired') {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            navigate('/login', { replace: true });
        } else if (reason === 'inactivity') {
            toast.error("Bạn đã bị đăng xuất do không hoạt động!");
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    // 3. Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/tongquan');
        }
    }, [isLoggedIn, navigate]);

    // =========================================================================
    // PASSWORD LOGIN FLOW
    // =========================================================================

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!email.trim() || !password) {
            const msg = "Vui lòng nhập đầy đủ tài khoản và mật khẩu!";
            setErrorMessage(msg);
            toast.warning(msg);
            return;
        }

        setLoading(true);

        authService.login({ 
            username: email.trim(), 
            password,
            remember: Boolean(rememberMe)
        })
            .then(async (response) => {
                if (response.status === 'success' || response.data?.token) {
                    const userData = response.data;

                    // Handle Remember Me trên thiết bị cho phép
                    if (rememberMe) {
                        saveRememberedUsername(email.trim());
                        saveDeviceCredentials(email.trim(), password);
                        localStorage.setItem('lw_remember_login', 'true');
                        localStorage.setItem('remember_me', 'true');
                    } else {
                        clearRememberedUsername();
                        clearDeviceCredentials();
                        localStorage.removeItem('lw_remember_login');
                        localStorage.removeItem('remember_me');
                    }

                    login(userData, Boolean(rememberMe));
                    toast.success("Đăng nhập thành công!");
                    navigate('/tongquan');
                } else {
                    const msg = response.message || "Tài khoản hoặc mật khẩu không chính xác!";
                    setErrorMessage(msg);
                    toast.error(msg);
                }
            })
            .catch((error) => {
                console.error('Login failed:', error);
                const msg = error?.message || error?.response?.data?.message || "Tài khoản hoặc mật khẩu không chính xác!";
                setErrorMessage(msg);
                toast.error(msg);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Header */}
                <div className="login-header">
                    <img className='logo-login' src={logo} alt='logo' />
                    <h1>LONG WEDDING</h1>
                    <p>Hệ thống quản lý & điều hành</p>
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                {/* USERNAME & PASSWORD LOGIN FORM */}
                <form onSubmit={handlePasswordSubmit}>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faUser} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Tài khoản đăng nhập"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errorMessage) setErrorMessage('');
                            }}
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
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errorMessage) setErrorMessage('');
                            }}
                            required
                            autoComplete="current-password"
                        />
                        <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="remember-row">
                        <label className="custom-checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                        </label>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        <FontAwesomeIcon icon={faRightToBracket} style={{ marginRight: '8px' }} />
                        {loading ? "Đang xác thực..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="#/login">DESIGN BY MAITIENLONG • LONG WEDDING</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
