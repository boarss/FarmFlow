import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { maskPhoneNumber } from '../../utils/phoneValidation';

export function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOTP, signInWithPhone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const phone = location.state?.phone || '';
  const displayPhone = location.state?.display || phone;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const otpCode = [...newOtp.slice(0, 5), value].join('');
      handleVerify(otpCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP(phone, code);
      
      if (result.success) {
        // Check if user needs onboarding
        navigate('/onboarding');
      } else {
        setError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError('');

    try {
      const result = await signInWithPhone(phone);
      
      if (result.success) {
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/auth/login')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verify Your Phone
            </h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to
            </p>
            <p className="text-gray-900 font-medium mt-1">
              {maskPhoneNumber(displayPhone)}
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || otp.join('').length !== 6}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend in {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your phone number is secure and will not be shared
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob