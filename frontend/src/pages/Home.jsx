import { useState, useCallback, useRef } from 'react';
import { FolderPlus } from 'lucide-react';
import RequestTopbar from '../components/RequestTopbar';
import RequestTabs from '../components/RequestTabs';
import RequestPane from '../components/RequestPane';
import ResponsePane from '../components/ResponsePane';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

// ─── helpers ──────────────────────────────────────────────────
function parseUrlParams(url) {
  try {
    const qIdx = url.indexOf('?');
    if (qIdx === -1) return [];
    const qs = url.slice(qIdx + 1);
    if (!qs) return [];
    return qs.split('&').map((pair, i) => {
      const [k = '', v = ''] = pair.split('=').map(decodeURIComponent);
      return { id: Date.now() + i, key: k, value: v, description: '', enabled: true };
    });
  } catch { return []; }
}

function buildUrlFromParams(baseUrl, params) {
  const base = baseUrl.split('?')[0];
  const enabled = params.filter(p => p.enabled && p.key.trim());
  if (enabled.length === 0) return base;
  const qs = enabled.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
  return `${base}?${qs}`;
}

function buildHeaders(headerRows, authType, authData, contentType) {
  const hdrs = {};
  headerRows.filter(h => h.enabled && h.key.trim()).forEach(h => { hdrs[h.key.trim()] = h.value; });

  // Auto content-type (only if user hasn't set one)
  if (contentType && !hdrs['Content-Type'] && !hdrs['content-type']) {
    hdrs['Content-Type'] = contentType;
  }

  // Auth injection
  if (authType === 'bearer' && authData.token) {
    hdrs['Authorization'] = `Bearer ${authData.token}`;
  } else if (authType === 'basic' && authData.username) {
    hdrs['Authorization'] = `Basic ${btoa(`${authData.username}:${authData.password}`)}`;
  } else if (authType === 'apikey' && authData.apiKeyName && authData.apiKeyValue) {
    hdrs[authData.apiKeyName] = authData.apiKeyValue;
  }
  return hdrs;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ──────────────────────────────────────────────────────────────
export default function Home() {
  const { collections, addCollection, addRequestToCollection, interceptor } = useApp();

  // ─── Request state ──────────────────────────────────────────
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [activeTab, setActiveTab] = useState('Params');
  const [loading, setLoading] = useState(false);

  // Params (bidirectional with URL)
  const [params, setParams] = useState([{ id: 1, key: '', value: '', description: '', enabled: true }]);
  const urlSyncRef = useRef(false); // prevent infinite loop

  // Headers
  const [headers, setHeaders] = useState([
    { id: 1, key: 'Accept', value: 'application/json', description: '', enabled: true },
  ]);

  // Body
  const [bodyMode, setBodyMode] = useState('none'); // none | json | form-data | x-www-form-urlencoded | raw
  const [rawBody, setRawBody] = useState('{\n  \n}');
  const [formData, setFormData] = useState([{ id: 1, key: '', value: '', type: 'text', enabled: true }]);
  const [rawContentType, setRawContentType] = useState('application/json');

  // Auth
  const [authType, setAuthType] = useState('none');
  const [authData, setAuthData] = useState({ token: '', username: '', password: '', apiKeyName: 'X-Api-Key', apiKeyValue: '' });

  // Response
  const [response, setResponse] = useState(null);
  const [responseTab, setResponseTab] = useState('body');

  // Save modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', collectionId: '', newCollName: '' });
  const [currentRequest, setCurrentRequest] = useState(null);
  const [saveMode, setSaveMode] = useState('existing');
  const [saving, setSaving] = useState(false);

  // ─── URL ↔ Params sync ─────────────────────────────────────
  const handleUrlChange = useCallback((newUrl) => {
    setUrl(newUrl);
    // Sync params from URL
    urlSyncRef.current = true;
    const parsed = parseUrlParams(newUrl);
    if (parsed.length > 0) {
      setParams(parsed);
    } else {
      // Keep at least one empty row
      setParams(prev => {
        const hasContent = prev.some(p => p.key.trim());
        if (!hasContent) return prev;
        return [{ id: Date.now(), key: '', value: '', description: '', enabled: true }];
      });
    }
    urlSyncRef.current = false;
  }, []);

  const handleParamsChange = useCallback((updater) => {
    setParams(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Sync URL from params (only when user edits params, not when URL changes)
      if (!urlSyncRef.current) {
        setUrl(prevUrl => buildUrlFromParams(prevUrl, next));
      }
      return next;
    });
  }, []);

  // ─── Send Request ──────────────────────────────────────────
  const handleSend = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResponse(null);
    setResponseTab('body');

    const finalUrl = buildUrlFromParams(url, params);

    // Determine content type
    let contentType = null;
    if (bodyMode === 'json') contentType = 'application/json';
    else if (bodyMode === 'x-www-form-urlencoded') contentType = 'application/x-www-form-urlencoded';
    else if (bodyMode === 'raw') contentType = rawContentType;
    // form-data: browser sets multipart boundary automatically, don't set content-type

    const reqHeaders = buildHeaders(headers, authType, authData, contentType);

    // Build body
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
    let reqBody = null;
    if (hasBody && bodyMode !== 'none') {
      if (bodyMode === 'json') {
        try { reqBody = JSON.parse(rawBody); } catch { reqBody = rawBody; }
      } else if (bodyMode === 'form-data') {
        // For proxy mode, send as object; for browser mode, build FormData
        const fd = {};
        formData.filter(r => r.enabled && r.key.trim()).forEach(r => { fd[r.key] = r.value; });
        reqBody = fd;
      } else if (bodyMode === 'x-www-form-urlencoded') {
        const parts = formData.filter(r => r.enabled && r.key.trim())
          .map(r => `${encodeURIComponent(r.key)}=${encodeURIComponent(r.value)}`);
        reqBody = parts.join('&');
      } else if (bodyMode === 'raw') {
        reqBody = rawBody;
      }
    }

    const startTime = Date.now();

    try {
      if (interceptor === 'proxy') {
        const res = await api.post('/proxy', {
          method,
          url: finalUrl,
          headers: reqHeaders,
          body: reqBody,
        });
        const respBody = res.data.body || '';
        setResponse({
          status: res.data.status,
          statusText: res.data.statusText,
          headers: res.data.headers || {},
          body: respBody,
          duration: res.data.duration,
          size: formatBytes(new Blob([respBody]).size),
        });
      } else {
        // Browser fetch
        const fetchConfig = { method, headers: reqHeaders };
        if (hasBody && reqBody && bodyMode !== 'none') {
          if (bodyMode === 'form-data') {
            const fd = new FormData();
            formData.filter(r => r.enabled && r.key.trim()).forEach(r => fd.append(r.key, r.value));
            fetchConfig.body = fd;
            delete fetchConfig.headers['Content-Type']; // browser sets boundary
          } else {
            fetchConfig.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody);
          }
        }
        const res = await fetch(finalUrl, fetchConfig);
        const duration = `${Date.now() - startTime}ms`;
        const text = await res.text();
        let responseBody;
        try { responseBody = JSON.stringify(JSON.parse(text), null, 2); } catch { responseBody = text; }

        // Collect response headers
        const respHeaders = {};
        res.headers.forEach((v, k) => { respHeaders[k] = v; });

        setResponse({
          status: res.status,
          statusText: res.statusText,
          headers: respHeaders,
          body: responseBody,
          duration,
          size: formatBytes(new Blob([responseBody]).size),
        });

        // Record to history
        try {
          await api.post('/history', {
            method: method.toUpperCase(), url: finalUrl, status: res.status,
            duration, responseBody: responseBody.substring(0, 50000),
          });
        } catch { /* silent */ }
      }
    } catch (err) {
      const duration = `${Date.now() - startTime}ms`;
      setResponse({
        status: 0, statusText: 'Network Error', headers: {},
        body: `Error: ${err.message}`, duration, size: '0 B',
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Save ──────────────────────────────────────────────────
  const openSave = () => {
    setCurrentRequest({ method, url });
    setSaveForm({ name: `${method} Request`, collectionId: collections[0]?.id || '', newCollName: '' });
    setSaveMode(collections.length > 0 ? 'existing' : 'new');
    setSaveModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!saveForm.name.trim()) return;
    setSaving(true);
    try {
      let cId = saveForm.collectionId;
      if (saveMode === 'new' && saveForm.newCollName.trim()) {
        const created = await addCollection(saveForm.newCollName.trim(), '');
        cId = created.id;
      }
      if (cId) {
        await addRequestToCollection(cId, {
          name: saveForm.name, method: currentRequest?.method || 'GET', url: currentRequest?.url || '',
        });
      }
      setSaveModalOpen(false);
    } catch { /* context handles */ } finally { setSaving(false); }
  };

  // ─── Active param/header counts for tab badges ─────────────
  const paramCount = params.filter(p => p.enabled && p.key.trim()).length;
  const headerCount = headers.filter(h => h.enabled && h.key.trim()).length;

  return (
    <div className="h-full w-full flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* ── URL Bar ──────────────────────────────────────────── */}
      <RequestTopbar
        method={method} setMethod={setMethod}
        url={url} onUrlChange={handleUrlChange}
        loading={loading} onSend={handleSend} onSave={openSave}
      />

      {/* ── Split: Request Config + Response ─────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Request Section */}
        <div className={`flex flex-col ${response ? 'h-1/2' : 'flex-1'} overflow-hidden`}>
          <RequestTabs
            activeTab={activeTab} setActiveTab={setActiveTab}
            paramCount={paramCount} headerCount={headerCount}
            bodyMode={bodyMode}
          />
          <RequestPane
            activeTab={activeTab}
            params={params} setParams={handleParamsChange}
            headers={headers} setHeaders={setHeaders}
            rawBody={rawBody} setRawBody={setRawBody}
            bodyMode={bodyMode} setBodyMode={setBodyMode}
            formData={formData} setFormData={setFormData}
            rawContentType={rawContentType} setRawContentType={setRawContentType}
            authType={authType} setAuthType={setAuthType}
            authData={authData} setAuthData={setAuthData}
          />
        </div>

        {/* Response Section */}
        {response && (
          <ResponsePane
            response={response}
            responseTab={responseTab}
            setResponseTab={setResponseTab}
            onClose={() => setResponse(null)}
          />
        )}
      </div>

      {/* ── Save Modal ───────────────────────────────────────── */}
      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save Request">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Request Name <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input autoFocus value={saveForm.name}
              onChange={e => setSaveForm(f => ({ ...f, name: e.target.value }))}
              placeholder="My Request"
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Save to Collection</label>
            {collections.length > 0 && (
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setSaveMode('existing')}
                  className="flex-1 py-2 text-sm rounded-lg transition-colors"
                  style={{ background: saveMode === 'existing' ? 'var(--bg-elevated)' : 'transparent', border: `1px solid ${saveMode === 'existing' ? 'var(--border-focus)' : 'var(--border-default)'}`, color: saveMode === 'existing' ? 'var(--text-primary)' : 'var(--text-muted)' }}>Existing</button>
                <button type="button" onClick={() => setSaveMode('new')}
                  className="flex-1 py-2 text-sm rounded-lg transition-colors"
                  style={{ background: saveMode === 'new' ? 'var(--bg-elevated)' : 'transparent', border: `1px solid ${saveMode === 'new' ? 'var(--border-focus)' : 'var(--border-default)'}`, color: saveMode === 'new' ? 'var(--text-primary)' : 'var(--text-muted)' }}>New Collection</button>
              </div>
            )}
            {saveMode === 'existing' && collections.length > 0 ? (
              <select value={saveForm.collectionId} onChange={e => setSaveForm(f => ({ ...f, collectionId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                <option value="">— Select collection —</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <div className="space-y-2">
                {collections.length === 0 && (
                  <p className="text-xs mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><FolderPlus size={13} /> No collections yet. Create one:</p>
                )}
                <input value={saveForm.newCollName} onChange={e => setSaveForm(f => ({ ...f, newCollName: e.target.value }))}
                  placeholder="New collection name..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }} />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={!saveForm.name.trim() || saving}
              className="px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving...' : 'Save Request'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
