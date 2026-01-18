import './App.css';
import { ModalProvider } from './screens/ModalContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './screens/Login/LoginPage';
import { AuthProvider } from './screens/Login/AuthContext/AuthContext';
import ProtectedRoute from './screens/Login/AuthContext/ProtectedRoute';
import { Toaster } from 'sonner';
import { LoadingProvider, useLoading } from "./context/LoadingContext";

import MainV2 from './UI/MainV2';


function App() {
  return (
    <div>
      <ModalProvider>
        <LoadingProvider>
          <Toaster position="top-right" richColors />
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path='/*' exact element={<MainV2 />} />
              </Route>
            </Routes>
          </AuthProvider>
        </LoadingProvider>
      </ModalProvider>
    </div>
  );
}

export default App;
