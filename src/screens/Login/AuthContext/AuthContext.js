import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // State sẽ chứa thông tin user nếu đã đăng nhập, hoặc null nếu chưa
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('access_token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Hàm logout
    const logout = () => {
       localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
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

// Tạo một custom hook để dễ dàng sử dụng context
export const useAuth = () => {
    return useContext(AuthContext);
};
