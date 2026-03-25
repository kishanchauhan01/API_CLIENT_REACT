import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); navigate('/verify-otp', { state: { email } }); }
    catch (err) { setError(err.response?.data?.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const iStyle = { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
            <Mail size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Forgot Password?</h1>
          <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            No worries! Enter your email and we'll send you a one-time code to reset your password.
          </p>
        </div>
        <div className="rounded-xl p-6 sm:p-8 shadow-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="fp-email" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input id="fp-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md transition-colors focus:outline-none" style={iStyle} placeholder="JohnDoe@example.com" required />
            </div>
            <button type="submit" disabled={loading} className="w-full disabled:opacity-60 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center gap-2" style={{ background: 'var(--accent)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : 'Send OTP'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm mt-6 flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={14} /> <Link to="/login" className="hover:underline" style={{ color: '#60a5fa' }}>Back to Sign in</Link>
        </p>
      </div>
    </div>
  );
}
