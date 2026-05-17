import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  Login,
  VerifyOTP,
  EmailLogin,
  EmailRegister,
  ForgotPassword,
  Onboarding,
  ProtectedRoute,
  UserProfile
} from './components/auth';
import { Dashboard } from './pages/Dashboard';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { MarketPrices } from './pages/MarketPrices';
import { PlantingCalendar } from './pages/PlantingCalendar';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Offline Indicator */}
          {!isOnline && (
            <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
              <span>📡 Offline Mode - Some features may be limited</span>
            </div>
          )}

          {/* Routes */}
          <Routes>
            {/* Public Routes - Phone Auth */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/verify-otp" element={<VerifyOTP />} />
            
            {/* Public Routes - Email Auth */}
            <Route path="/auth/email-login" element={<EmailLogin />} />
            <Route path="/auth/email-register" element={<EmailRegister />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* Onboarding Route */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOnboarding>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireOnboarding>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Disease Detection Routes - Bypass auth for development */}
            <Route
              path="/disease-detection"
              element={<DiseaseDetection />}
            />
            
            <Route
              path="/market-prices"
              element={
                <ProtectedRoute requireOnboarding>
                  <MarketPrices />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/planting-calendar"
              element={
                <ProtectedRoute requireOnboarding>
                  <PlantingCalendar />
                </ProtectedRoute>
              }
            />
            
            {/* Default Route - Go directly to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

// Made with Bob

// Made with Bob
