import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import * as shareService from '../../services/shareService';

const ShareModal = ({ isOpen, onClose, document: doc, onShareCreated }) => {
  const { success, error: toastError } = useToast();
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxAccess, setMaxAccess] = useState(-1);
  const [permissions, setPermissions] = useState('VIEW');
  const [createdShare, setCreatedShare] = useState(null);
  const [loading, setLoading] = useState(false);

  const requesterId = JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;

  const handleCreateShare = async (e) => {
    e.preventDefault();
    if (!doc) return;

    setLoading(true);
    try {
      const res = await shareService.createShareLink(requesterId, {
        documentId: doc.id,
        expiryDays: Number(expiryDays) > 0 ? Number(expiryDays) : null,
        maxAccess: Number(maxAccess),
        permissions,
      });
      setCreatedShare(res.data);
      success('Secure share link created');
      if (onShareCreated) onShareCreated(res.data);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!createdShare) return;
    const fullUrl = `${window.location.origin}/share/${createdShare.accessToken}`;
    navigator.clipboard.writeText(fullUrl);
    success('Share link copied to clipboard!');
  };

  const title = doc?.documentTitle || doc?.originalFileName || doc?.fileName || 'Document';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCreatedShare(null);
        onClose();
      }}
      title={`🔗 Secure Share Link: ${title}`}
      maxWidth="520px"
      footer={
        createdShare ? (
          <Button variant="primary" onClick={copyToClipboard}>
            📋 Copy Share Link
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateShare} loading={loading}>
              Generate Link
            </Button>
          </>
        )
      }
    >
      {createdShare ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2.5rem' }}>🎉</div>
          <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Share Link is Live!</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Anyone with this link and permissions can access this document securely.
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              color: 'var(--primary-color)',
            }}
          >
            {`${window.location.origin}/share/${createdShare.accessToken}`}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <span>Expires: {createdShare.expiryDate ? new Date(createdShare.expiryDate).toLocaleDateString() : 'Never'}</span>
            <span>Max Views: {createdShare.maxAccess === -1 ? 'Unlimited' : createdShare.maxAccess}</span>
            <span>Permission: {createdShare.permissions}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateShare} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Link Expiration
            </label>
            <select
              className="form-input"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="1">1 Day</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="0">Never Expires</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Access Permission Level
            </label>
            <select
              className="form-input"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="VIEW">View Only (Online Preview)</option>
              <option value="DOWNLOAD">View + Download</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Max Access Limit
            </label>
            <select
              className="form-input"
              value={maxAccess}
              onChange={(e) => setMaxAccess(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="-1">Unlimited</option>
              <option value="1">One-Time Use (Self-Destructs)</option>
              <option value="5">Max 5 Views</option>
              <option value="10">Max 10 Views</option>
            </select>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ShareModal;
