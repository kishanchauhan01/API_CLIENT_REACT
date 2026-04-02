import { useState } from 'react';
import { Layers, Trash2, Plus, Check, Pencil, X } from 'lucide-react';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';

export default function Environments() {
  const { environments, activeEnvId, setActiveEnvironment, addEnvironment, updateEnvironment, deleteEnvironment } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [vars, setVars] = useState([]);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditingEnv(null); setForm({ name: '' }); setVars([{ id: Date.now(), key: '', value: '', secret: false }]); setModalOpen(true); };
  const openEdit = (e, env) => { e.stopPropagation(); setEditingEnv(env.id); setForm({ name: env.name }); setVars(env.variables.map(v => ({ ...v, id: v.id || Date.now() + Math.random() }))); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingEnv(null); };
  const addVar = () => setVars(v => [...v, { id: Date.now(), key: '', value: '', secret: false }]);
  const removeVar = (id) => setVars(v => v.filter(r => r.id !== id));
  const updateVar = (id, field, val) => setVars(v => v.map(r => r.id === id ? { ...r, [field]: val } : r));

  const handleSave = async (e) => {
    e.preventDefault(); if (!form.name.trim()) return; setSaving(true);
    const clean = vars.filter(v => v.key.trim()).map(v => ({ key: v.key, value: v.value, secret: v.secret }));
    try { if (editingEnv) await updateEnvironment(editingEnv, form.name.trim(), clean); else await addEnvironment(form.name.trim(), clean); closeModal(); } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (e, id) => { e.stopPropagation(); await deleteEnvironment(id); if (selectedEnv === id) setSelectedEnv(null); };
  const iStyle = { background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' };

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Layers style={{ color: 'var(--accent)' }} size={26} /> Environments
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{environments.length} environment{environments.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openCreate} className="text-white font-medium py-2 px-5 rounded-lg transition-colors flex items-center gap-2" style={{ background: 'var(--accent)' }}>
            <Plus size={16} /> New Environment
          </button>
        </div>

        {environments.length === 0 ? (
          <div className="rounded-xl p-16 text-center" style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)' }}>
            <Layers size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No environments</h2>
            <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>Create environments to manage variables across dev, staging, and prod.</p>
            <button onClick={openCreate} className="text-white font-medium py-2 px-5 rounded-lg transition-colors" style={{ background: 'var(--accent)' }}>Create Environment</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {environments.map(env => (
              <div key={env.id} onClick={() => setSelectedEnv(selectedEnv === env.id ? null : env.id)}
                className="rounded-xl p-5 cursor-pointer transition-all group"
                style={{ background: 'var(--bg-surface)', border: activeEnvId === env.id ? '1px solid var(--accent)' : '1px solid var(--border-default)' }}>
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-base font-bold" style={{ color: activeEnvId === env.id ? 'var(--accent)' : 'var(--text-primary)' }}>{env.name}</h2>
                  <div className="flex items-center gap-2">
                    {activeEnvId === env.id && <span className="text-xs py-0.5 px-2 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>Active</span>}
                    <button onClick={(e) => openEdit(e, env)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                    <button onClick={(e) => handleDelete(e, env.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all" style={{ color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{env.variables.length} variable{env.variables.length !== 1 ? 's' : ''}</p>
                {selectedEnv === env.id && (
                  <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--border-default)' }}>
                    {env.variables.map(v => (
                      <div key={v.id} className="flex items-center gap-2 text-xs font-mono">
                        <span style={{ color: '#60a5fa' }} className="min-w-[100px] truncate">{v.key}</span>
                        <span style={{ color: 'var(--text-muted)' }}>=</span>
                        <span style={{ color: '#4ade80' }} className="truncate">{v.secret ? '••••••••' : v.value}</span>
                      </div>
                    ))}
                    {env.variables.length === 0 && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No variables</p>}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={(e) => { e.stopPropagation(); setActiveEnvironment(env.id); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                    style={activeEnvId === env.id
                      ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                      : { background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                    {activeEnvId === env.id && <Check size={12} />}
                    {activeEnvId === env.id ? 'Active' : 'Set as Active'}
                  </button>
                  <button onClick={(e) => openEdit(e, env)} className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>Edit variables →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingEnv ? 'Edit Environment' : 'New Environment'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name <span style={{ color: 'var(--accent)' }}>*</span></label>
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Development" className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none" style={iStyle} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Variables</label>
              <button type="button" onClick={addVar} className="text-xs flex items-center gap-1 transition-colors" style={{ color: 'var(--text-secondary)' }}><Plus size={13} /> Add</button>
            </div>
            <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-default)' }}>
              <div className="grid grid-cols-[1fr_1fr_32px] text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
                <div className="px-3 py-2" style={{ borderRight: '1px solid var(--border-default)' }}>Key</div>
                <div className="px-3 py-2" style={{ borderRight: '1px solid var(--border-default)' }}>Value</div>
                <div />
              </div>
              {vars.map(v => (
                <div key={v.id} className="grid grid-cols-[1fr_1fr_32px]" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ borderRight: '1px solid var(--border-light)' }}>
                    <input value={v.key} onChange={e => updateVar(v.id, 'key', e.target.value)} placeholder="KEY" className="w-full bg-transparent px-3 py-2 text-xs font-mono focus:outline-none" style={{ color: '#60a5fa' }} />
                  </div>
                  <div style={{ borderRight: '1px solid var(--border-light)' }}>
                    <input value={v.value} onChange={e => updateVar(v.id, 'value', e.target.value)} type={v.secret ? 'password' : 'text'} placeholder="value" className="w-full bg-transparent px-3 py-2 text-xs font-mono focus:outline-none" style={{ color: '#4ade80' }} />
                  </div>
                  <button type="button" onClick={() => removeVar(v.id)} className="flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)' }}><X size={12} /></button>
                </div>
              ))}
              {vars.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No variables.</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" disabled={!form.name.trim() || saving} className="px-5 py-2 text-sm disabled:opacity-50 text-white font-medium rounded-lg transition-colors" style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving...' : editingEnv ? 'Save Changes' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
