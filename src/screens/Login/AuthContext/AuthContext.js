import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { isTokenExpired, logoutAndRedirect } from '../../../utils/authUtils';

const AuthContext = createContext(null);

// Thời gian tự động đăng xuất khi không có hoạt động (15 phút)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    // State sẽ chứa thông tin user nếu đã đăng nhập, hoặc null nếu chưa
    const [user, setUser] = useState(null);
    const lastActivityRef = useRef(Date.now());

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

    // 2. Logic tự động đăng xuất sau 15 phút không có hoạt động
    useEffect(() => {
        if (!user) return; // Chỉ theo dõi khi người dùng đã đăng nhập

        const now = Date.now();
        lastActivityRef.current = now;
        localStorage.setItem('last_activity_time', now.toString());

        let lastThrottle = 0;
        const updateActivity = () => {
            const current = Date.now();
            // Throttle 1 giây để tối ưu hiệu năng
            if (current - lastThrottle > 1000) {
                lastThrottle = current;
                lastActivityRef.current = current;
                localStorage.setItem('last_activity_time', current.toString());
            }
        };

        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointermove'];
        activityEvents.forEach(evt => {
            window.addEventListener(evt, updateActivity, { passive: true });
        });

        // Periodic check mỗi 5 giây
        const inactivityCheckInterval = setInterval(() => {
            const current = Date.now();
            const storedLastActivity = parseInt(localStorage.getItem('last_activity_time') || '0', 10);
            const latestActivity = Math.max(lastActivityRef.current, storedLastActivity || 0);

            if (current - latestActivity >= INACTIVITY_TIMEOUT_MS) {
                console.warn("Tự động đăng xuất do không hoạt động trong 15 phút.");
                logoutAndRedirect('inactivity');
                setUser(null);
            }
        }, 5000);

        return () => {
            activityEvents.forEach(evt => {
                window.removeEventListener(evt, updateActivity);
            });
            clearInterval(inactivityCheckInterval);
        };
    }, [user]);

    const login = (userData) => {
        const now = Date.now();
        localStorage.setItem('access_token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('last_activity_time', now.toString());
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
