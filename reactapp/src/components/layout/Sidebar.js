import React from 'react';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'documents', label: 'All Documents', icon: '📄' },
    { id: 'folders', label: 'Folders', icon: '📁' },
    { id: 'favorites', label: 'Favorites', icon: '⭐' },
    { id: 'shared', label: 'Secure Shares', icon: '🔗' },
    { id: 'recent', label: 'Recent Activity', icon: '🕒' },
    { id: 'reminders', label: 'Reminders', icon: '⏰' },
    { id: 'trash', label: 'Trash', icon: '🗑️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside
      className="sidebar glass-card"
      style={{
        width: '240px',
        minWidth: '240px',
        padding: '1.25rem 0.75rem',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        height: 'fit-content',
        position: 'sticky',
        top: '80px',
      }}
    >
      <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Vault Explorer
      </div>

      {menuItems.map((item) => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.25))'
                : 'transparent',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              borderLeft: isActive ? '3px solid var(--primary-color, #6366f1)' : '3px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
