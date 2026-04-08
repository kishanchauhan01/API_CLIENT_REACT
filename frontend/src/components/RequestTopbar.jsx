import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Save, Layers, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

const methods = [
  { label: 'GET',     color: '#4ade80' },
  { label: 'POST',    color: '#60a5fa' },
  { label: 'PUT',     color: '#facc15' },
  { label: 'PATCH',   color: '#fb923c' },
  { label: 'DELETE',  color: '#f87171' },
  { label: 'HEAD',    color: '#c084fc' },
  { label: 'OPTIONS', color: '#f472b6' },
];

export function getMethodColor(method) {
  return methods.find(m => m.label === method)?.color || '#9ca3af';
}

function MethodDropdown({ method, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = methods.find(m => m.label === method) || methods[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-l-lg transition-colors focus:outline-none min-w-[110px] justify-between"
        style={{ background: `${selected.color}15`, border: '1px solid var(--border-default)', borderRight: 'none' }}
      >
        <span className="font-bold text-sm" style={{ color: selected.color }}>{method}</span>
        <ChevronDown size={13} style={{ color: 'var(--text-secondary)', transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl shadow-2xl z-30 w-40 overflow-hidden py-1"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          {methods.map(m => (
            <button key={m.label} onClick={() => { onChange(m.label); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2"
              style={{ color: m.color, background: method === m.label ? 'var(--bg-elevated)' : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => { if (method !== m.label) e.currentTarget.style.background = 'transparent'; }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: method === m.label ? m.color : 'transparent' }} />
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EnvSelector() {
  const { environments, activeEnvId, setActiveEnvironment } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeEnv = environments.find(e => e.id === activeEnvId);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors focus:outline-none max-w-[180px]"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
        <Layers size={14} style={{ color: activeEnv ? '#4ade80' : 'var(--text-muted)' }} />
        <span className="text-sm truncate hidden sm:block max-w-[110px]" style={{ color: 'var(--text-primary)' }}>
          {activeEnv ? activeEnv.name : 'No Env'}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-secondary)', transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 rounded-xl shadow-2xl z-30 w-56 overflow-hidden py-1"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider px-4 py-2" style={{ color: 'var(--text-muted)' }}>Environments</p>
          <button onClick={() => { setActiveEnvironment(null); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
            style={{ color: !activeEnvId ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: !activeEnvId ? 'var(--text-secondary)' : 'transparent', border: activeEnvId ? '1px solid var(--border-default)' : 'none' }} />
            No Environment
          </button>
          {environments.map(env => (
            <button key={env.id} onClick={() => { setActiveEnvironment(env.id); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
              style={{ color: activeEnvId === env.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: activeEnvId === env.id ? '#4ade80' : 'transparent', border: activeEnvId !== env.id ? '1px solid var(--border-default)' : 'none' }} />
              <span className="truncate">{env.name}</span>
              {activeEnvId === env.id && <span className="ml-auto text-xs font-medium" style={{ color: '#4ade80' }}>active</span>}
            </button>
          ))}
          {environments.length === 0 && <p className="text-xs px-4 py-2 text-center" style={{ color: 'var(--text-muted)' }}>No environments yet</p>}
        </div>
      )}
    </div>
  );
}

export default function RequestTopbar({ method, setMethod, url, onUrlChange, loading, onSend, onSave }) {
  return (
    <div className="flex items-center gap-2 p-3 flex-wrap"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
      <MethodDropdown method={method} onChange={setMethod} />
      <input type="text" value={url} onChange={e => onUrlChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
        placeholder="Enter request URL..."
        className="flex-1 min-w-0 px-4 py-2.5 rounded-r-lg text-sm font-mono focus:outline-none"
        style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderLeft: 'none' }} />
      <EnvSelector />
      <button onClick={onSend} disabled={loading}
        className="font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg min-w-[80px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-white"
        style={{ background: 'var(--accent)' }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
        {loading ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14} /> Send</>}
      </button>
      <button onClick={onSave}
        className="font-medium px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}>
        <Save size={15} />
        <span className="hidden sm:block text-sm">Save</span>
      </button>
    </div>
  );
}
