import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { isTokenExpired, logoutAndRedirect } from '../../../utils/authUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // State sẽ chứa thông tin user nếu đã đăng nhập, hoặc null nếu chưa
    const [user, setUser] = useState(null);

    const logout = useCallback(() => {
        logoutAndRedirect('logout');
        setUser(null);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        
        if (token && isTokenExpired(token)) {
            logoutAndRedirect('expired');
            setUser(null);
            return;
        }

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // 1. Kiểm tra JWT token định kỳ (mỗi 30s) và khi người dùng quay lại tab (focus)
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('access_token');
            if (token && isTokenExpired(token)) {
                logoutAndRedirect('expired');
                setUser(null);
            }
        };

        const interval = setInterval(checkToken, 30000);
        window.addEventListener('focus', checkToken);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkToken);
        };
    }, []);

    const login = (userData, remember = false) => {
        const now = Date.now();
        localStorage.setItem('access_token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('lw_login_time', now.toString());
        localStorage.setItem('last_activity_time', now.toString());
        if (remember) {
            localStorage.setItem('lw_remember_login', 'true');
            localStorage.setItem('remember_me', 'true');
        } else {
            localStorage.removeItem('lw_remember_login');
            localStorage.removeItem('remember_me');
        }
        setUser(userData);
    };

    // Giá trị cần cung cấp cho các component con
    const value = {
        user,
        isLoggedIn: !!user, // Chuyển đổi user object thành boolean
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook để dễ dàng sử dụng auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
