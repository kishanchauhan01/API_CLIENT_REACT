import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // Redirect if no email in state (e.g. page refresh)
  if (!email) return <Navigate to="/forgot-password" replace />;

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    setError('');
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const updated = [...digits];
    pasted.split('').forEach((ch, i) => { updated[i] = ch; });
    setDigits(updated);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: code });
      // Navigate to reset password screen with resetToken
      navigate('/reset-password', { state: { email, resetToken: res.data.resetToken } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    setCountdown(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
    try {
      await api.post('/auth/forgot-password', { email });
    } catch {
      // Silent fail on resend
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg-base)'}}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background:'var(--accent-soft)',border:'1px solid var(--accent-border)'}}>
            <ShieldCheck size={28} style={{color:'var(--accent)'}} />
          </div>
          <h1 className="text-3xl font-bold" style={{color:'var(--text-primary)'}}>Check your email</h1>
          <p className="text-sm mt-2" style={{color:'var(--text-secondary)'}}>
            We sent a 6-digit code to <span className="font-medium" style={{color:'var(--text-primary)'}}>{email}</span>
          </p>
          <p className="text-yellow-400/80 text-xs mt-1">
            (Check the backend console for the OTP)
          </p>
        </div>

        <div className="rounded-xl p-6 sm:p-8 shadow-2xl" style={{background:'var(--bg-surface)',border:'1px solid var(--border-default)'}}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP boxes */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 text-center text-xl font-bold rounded-lg transition-colors focus:outline-none"
                  style={{ height: '3.25rem', background:'var(--bg-input)', color:'var(--text-primary)', border: error ? '1px solid #ef4444' : digit ? '1px solid var(--accent)' : '1px solid var(--border-default)' }}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-60 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2" style={{background:'var(--accent)'}}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Resend */}
            <p className="text-center text-sm" style={{color:'var(--text-secondary)'}}>
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span className="text-gray-500">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="hover:underline font-medium" style={{color:'#60a5fa'}}
                >
                  Resend OTP
                </button>
              )}
            </p>
          </form>
        </div>

        <p className="text-center text-sm mt-6 flex items-center justify-center gap-1" style={{color:'var(--text-secondary)'}}>
          <ArrowLeft size={14} />
          <Link to="/forgot-password" className="hover:underline" style={{color:'#60a5fa'}}>
            Change email
          </Link>
        </p>
      </div>
    </div>
  );
}
