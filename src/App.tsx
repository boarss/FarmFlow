import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login, VerifyOTP, Onboarding, ProtectedRoute, UserProfile } from './components/auth';

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
            {/* Public Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/verify-otp" element={<VerifyOTP />} />
            
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
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

// Temporary Dashboard Component
function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          🌾 FarmFlow Dashboard
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Welcome to your farming assistant!
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">
            Your Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Authentication system is now active! You can access protected features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">🔍 Crop Disease Detection</h3>
              <p className="text-sm text-gray-600">
                Take photos of your crops and get instant disease identification
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">💰 Market Prices</h3>
              <p className="text-sm text-gray-600">
                Get real-time market prices and connect with buyers
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">📅 Planting Calendar</h3>
              <p className="text-sm text-gray-600">
                Know the best time to plant based on your location
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">📝 Farm Records</h3>
              <p className="text-sm text-gray-600">
                Track your farm activities and harvest data
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              ✅ <strong>Authentication System Active!</strong><br />
              You are now logged in and can access all features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
