import React from 'react';

const RecentActivityWidget = ({ activities = [], onViewAll }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'UPLOAD': return '📥';
      case 'DOWNLOAD':
      case 'SHARE_DOWNLOAD': return '📥';
      case 'SHARED': return '🔗';
      case 'DELETE': return '🗑️';
      case 'RESTORE': return '♻️';
      case 'MOVE': return '📁';
      case 'RENAME': return '✏️';
      case 'FAVORITE': return '⭐';
      default: return '📄';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          🕒 Recent Vault Activity
        </h4>
        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            View All
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
          No recent activity logged.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.8rem',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{getActionIcon(act.action)}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {act.documentName || 'Document'}
                </span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>({act.action.toLowerCase()})</span>
                {act.details && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.details}</div>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityWidget;
