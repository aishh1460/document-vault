import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import * as activityService from '../services/activityService';

const Recent = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.userId) {
      loadActivities();
    }
  }, [currentUser]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await activityService.getUserActivities(currentUser.userId);
      setActivities(res.data || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🕒 Recent Vault Activity
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Chronological stream of document uploads, downloads, shares, and updates
        </p>
      </div>

      {loading ? (
        <Loader text="Loading activities..." />
      ) : activities.length === 0 ? (
        <EmptyState
          icon="🕒"
          title="No recent activity"
          description="Your document interactions and events will appear here in chronological order."
        />
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  {getActionIcon(act.action)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {act.documentName || 'Document'}{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      — {act.action}
                    </span>
                  </div>
                  {act.details && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {act.details}
                    </p>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recent;
