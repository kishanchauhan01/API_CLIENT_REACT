import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen w-full flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
