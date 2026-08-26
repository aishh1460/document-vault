import React from 'react';

const StorageCard = ({ usedBytes = 0, totalLimitBytes = 10 * 1024 * 1024 * 1024 }) => {
  const usedMb = (usedBytes / (1024 * 1024)).toFixed(1);
  const totalGb = (totalLimitBytes / (1024 * 1024 * 1024)).toFixed(0);
  const percentage = Math.min(100, ((usedBytes / totalLimitBytes) * 100).toFixed(1));

  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          💾 Storage Usage
        </h4>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)' }}>
          {usedMb} MB / {totalGb} GB ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
        <div
          style={{
            width: `${Math.max(3, percentage)}%`,
            height: '100%',
            background: Number(percentage) > 85 ? '#ef4444' : 'linear-gradient(90deg, #6366f1, #3b82f6)',
            borderRadius: '5px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Encrypted At-Rest (AES-256)</span>
        <span>{((totalLimitBytes - usedBytes) / (1024 * 1024 * 1024)).toFixed(2)} GB Available</span>
      </div>
    </div>
  );
};

export default StorageCard;
