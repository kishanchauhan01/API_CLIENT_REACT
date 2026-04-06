import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Settings, User, LogOut, Folder, Clock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useApp();

  const navItems = [
    { name: 'Request', path: '/', icon: <Globe size={20} /> },
    { name: 'Collections', path: '/collections', icon: <Folder size={20} /> },
    { name: 'Environments', path: '/environments', icon: <Layers size={20} /> },
    { name: 'History', path: '/history', icon: <Clock size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-16 md:w-60 h-full flex flex-col justify-between"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-default)' }}>
      <div>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <h1 className="font-bold text-xl hidden md:block" style={{ color: 'var(--text-primary)' }}>Your API's</h1>
          <h1 className="font-bold text-xl md:hidden text-center" style={{ color: 'var(--text-primary)' }}>Y</h1>
        </div>
        <nav className="p-2 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                {item.icon}
                <span className="hidden md:block font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-2" style={{ borderTop: '1px solid var(--border-default)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg transition-colors w-full"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <LogOut size={20} />
          <span className="hidden md:block font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
}
