import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';
import { useApp } from '../context/AppContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault(); setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try { const res = await api.post('/auth/signup', { email, username, password }); login(res.data.token, res.data.user); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Signup failed.'); }
    finally { setLoading(false); }
  };

  const iStyle = { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-xl font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>Join us <span className="font-medium text-xl ml-2" style={{ color: 'var(--text-primary)' }}>and start building today</span></h1>
        </div>
        <div className="rounded-xl p-6 sm:p-8 shadow-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-md transition-colors focus:outline-none" style={iStyle} placeholder="JohnDoe@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="username" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-md transition-colors focus:outline-none" style={iStyle} placeholder="JohnDoejc1" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-md transition-colors pr-12 focus:outline-none" style={iStyle} placeholder="Must be 8 characters long" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirm-password" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-md transition-colors pr-12 focus:outline-none" style={iStyle} placeholder="Must match the password" required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full disabled:opacity-60 text-white font-medium py-3 rounded-md transition-colors mt-6 flex items-center justify-center gap-2" style={{ background: 'var(--accent)' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</> : 'Sign up'}
            </button>
            <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" className="hover:underline" style={{ color: '#60a5fa' }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
