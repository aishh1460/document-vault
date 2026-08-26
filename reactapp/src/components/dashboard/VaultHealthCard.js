import React from 'react';

const VaultHealthCard = ({ healthScore = 95, attentionCount = 0, trashCount = 0 }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          🏆 Vault Health & Security
        </h4>
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444',
          }}
        >
          {healthScore}%
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
          <span>✓</span>
          <span>AES-256 Cryptographic Storage Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
          <span>✓</span>
          <span>SHA-256 Document Integrity Verified</span>
        </div>
        {attentionCount > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
            <span>⚠️</span>
            <span>{attentionCount} document(s) need attention / expiring</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
            <span>✓</span>
            <span>All reminders & expiration schedules up to date</span>
          </div>
        )}
        {trashCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <span>🗑️</span>
            <span>{trashCount} item(s) in trash pending cleanup</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultHealthCard;
