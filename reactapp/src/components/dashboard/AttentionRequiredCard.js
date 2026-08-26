import React from 'react';

const AttentionRequiredCard = ({ reminders = [], onDismiss, onViewAll }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          ⚠️ Attention Required
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

      {reminders.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
          ✨ No urgent items requiring attention.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reminders.slice(0, 4).map((rem) => (
            <div
              key={rem.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>{rem.message}</span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Due: {rem.reminderDate ? new Date(rem.reminderDate).toLocaleDateString() : 'Soon'}
                </div>
              </div>
              {onDismiss && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                  onClick={() => onDismiss(rem.id)}
                >
                  Dismiss
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttentionRequiredCard;
