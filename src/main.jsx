import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import CustomersPage from './pages/CustomersPage';
import InvoicePage from './pages/InvoicePage';
import CustomerDashboard from './pages/CustomerDashboard';
import KosanOwnerDashboard from './pages/KosanOwnerDashboard';
import KosanOwnerLogin from './pages/KosanOwnerLogin';
import ProtectedRoute from './components/ProtectedRoute';
import MitraLandingPage from './pages/MitraLandingPage';
//import RegistrationSuccess from './pages/RegistrationSuccess'
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<App />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route path="/customer/:customerId" element={<CustomerDashboard />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/mitra/:kosanId" element={<CustomersPage />} />
          <Route path="/mitra/landing" element={<MitraLandingPage />} />
          {/*<Route path="/pendaftaran-berhasil" element={<RegistrationSuccess />} />
          */}
          {/* Kosan Owner Login (Public) */}
          <Route path="/kosan-owner/login" element={<KosanOwnerLogin />} />
          
          {/* Kosan Owner Dashboard (Protected) */}
          <Route 
            path="/kosan/:kosanId/owner" 
            element={
              <ProtectedRoute requiredRole="mitra_owner">
                <KosanOwnerDashboard />
              </ProtectedRoute>
            }
          />

          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-bold text-gray-900">404 - Halaman Tidak Ditemukan</h1>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);