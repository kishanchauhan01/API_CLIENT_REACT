import { useState } from 'react';
import { Folder, Trash2, ChevronRight, Plus, FolderOpen } from 'lucide-react';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';

export default function Collections() {
  const { collections, addCollection, deleteCollection } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleOpen = () => { setForm({ name: '', description: '' }); setIsModalOpen(true); };
  const handleClose = () => setIsModalOpen(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try { await addCollection(form.name.trim(), form.description.trim()); handleClose(); }
    catch { /* handled */ } finally { setSaving(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteCollection(id);
    if (expandedId === id) setExpandedId(null);
  };

  const inputStyle = { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };

  const methodColor = (m) => {
    const c = { GET: '#4ade80', POST: '#60a5fa', DELETE: '#f87171', PUT: '#facc15', PATCH: '#fb923c' };
    return c[m] || 'var(--text-secondary)';
  };

  return (
    <div className="flex-1 p-6 overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Folder style={{ color: 'var(--accent)' }} size={26} /> Collections
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={handleOpen} className="text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2"
            style={{ background: 'var(--accent)' }}>
            <Plus size={16} /> New Collection
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="rounded-xl p-16 text-center" style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)' }}>
            <FolderOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No collections yet</h2>
            <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>Organize your API requests into collections for easy access and sharing.</p>
            <button onClick={handleOpen} className="text-white font-medium py-2 px-5 rounded-lg transition-colors" style={{ background: 'var(--accent)' }}>
              Create your first collection
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map(col => (
              <div key={col.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <div onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                  className="flex items-center gap-3 p-4 cursor-pointer transition-colors group"
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <ChevronRight size={16} style={{ color: 'var(--text-secondary)', transform: expandedId === col.id ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />
                  <Folder style={{ color: 'var(--accent)' }} size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{col.name}</p>
                    {col.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{col.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{(col.requests || []).length} req</span>
                    <span className="hidden sm:block">{new Date(col.createdAt).toLocaleDateString()}</span>
                    <button onClick={(e) => handleDelete(e, col.id)} className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expandedId === col.id && (
                  <div style={{ borderTop: '1px solid var(--border-default)' }}>
                    {(col.requests || []).length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No saved requests in this collection.</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Use "Save" on the Request page to add requests here.</p>
                      </div>
                    ) : (
                      <div>
                        {(col.requests || []).map(req => (
                          <div key={req.id} className="flex items-center gap-3 px-10 py-2.5 transition-colors"
                            style={{ borderBottom: '1px solid var(--border-default)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <span className="text-xs font-bold w-14 flex-shrink-0" style={{ color: methodColor(req.method) }}>{req.method}</span>
                            <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{req.name}</span>
                            <span className="text-xs font-mono truncate ml-auto hidden md:block" style={{ color: 'var(--text-muted)' }}>{req.url}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleClose} title="New Collection">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Collection Name <span style={{ color: 'var(--accent)' }}>*</span></label>
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="My Collection" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this collection for?" rows={3} className="w-full px-4 py-2.5 rounded-lg text-sm resize-none focus:outline-none" style={inputStyle} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={!form.name.trim() || saving}
              className="px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors" style={{ background: 'var(--accent)' }}>
              {saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
