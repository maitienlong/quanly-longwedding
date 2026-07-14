import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng về trang /login
        return <Navigate to="/login" replace />;
    }

      return <Outlet />;
};

export default ProtectedRoute;
