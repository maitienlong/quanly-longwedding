import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // State sẽ chứa thông tin user nếu đã đăng nhập, hoặc null nếu chưa
    const [user, setUser] = useState(null);

    // Hàm login sẽ được gọi từ trang LoginPage
    const login = (userData) => {
        // Trong thực tế, bạn sẽ nhận token từ API và lưu vào đây
        setUser(userData); 
    };

    // Hàm logout
    const logout = () => {
        setUser(null);
        // Xóa token trong localStorage nếu có
    };

    // Giá trị cần cung cấp cho các component con
    const value = {
        user,
        isLoggedIn: true, // Chuyển đổi user object thành boolean
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Tạo một custom hook để dễ dàng sử dụng context
export const useAuth = () => {
    return useContext(AuthContext);
};