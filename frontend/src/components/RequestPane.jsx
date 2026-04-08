import { Plus, Trash2, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// ─── Reusable key-value table ──────────────────────────────────
function KeyValueTable({ rows, setRows, keyLabel = 'Key', valueLabel = 'Value', showDescription = true }) {
  const addRow = () => setRows(r => [...r, { id: Date.now(), key: '', value: '', description: '', enabled: true }]);
  const removeRow = (id) => setRows(r => r.length <= 1 ? r : r.filter(row => row.id !== id));
  const updateRow = (id, field, val) => setRows(r => r.map(row => row.id === id ? { ...row, [field]: val } : row));
  const clearAll = () => setRows([{ id: Date.now(), key: '', value: '', description: '', enabled: true }]);

  const cols = showDescription ? 'grid-cols-[32px_1fr_1fr_1fr_48px]' : 'grid-cols-[32px_1fr_1fr_48px]';

  return (
    <div className="flex flex-col overflow-auto">
      {/* Header */}
      <div className={`grid ${cols} text-[10px] font-semibold uppercase tracking-wider`}
        style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
        <div className="px-1 py-2 flex items-center justify-center" />
        <div className="px-3 py-2" style={{ borderLeft: '1px solid var(--border-default)' }}>{keyLabel}</div>
        <div className="px-3 py-2" style={{ borderLeft: '1px solid var(--border-default)' }}>{valueLabel}</div>
        {showDescription && <div className="px-3 py-2" style={{ borderLeft: '1px solid var(--border-default)' }}>Description</div>}
        <div className="px-1 py-2 flex items-center justify-center gap-1" style={{ borderLeft: '1px solid var(--border-default)' }}>
          <button onClick={clearAll} title="Clear all" className="transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={11} /></button>
          <button onClick={addRow} title="Add row" className="transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Plus size={11} /></button>
        </div>
      </div>
      {/* Rows */}
      {rows.map((row) => (
        <div key={row.id} className={`grid ${cols} group transition-colors`}
          style={{ borderBottom: '1px solid var(--border-light)', opacity: row.enabled ? 1 : 0.3 }}>
          <div className="flex items-center justify-center" style={{ borderRight: '1px solid var(--border-light)' }}>
            <button onClick={() => updateRow(row.id, 'enabled', !row.enabled)}
              className="w-4 h-4 rounded flex items-center justify-center transition-colors"
              style={{ border: `1px solid ${row.enabled ? '#22c55e' : 'var(--border-default)'}`, background: row.enabled ? 'rgba(34,197,94,0.2)' : 'transparent', color: row.enabled ? '#22c55e' : 'transparent' }}>
              <Check size={10} />
            </button>
          </div>
          <div style={{ borderRight: '1px solid var(--border-light)' }}>
            <input value={row.key} onChange={e => updateRow(row.id, 'key', e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm font-mono focus:outline-none" placeholder={keyLabel}
              style={{ color: 'var(--text-primary)' }} />
          </div>
          <div style={{ borderRight: '1px solid var(--border-light)' }}>
            <input value={row.value} onChange={e => updateRow(row.id, 'value', e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm font-mono focus:outline-none" placeholder={valueLabel}
              style={{ color: 'var(--text-primary)' }} />
          </div>
          {showDescription && (
            <div style={{ borderRight: '1px solid var(--border-light)' }}>
              <input value={row.description || ''} onChange={e => updateRow(row.id, 'description', e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none" placeholder="Description"
                style={{ color: 'var(--text-tertiary)' }} />
            </div>
          )}
          <div className="flex items-center justify-center">
            <button onClick={() => removeRow(row.id)} className="opacity-0 group-hover:opacity-100 transition-all p-1"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 text-xs transition-colors w-fit"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <Plus size={12} /> Add entry
      </button>
    </div>
  );
}

function ParamsPane({ rows, setRows }) {
  return <KeyValueTable rows={rows} setRows={setRows} keyLabel="Parameter" valueLabel="Value" />;
}

const bodyModes = [
  { key: 'none',                  label: 'None' },
  { key: 'json',                  label: 'JSON' },
  { key: 'form-data',            label: 'Form Data' },
  { key: 'x-www-form-urlencoded', label: 'URL Encoded' },
  { key: 'raw',                  label: 'Raw' },
];

function BodyPane({ bodyMode, setBodyMode, rawBody, setRawBody, formData, setFormData, rawContentType, setRawContentType }) {
  const [jsonError, setJsonError] = useState(null);

  const handleJsonChange = (val) => {
    setRawBody(val);
    if (bodyMode === 'json' && val.trim()) {
      try { JSON.parse(val); setJsonError(null); } catch (e) { setJsonError(e.message); }
    } else { setJsonError(null); }
  };

  const formatJson = () => {
    try { const formatted = JSON.stringify(JSON.parse(rawBody), null, 2); setRawBody(formatted); setJsonError(null); }
    catch (e) { setJsonError(e.message); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-0.5 px-3 py-2 flex-wrap"
        style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
        {bodyModes.map(m => (
          <button key={m.key} onClick={() => setBodyMode(m.key)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: bodyMode === m.key ? 'var(--accent-soft)' : 'transparent',
              color: bodyMode === m.key ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: bodyMode === m.key ? 'inset 0 0 0 1px var(--accent-border)' : 'none',
            }}
            onMouseEnter={e => { if (bodyMode !== m.key) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
            onMouseLeave={e => { if (bodyMode !== m.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}>
            {m.label}
          </button>
        ))}
        {bodyMode === 'raw' && (
          <select value={rawContentType} onChange={e => setRawContentType(e.target.value)}
            className="ml-auto text-xs px-2 py-1 rounded focus:outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
            <option value="text/plain">Text</option>
            <option value="application/json">JSON</option>
            <option value="application/xml">XML</option>
            <option value="text/html">HTML</option>
          </select>
        )}
        {bodyMode === 'json' && (
          <button onClick={formatJson} className="ml-auto text-xs transition-colors px-2 py-1 rounded"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
            Beautify
          </button>
        )}
      </div>

      {bodyMode === 'none' && (
        <div className="flex-1 flex items-center justify-center text-sm">
          <div className="text-center">
            <p style={{ color: 'var(--text-tertiary)' }} className="mb-1">This request does not have a body</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs">Select a body type above to add content</p>
          </div>
        </div>
      )}

      {(bodyMode === 'json' || bodyMode === 'raw') && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {jsonError && bodyMode === 'json' && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs" style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle size={12} />
              <span className="truncate">{jsonError}</span>
            </div>
          )}
          <textarea value={rawBody} onChange={e => handleJsonChange(e.target.value)}
            className="flex-1 font-mono text-sm p-4 resize-none focus:outline-none"
            style={{ background: 'var(--bg-deep)', color: 'var(--code-green)' }}
            spellCheck={false}
            placeholder={bodyMode === 'json' ? '{\n  "key": "value"\n}' : 'Enter raw body content...'} />
        </div>
      )}

      {(bodyMode === 'form-data' || bodyMode === 'x-www-form-urlencoded') && (
        <div className="flex-1 overflow-auto">
          <KeyValueTable rows={formData} setRows={setFormData} keyLabel="Key" valueLabel="Value" showDescription={false} />
        </div>
      )}
    </div>
  );
}

function HeadersPane({ rows, setRows }) {
  return <KeyValueTable rows={rows} setRows={setRows} keyLabel="Header" valueLabel="Value" />;
}

function AuthPane({ authType, setAuthType, authData, setAuthData }) {
  const update = (field, val) => setAuthData(prev => ({ ...prev, [field]: val }));
  const [showToken, setShowToken] = useState(false);

  const authTypes = [
    { key: 'none',    label: 'None',         icon: '🚫' },
    { key: 'bearer',  label: 'Bearer Token', icon: '🔑' },
    { key: 'basic',   label: 'Basic Auth',   icon: '👤' },
    { key: 'apikey',  label: 'API Key',      icon: '🗝️' },
  ];

  const inputStyle = { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-48 flex-shrink-0" style={{ borderRight: '1px solid var(--border-default)', background: 'var(--bg-subtle)' }}>
        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>Auth Type</p>
        {authTypes.map(t => (
          <button key={t.key} onClick={() => setAuthType(t.key)}
            className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors"
            style={{
              background: authType === t.key ? 'var(--bg-elevated)' : 'transparent',
              color: authType === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderLeft: authType === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
            <span className="text-base">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {authType === 'none' && (
          <div className="flex items-center justify-center h-full text-sm">
            <div className="text-center">
              <p className="text-2xl mb-2">🔓</p>
              <p style={{ color: 'var(--text-secondary)' }}>No authentication</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">This request does not use any authorization.</p>
            </div>
          </div>
        )}

        {authType === 'bearer' && (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Token</label>
              <div className="relative">
                <input type={showToken ? 'text' : 'password'} value={authData.token}
                  onChange={e => update('token', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm font-mono pr-12 focus:outline-none" style={inputStyle}
                  placeholder="Enter your bearer token..." />
                <button type="button" onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Sent as: <code className="px-1 rounded" style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>Authorization: Bearer &lt;token&gt;</code>
              </p>
            </div>
          </div>
        )}

        {authType === 'basic' && (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input value={authData.username} onChange={e => update('username', e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="Username" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" value={authData.password} onChange={e => update('password', e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none" style={inputStyle} placeholder="Password" />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sent as: <code className="px-1 rounded" style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>Authorization: Basic base64(username:password)</code>
            </p>
          </div>
        )}

        {authType === 'apikey' && (
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Header Name</label>
              <input value={authData.apiKeyName} onChange={e => update('apiKeyName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm font-mono focus:outline-none" style={inputStyle} placeholder="X-Api-Key" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Value</label>
              <input value={authData.apiKeyValue} onChange={e => update('apiKeyValue', e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm font-mono focus:outline-none" style={inputStyle} placeholder="Your API key..." />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sent as header: <code className="px-1 rounded" style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}>{authData.apiKeyName || 'X-Api-Key'}: &lt;value&gt;</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScriptPane({ label }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 flex items-center justify-between"
        style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>JavaScript</span>
      </div>
      <textarea className="flex-1 font-mono text-sm p-4 resize-none focus:outline-none"
        style={{ background: 'var(--bg-deep)', color: 'var(--code-yellow)' }}
        spellCheck={false}
        placeholder={`// Write your ${label.toLowerCase()} here...\n// Example:\n// console.log("Request sent!");`} />
    </div>
  );
}

export default function RequestPane({
  activeTab, params, setParams, headers, setHeaders,
  rawBody, setRawBody, bodyMode, setBodyMode, formData, setFormData,
  rawContentType, setRawContentType, authType, setAuthType, authData, setAuthData,
}) {
  const panes = {
    Params: <ParamsPane rows={params} setRows={setParams} />,
    Body: <BodyPane bodyMode={bodyMode} setBodyMode={setBodyMode} rawBody={rawBody} setRawBody={setRawBody}
      formData={formData} setFormData={setFormData} rawContentType={rawContentType} setRawContentType={setRawContentType} />,
    Headers: <HeadersPane rows={headers} setRows={setHeaders} />,
    Auth: <AuthPane authType={authType} setAuthType={setAuthType} authData={authData} setAuthData={setAuthData} />,
    PreScript: <ScriptPane label="Pre-request Script" />,
    PostScript: <ScriptPane label="Post-request Script" />,
  };

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg-base)' }}>
      {panes[activeTab] || <ParamsPane rows={params} setRows={setParams} />}
    </div>
  );
}
