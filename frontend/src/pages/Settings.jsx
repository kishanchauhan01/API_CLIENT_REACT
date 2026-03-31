import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function Settings() {
  const { theme, setTheme, interceptor, setInterceptor, logout } = useApp();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete('/user/account');
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const themeOptions = [
    { value: 'dark',   label: 'Dark',   icon: <Moon size={18} />,    desc: 'Dark background with light text' },
    { value: 'light',  label: 'Light',  icon: <Sun size={18} />,     desc: 'Light background with dark text' },
    { value: 'system', label: 'System', icon: <Monitor size={18} />, desc: 'Follow your OS preference' },
  ];

  return (
    <div className="flex-1 p-8 overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Settings</h1>

        <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>

          {/* Theme */}
          <div className="p-8" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Choose your preferred color theme.</p>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all text-center"
                  style={{
                    background: theme === opt.value ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    border: theme === opt.value ? '2px solid var(--accent)' : '2px solid var(--border-default)',
                    color: theme === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.icon}
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interceptor */}
          <div className="p-8" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Interceptor</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Choose how requests are routed. <strong style={{ color: 'var(--text-primary)' }}>Proxy</strong> sends
              requests through the server proxy. <strong style={{ color: 'var(--text-primary)' }}>Browser</strong>{' '}
              sends requests directly from your browser.
            </p>
            <div className="space-y-3">
              {[
                { value: 'proxy', title: 'Proxy', desc: 'Requests are tunnelled through the server proxy. Bypasses CORS and browser restrictions. History is recorded automatically.' },
                { value: 'browser', title: 'Browser', desc: 'Requests are made directly from your browser. Subject to CORS policies.' },
              ].map(opt => (
                <label key={opt.value}
                  className="flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors"
                  style={{
                    border: interceptor === opt.value ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                    background: interceptor === opt.value ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                  }}>
                  <input type="radio" name="interceptor" value={opt.value}
                    checked={interceptor === opt.value} onChange={() => setInterceptor(opt.value)}
                    className="mt-1 accent-[#FF3B30]" />
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{opt.title}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-red-500 mb-6">Danger Zone</h2>
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
              <div>
                <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Delete Account</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Permanently remove your account and all data.</p>
              </div>
              <button onClick={handleDeleteAccount} disabled={deleting}
                className="font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
