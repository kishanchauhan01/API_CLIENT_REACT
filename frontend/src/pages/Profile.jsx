import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

export default function Profile() {
  const { user, setUser } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      const res = await api.put('/user/profile', { displayName, bio });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };

  return (
    <div className="flex-1 p-8 overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Your Profile</h1>

        <div className="rounded-xl p-8 shadow-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-default)' }}>
              <User size={48} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.displayName || user?.username || 'User'}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{user?.email || ''}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-md focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" value={user?.email || ''} className="w-full px-4 py-3 rounded-md focus:outline-none opacity-60" style={inputStyle} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bio</label>
              <textarea className="w-full px-4 py-3 rounded-md focus:outline-none" rows="4"
                placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} style={inputStyle} />
            </div>

            {success && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                {success}
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="disabled:opacity-60 text-white font-medium py-3 px-6 rounded-md transition-colors mt-4 flex items-center gap-2"
              style={{ background: 'var(--accent)' }}>
              {saving ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
