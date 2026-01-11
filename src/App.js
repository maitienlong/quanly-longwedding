import './App.css';

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
    </div>
  );
}

export default App;
