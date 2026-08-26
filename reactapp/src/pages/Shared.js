import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ShareLinkCard from '../components/sharing/ShareLinkCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import * as shareService from '../services/shareService';

const Shared = ({ refreshTrigger }) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeShareId, setRevokeShareId] = useState(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadShares();
    }
  }, [currentUser, refreshTrigger]);

  const loadShares = async () => {
    setLoading(true);
    try {
      const res = await shareService.getSharesByUser(currentUser.userId);
      setShares(res.data || []);
    } catch (e) {
      toastError('Could not load shared links');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeShareId) return;
    try {
      await shareService.revokeShareLink(revokeShareId, currentUser.userId);
      success('Share link revoked successfully');
      setShowRevokeConfirm(false);
      setRevokeShareId(null);
      loadShares();
    } catch (e) {
      toastError('Failed to revoke share link');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🔗 Secure Shared Links
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage cryptographic access tokens, expiration dates, and link revocations
        </p>
      </div>

      {loading ? (
        <Loader text="Loading share links..." />
      ) : shares.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No active share links"
          description="Click the share icon (🔗) on any document card to create a time-limited or view-only link."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {shares.map((share) => (
            <ShareLinkCard
              key={share.id}
              share={share}
              onRevoke={(id) => {
                setRevokeShareId(id);
                setShowRevokeConfirm(true);
              }}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        onConfirm={handleRevokeConfirm}
        title="Revoke Share Link"
        message="Are you sure you want to revoke this link? Anyone with the URL will lose access immediately."
        confirmText="Revoke Link"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Shared;
