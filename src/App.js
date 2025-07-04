import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './screens/Login/LoginPage';
import { AuthProvider } from './screens/Login/AuthContext/AuthContext';
import ProtectedRoute from './screens/Login/AuthContext/ProtectedRoute';

import MainV2 from './UI/MainV2';


function App() {
  return (
    <div>

      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/*' exact element={<MainV2 />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
