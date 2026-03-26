import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';
import api from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no resetToken in state (e.g. page refresh)
  if (!location.state?.resetToken) return <Navigate to="/login" replace />;

  // Simple strength indicator
  const strength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    } 
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg-base)'}}>
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
            <CheckCircle size={38} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{color:'var(--text-primary)'}}>Password reset!</h1>
          <p className="text-sm mb-8" style={{color:'var(--text-secondary)'}}>
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-block text-white font-medium py-3 px-8 rounded-md transition-colors" style={{background:'var(--accent)'}}
          >
            Back to Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'var(--bg-base)'}}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{background:'var(--accent-soft)',border:'1px solid var(--accent-border)'}}>
            <KeyRound size={28} style={{color:'var(--accent)'}} />
          </div>
          <h1 className="text-3xl font-bold" style={{color:'var(--text-primary)'}}>Set new password</h1>
          <p className="text-sm mt-2" style={{color:'var(--text-secondary)'}}>
            Must be at least 8 characters.
          </p>
        </div>

        <div className="rounded-xl p-6 sm:p-8 shadow-2xl" style={{background:'var(--bg-surface)',border:'1px solid var(--border-default)'}}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* New password */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="rp-password" style={{color:'var(--text-secondary)'}}>
                New Password
              </label>
              <div className="relative">
                <input
                  id="rp-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-md focus:outline-none transition-colors pr-12"
                  style={{background:'var(--bg-input)',color:'var(--text-primary)',border:'1px solid var(--border-default)'}}
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{color:'var(--text-secondary)'}}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColors[strength] : 'bg-[#333333]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Strength: <span className="font-medium text-white">{strengthLabel}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="rp-confirm" style={{color:'var(--text-secondary)'}}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="rp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-md focus:outline-none transition-colors pr-12"
                  style={{background:'var(--bg-input)',color:'var(--text-primary)',border: confirm && password !== confirm ? '1px solid #ef4444' : '1px solid var(--border-default)'}}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{color:'var(--text-secondary)'}}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-60 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2" style={{background:'var(--accent)'}}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting…
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{color:'var(--text-secondary)'}}>
          Remember your password?{' '}
          <Link to="/login" className="hover:underline" style={{color:'#60a5fa'}}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
