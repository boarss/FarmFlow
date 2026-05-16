import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateAndFormatPhone } from '../../utils/phoneValidation';
import { Phone, Loader2 } from 'lucide-react';

export function Login() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithPhone } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setError('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate phone number
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <span className="text-3xl">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FarmFlow
          </h1>
          <p className="text-gray-600">
            Your farming assistant for better yields
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSendOTP} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                  onChange={handlePhoneChange}
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

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Submit Button */}
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
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              We'll send you a one-time password (OTP) via SMS
            </p>
          </div>
        </div>

        {/* Alternative Auth Method */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-green-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/auth/email-login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ✉️ Email & Password
            </Link>
          </div>
        </div>

        {/* Features */}
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