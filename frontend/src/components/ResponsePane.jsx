import { Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

function getStatusColor(status) {
  if (status >= 200 && status < 300) return { text: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' };
  if (status >= 300 && status < 400) return { text: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' };
  if (status >= 400 && status < 500) return { text: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' };
  if (status >= 500) return { text: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' };
  return { text: 'var(--text-secondary)', bg: 'var(--bg-elevated)', border: 'var(--border-default)' };
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded transition-colors" title="Copy"
      style={{ color: copied ? '#4ade80' : 'var(--text-muted)' }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = 'var(--text-muted)'; }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function ResponsePane({ response, responseTab, setResponseTab, onClose }) {
  const sc = getStatusColor(response.status);
  const headers = response.headers || {};
  const headerEntries = Object.entries(headers);

  const tabs = [
    { key: 'body', label: 'Body' },
    { key: 'headers', label: 'Headers', badge: headerEntries.length },
  ];

  return (
    <div className="flex flex-col h-1/2 overflow-hidden" style={{ borderTop: '2px solid var(--border-default)', background: 'var(--bg-deep)' }}>
      {/* Status bar */}
      <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
        style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Response</span>
        <span className="text-sm font-bold px-2.5 py-0.5 rounded-md" style={{ color: sc.text, background: sc.bg, border: `1px solid ${sc.border}` }}>
          {response.status} {response.statusText}
        </span>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          {response.duration && <span>Time: <span className="font-mono" style={{ color: '#4ade80' }}>{response.duration}</span></span>}
          {response.size && <span>Size: <span className="font-mono" style={{ color: '#60a5fa' }}>{response.size}</span></span>}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <CopyButton text={response.body || ''} />
          <button onClick={onClose} className="p-1 rounded transition-colors" title="Close"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setResponseTab(tab.key)}
            className="px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{
              color: responseTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: responseTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            {tab.label}
            {tab.badge != null && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {responseTab === 'body' && (
          <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words leading-relaxed" style={{ color: 'var(--code-green)' }}>
            {response.body || '(empty response)'}
          </pre>
        )}
        {responseTab === 'headers' && (
          <div>
            {headerEntries.length === 0 ? (
              <p className="text-sm text-center p-6" style={{ color: 'var(--text-muted)' }}>No response headers available</p>
            ) : headerEntries.map(([key, value]) => (
              <div key={key} className="flex items-start px-4 py-2.5 group transition-colors"
                style={{ borderBottom: '1px solid var(--border-light)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="text-xs font-mono font-semibold w-48 flex-shrink-0 truncate" style={{ color: '#60a5fa' }}>{key}</span>
                <span className="text-xs font-mono flex-1 break-all" style={{ color: 'var(--text-secondary)' }}>{value}</span>
                <CopyButton text={value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
