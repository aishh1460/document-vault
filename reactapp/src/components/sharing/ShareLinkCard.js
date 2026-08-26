import React from 'react';
import Badge from '../common/Badge';
import { useToast } from '../../context/ToastContext';

const ShareLinkCard = ({ share, onRevoke }) => {
  const { success } = useToast();

  const fullUrl = `${window.location.origin}/share/${share.accessToken}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    success('Share link copied to clipboard');
  };

  const isExpired = share.expiryDate && new Date(share.expiryDate) < new Date();
  const isMaxedOut = share.maxAccess > 0 && share.accessCount >= share.maxAccess;
  const isInactive = !share.active || isExpired || isMaxedOut;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        opacity: isInactive ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {share.documentTitle || `Document #${share.documentId}`}
        </h4>
        <Badge variant={isInactive ? 'danger' : 'success'}>
          {isInactive ? 'Inactive / Revoked' : 'Active'}
        </Badge>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullUrl}</span>
        <button
          className="btn btn-secondary"
          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
          onClick={copyUrl}
        >
          Copy
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div>
          <span>Views: {share.accessCount} {share.maxAccess > 0 ? `/ ${share.maxAccess}` : ''}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>Permission: {share.permissions}</span>
        </div>

        {share.active && !isExpired && !isMaxedOut && (
          <button
            className="btn btn-danger"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            onClick={() => onRevoke && onRevoke(share.id)}
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
};

export default ShareLinkCard;
