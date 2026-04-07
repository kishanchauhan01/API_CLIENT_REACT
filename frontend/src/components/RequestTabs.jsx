export default function RequestTabs({ activeTab, setActiveTab, paramCount, headerCount, bodyMode }) {
  const tabs = [
    { key: 'Params',    label: 'Params',     badge: paramCount || null },
    { key: 'Body',      label: 'Body',       badge: bodyMode !== 'none' ? bodyMode.toUpperCase() : null, badgeAccent: true },
    { key: 'Headers',   label: 'Headers',    badge: headerCount || null },
    { key: 'Auth',      label: 'Auth' },
    { key: 'PreScript', label: 'Pre-request' },
    { key: 'PostScript',label: 'Post-request' },
  ];

  return (
    <div className="px-1 flex space-x-0 overflow-x-auto scrollbar-none"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
          className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
          style={{
            color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
          }}>
          {tab.label}
          {tab.badge != null && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-0.5"
              style={{
                background: 'var(--bg-elevated)',
                color: tab.badgeAccent ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
