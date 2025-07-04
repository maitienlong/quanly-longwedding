import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        // Nếu chưa đăng nhập, chuyển hướng về trang /login
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-layout">
            <main className="main-content-layout">
                {/* Outlet sẽ render component con tương ứng với route */}
                <Outlet /> 
            </main>
        </div>
    );
};

export default ProtectedRoute;