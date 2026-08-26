import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon = '📂',
  title = 'No documents yet',
  description = 'Upload your first document to start securing your digital vault.',
  actionLabel = null,
  onAction = null,
}) => {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        gap: '14px',
        margin: '1rem 0',
      }}
    >
      <div style={{ fontSize: '3rem', lineHeight: 1 }}>{icon}</div>
      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h4>
      <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.9rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} style={{ marginTop: '8px' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
