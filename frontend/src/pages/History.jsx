import { useState, useEffect, useCallback } from 'react';
import { Clock, Search, Trash2 } from 'lucide-react';
import api from '../utils/api';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try { const res = await api.get('/history'); setHistoryItems(res.data); }
    catch (err) { console.error('Failed to fetch history:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const mColor = (m) => ({ GET:'#4ade80', POST:'#60a5fa', PUT:'#facc15', DELETE:'#f87171' }[m] || 'var(--text-secondary)');
  const sColor = (s) => s >= 200 && s < 300 ? '#22c55e' : s >= 400 ? '#ef4444' : 'var(--text-secondary)';
  const timeAgo = (d) => { const m = Math.floor((Date.now()-new Date(d))/60000); return m<1?'just now':m<60?m+'m ago':m<1440?Math.floor(m/60)+'h ago':Math.floor(m/1440)+'d ago'; };

  const handleClearAll = async () => { if(window.confirm('Clear all history?')){try{await api.delete('/history');setHistoryItems([]);}catch{}} };
  const handleDelete = async (e,id) => { e.stopPropagation(); try{await api.delete(`/history/${id}`);setHistoryItems(p=>p.filter(i=>i.id!==id));}catch{} };
  const filtered = historyItems.filter(i => i.url.toLowerCase().includes(searchQuery.toLowerCase()) || i.method.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="flex-1 p-8 flex items-center justify-center" style={{background:'var(--bg-base)'}}><span className="w-8 h-8 rounded-full animate-spin" style={{border:'3px solid var(--border-default)',borderTopColor:'var(--accent)'}}/></div>;

  return (
    <div className="flex-1 p-8 overflow-auto" style={{background:'var(--bg-base)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{color:'var(--text-primary)'}}><Clock style={{color:'var(--accent)'}} size={32}/> History</h1>
          <button onClick={handleClearAll} disabled={!historyItems.length} className="font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50" style={{background:'var(--bg-elevated)',color:'var(--text-secondary)',border:'1px solid var(--border-default)'}}><Trash2 size={16}/> Clear All</button>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg" style={{background:'var(--bg-surface)',border:'1px solid var(--border-default)'}}>
          <div className="p-4" style={{borderBottom:'1px solid var(--border-default)',background:'var(--bg-subtle)'}}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{color:'var(--text-muted)'}}/>
              <input type="text" placeholder="Search history..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none" style={{background:'var(--bg-input)',color:'var(--text-primary)',border:'1px solid var(--border-default)'}}/>
            </div>
          </div>
          <div>
            {filtered.length===0 ? <div className="p-8 text-center" style={{color:'var(--text-secondary)'}}>{historyItems.length===0?'No history yet. Send some requests!':'No results.'}</div> :
            filtered.map(item=>(
              <div key={item.id} className="p-4 transition-colors cursor-pointer flex items-center justify-between group" style={{borderBottom:'1px solid var(--border-default)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <span className="font-bold text-sm w-16" style={{color:mColor(item.method)}}>{item.method}</span>
                  <span className="truncate pr-4 text-sm font-mono" style={{color:'var(--text-secondary)'}}>{item.url}</span>
                </div>
                <div className="flex items-center gap-6 text-xs" style={{color:'var(--text-muted)'}}>
                  <span className="font-medium" style={{color:sColor(item.status)}}>{item.status||'—'}</span>
                  <span>{item.duration}</span>
                  <span className="hidden sm:inline-block w-20 text-right">{timeAgo(item.createdAt)}</span>
                  <button onClick={e=>handleDelete(e,item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-2" style={{color:'var(--text-muted)'}} title="Delete"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
