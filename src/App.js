import React, { Suspense, lazy } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './screens/Login/LoginPage';
import { AuthProvider } from './screens/Login/AuthContext/AuthContext';
import ProtectedRoute from './screens/Login/AuthContext/ProtectedRoute';
import { Toaster } from 'sonner';
import { LoadingProvider } from "./context/LoadingContext";
import MainV2 from './UI/MainV2';

const ClientPortal = lazy(() => import('./screens/ClientPortal/ClientPortal'));

function App() {
  return (
    <div>
      <LoadingProvider>
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Đang tải trang...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/my-wedding/:maHopDong" element={<ClientPortal />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/*" exact element={<MainV2 />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </LoadingProvider>
    </div>
  );
}

export default App;
