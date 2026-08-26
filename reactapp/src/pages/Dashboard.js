import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import StorageCard from '../components/dashboard/StorageCard';
import VaultHealthCard from '../components/dashboard/VaultHealthCard';
import AttentionRequiredCard from '../components/dashboard/AttentionRequiredCard';
import RecentActivityWidget from '../components/dashboard/RecentActivityWidget';
import QuickActions from '../components/dashboard/QuickActions';
import DocumentCard from '../components/documents/DocumentCard';

import * as dashboardService from '../services/dashboardService';
import * as documentService from '../services/documentService';
import * as reminderService from '../services/reminderService';
import * as activityService from '../services/activityService';

const Dashboard = ({
  setActivePage,
  onUploadClick,
  onCreateFolderClick,
  onSelectDocument,
  onPreviewDocument,
  onToggleFavorite,
  onShareDocument,
  onDeleteDocument,
  onDownloadDocument,
  refreshTrigger,
}) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (currentUser?.userId) {
      loadDashboardData();
    }
  }, [currentUser, refreshTrigger]);

  const loadDashboardData = async () => {
    const userId = currentUser.userId;

    const [statsResult, docsResult, remindersResult, activitiesResult] = await Promise.allSettled([
      dashboardService.getDashboardStats(userId),
      documentService.getDocuments({ ownerId: userId, size: 6, sort: 'createdAt,desc' }),
      reminderService.getRemindersByUser(userId),
      activityService.getUserActivities(userId),
    ]);

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value.data);
    }
    if (docsResult.status === 'fulfilled') {
      const data = docsResult.value.data;
      const list = data?.content || (Array.isArray(data) ? data : []);
      setRecentDocs(list);
    }
    if (remindersResult.status === 'fulfilled') {
      setReminders(remindersResult.value.data || []);
    }
    if (activitiesResult.status === 'fulfilled') {
      setActivities(activitiesResult.value.data || []);
    }
  };

  const handleDismissReminder = async (id) => {
    try {
      await reminderService.dismissReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome back, {currentUser?.username || 'User'}! 🛡️
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Your encrypted vault repository is running securely. Role: <strong>{currentUser?.role}</strong> • Clearance:{' '}
            <strong>{currentUser?.securityClearance || 'PUBLIC'}</strong>
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onUploadClick}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
        >
          + Upload Document
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          icon="📄"
          title="Total Documents"
          value={stats?.totalDocuments ?? recentDocs.length}
          subtitle="Encrypted in Vault"
          color="#6366f1"
          onClick={() => setActivePage('documents')}
        />
        <StatCard
          icon="📁"
          title="Vault Folders"
          value={stats?.totalFolders ?? 0}
          subtitle="Organized Hierarchy"
          color="#3b82f6"
          onClick={() => setActivePage('folders')}
        />
        <StatCard
          icon="⭐"
          title="Starred Favorites"
          value={stats?.totalFavorites ?? 0}
          subtitle="Quick Access"
          color="#f59e0b"
          onClick={() => setActivePage('favorites')}
        />
        <StatCard
          icon="🔗"
          title="Active Shares"
          value={stats?.totalShared ?? 0}
          subtitle="Time-Limited Links"
          color="#10b981"
          onClick={() => setActivePage('shared')}
        />
      </div>

      {/* Middle Grid: Storage + Vault Health + Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        <StorageCard usedBytes={stats?.storageUsedBytes || 0} />
        <VaultHealthCard
          healthScore={stats?.vaultHealthScore || 95}
          attentionCount={reminders.length}
          trashCount={stats?.trashCount || 0}
        />
        <QuickActions
          onUploadClick={onUploadClick}
          onCreateFolderClick={onCreateFolderClick}
          onViewSharesClick={() => setActivePage('shared')}
          onViewTrashClick={() => setActivePage('trash')}
        />
      </div>

      {/* Bottom Grid: Attention Required + Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        <AttentionRequiredCard
          reminders={reminders}
          onDismiss={handleDismissReminder}
          onViewAll={() => setActivePage('reminders')}
        />
        <RecentActivityWidget
          activities={activities}
          onViewAll={() => setActivePage('recent')}
        />
      </div>

      {/* Recent Documents Section */}
      <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Documents
          </h3>
          <button
            onClick={() => setActivePage('documents')}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
          >
            View All Documents →
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
            No documents uploaded yet. Ingest your first document to see it here.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {recentDocs.slice(0, 4).map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onSelect={onSelectDocument}
                onPreview={onPreviewDocument}
                onToggleFavorite={onToggleFavorite}
                onShare={onShareDocument}
                onDelete={onDeleteDocument}
                onDownload={onDownloadDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
