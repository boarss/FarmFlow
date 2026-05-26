import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateAndFormatPhone } from '../../utils/phoneValidation';
import { isValidEmail, normalizeEmail } from '../../utils/emailValidation';
import { Phone, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  
  // Phone State
  const [phone, setPhone] = useState('');
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithPhone, signInWithEmail, user, farmer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (!farmer) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, farmer, navigate]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validation = validateAndFormatPhone(phone);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid phone number');
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithPhone(validation.formatted);
      if (result.success) {
        navigate('/auth/verify-otp', {
          state: { phone: validation.formatted, display: validation.display }
        });
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      const result = await signInWithEmail(normalizedEmail, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        const errorMessage = (result.error as Error)?.message || 'Invalid email or password';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="FarmFlow Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FarmFlow
          </h1>
          <p className="text-gray-600">
            Your farming assistant for better yields
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => { setAuthMethod('phone'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                authMethod === 'phone' 
                  ? 'bg-white text-green-700 shadow-sm flex items-center justify-center' 
                  : 'text-gray-500 hover:text-gray-700 flex items-center justify-center'
              }`}
            >
              <Phone className="w-4 h-4 mr-2" /> Phone
            </button>
            <button
              onClick={() => { setAuthMethod('email'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                authMethod === 'email' 
                  ? 'bg-white text-green-700 shadow-sm flex items-center justify-center' 
                  : 'text-gray-500 hover:text-gray-700 flex items-center justify-center'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" /> Email
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sign In
          </h2>

          {/* Form Context based on authMethod */}
          {authMethod === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError('');
                    }}
                    placeholder="080XXXXXXXX"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                    autoComplete="tel"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter your Nigerian phone number
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  We'll send you a one-time password (OTP) via SMS
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your.email@example.com"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link 
                    to="/auth/forgot-password" 
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/auth/email-register" className="font-medium text-green-600 hover:text-green-700">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-xs text-gray-600">Disease Detection</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-xs text-gray-600">Market Prices</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-xs text-gray-600">Planting Calendar</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-xs text-gray-600">Farm Records</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob