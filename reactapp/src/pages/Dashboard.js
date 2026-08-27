import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

import './Dashboard.css';


/* =========================================================
   SMALL LOCAL ICON SYSTEM
   No additional dependency required.
   ========================================================= */

const Icon = ({ name, size = 18, strokeWidth = 1.8 }) => {

  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {

    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      );

    case 'folder':
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );

    case 'star':
      return (
        <svg {...common}>
          <polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3 12 2" />
        </svg>
      );

    case 'share':
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <line x1="8.2" y1="10.8" x2="15.8" y2="6.2" />
          <line x1="8.2" y1="13.2" x2="15.8" y2="17.8" />
        </svg>
      );

    case 'upload':
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <polyline points="7 9 12 4 17 9" />
          <path d="M4 20h16" />
        </svg>
      );

    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );

    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );

    case 'trash':
      return (
        <svg {...common}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M9 6V4h6v2" />
        </svg>
      );

    case 'activity':
      return (
        <svg {...common}>
          <polyline points="3 12 7 12 9.5 5 14 19 16.5 12 21 12" />
        </svg>
      );

    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      );

    default:
      return null;
  }
};


/* =========================================================
   DASHBOARD
   ========================================================= */

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
  const [loading, setLoading] = useState(true);


  /* =======================================================
     LOAD DASHBOARD DATA
     ======================================================= */

  useEffect(() => {

    if (currentUser?.userId) {
      loadDashboardData();
    }

  }, [currentUser, refreshTrigger]);


  const loadDashboardData = async () => {

    if (!currentUser?.userId) {
      return;
    }

    setLoading(true);

    const userId = currentUser.userId;

    const [
      statsResult,
      docsResult,
      remindersResult,
      activitiesResult,
    ] = await Promise.allSettled([

      dashboardService.getDashboardStats(userId),

      documentService.getDocuments({
        ownerId: userId,
        size: 6,
        sort: 'createdAt,desc',
      }),

      reminderService.getRemindersByUser(userId),

      activityService.getUserActivities(userId),

    ]);


    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value.data);
    }


    if (docsResult.status === 'fulfilled') {

      const data = docsResult.value.data;

      const list =
        data?.content ||
        (Array.isArray(data) ? data : []);

      setRecentDocs(list);
    }


    if (remindersResult.status === 'fulfilled') {

      setReminders(
        remindersResult.value.data || []
      );
    }


    if (activitiesResult.status === 'fulfilled') {

      setActivities(
        activitiesResult.value.data || []
      );
    }

    setLoading(false);
  };


  /* =======================================================
     DISMISS REMINDER
     ======================================================= */

  const handleDismissReminder = async (id) => {

    try {

      await reminderService.dismissReminder(id);

      setReminders((prev) =>
        prev.filter((r) => r.id !== id)
      );

    } catch (e) {

      console.error(
        'Failed to dismiss reminder:',
        e
      );
    }
  };


  /* =======================================================
     DISPLAY VALUES
     ======================================================= */

  const totalDocuments =
    stats?.totalDocuments ??
    recentDocs.length;

  const totalFolders =
    stats?.totalFolders ?? 0;

  const totalFavorites =
    stats?.totalFavorites ?? 0;

  const totalShared =
    stats?.totalShared ?? 0;

  const healthScore =
    stats?.vaultHealthScore ?? 95;

  const attentionCount =
    reminders.length;


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="dashboard-page">


      {/* ===================================================
          WELCOME
          =================================================== */}

      <section className="dashboard-welcome">

        <div className="dashboard-welcome-content">

          <div className="dashboard-eyebrow">
            <span className="dashboard-live-dot" />
            PRIVATE DOCUMENT VAULT
          </div>

          <h1>
            Welcome back,
            <span>
              {currentUser?.username || 'User'}
            </span>
          </h1>

          <p>
            Your secure document space is ready.
            Everything important, organized in one place.
          </p>

        </div>


        <button
          className="dashboard-primary-action"
          onClick={onUploadClick}
        >

          <Icon
            name="upload"
            size={17}
          />

          <span>
            Upload document
          </span>

        </button>

      </section>


      {/* ===================================================
          STATISTICS
          =================================================== */}

      <section className="dashboard-stat-strip">

        <button
          className="dashboard-stat"
          onClick={() => setActivePage('documents')}
        >

          <div className="dashboard-stat-icon">
            <Icon name="file" size={17} />
          </div>

          <div className="dashboard-stat-content">

            <span className="dashboard-stat-label">
              Documents
            </span>

            <strong>
              {totalDocuments}
            </strong>

          </div>

          <Icon
            name="arrow"
            size={14}
            className="dashboard-stat-arrow"
          />

        </button>


        <button
          className="dashboard-stat"
          onClick={() => setActivePage('folders')}
        >

          <div className="dashboard-stat-icon">
            <Icon name="folder" size={17} />
          </div>

          <div className="dashboard-stat-content">

            <span className="dashboard-stat-label">
              Folders
            </span>

            <strong>
              {totalFolders}
            </strong>

          </div>

          <Icon name="arrow" size={14} />

        </button>


        <button
          className="dashboard-stat"
          onClick={() => setActivePage('favorites')}
        >

          <div className="dashboard-stat-icon">
            <Icon name="star" size={17} />
          </div>

          <div className="dashboard-stat-content">

            <span className="dashboard-stat-label">
              Favorites
            </span>

            <strong>
              {totalFavorites}
            </strong>

          </div>

          <Icon name="arrow" size={14} />

        </button>


        <button
          className="dashboard-stat"
          onClick={() => setActivePage('shared')}
        >

          <div className="dashboard-stat-icon">
            <Icon name="share" size={17} />
          </div>

          <div className="dashboard-stat-content">

            <span className="dashboard-stat-label">
              Shared
            </span>

            <strong>
              {totalShared}
            </strong>

          </div>

          <Icon name="arrow" size={14} />

        </button>

      </section>


      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <section className="dashboard-main-grid">


        {/* =================================================
            RECENT DOCUMENTS
            ================================================= */}

        <div className="dashboard-section dashboard-documents-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-section-kicker">
                YOUR VAULT
              </span>

              <h2>
                Recent documents
              </h2>

            </div>

            <button
              className="dashboard-view-all"
              onClick={() => setActivePage('documents')}
            >
              View all
              <Icon name="arrow" size={13} />
            </button>

          </div>


          {loading ? (

            <div className="dashboard-document-loading">

              <div className="dashboard-loading-line" />
              <div className="dashboard-loading-line" />
              <div className="dashboard-loading-line" />

            </div>

          ) : recentDocs.length === 0 ? (

            <div className="dashboard-empty">

              <div className="dashboard-empty-icon">
                <Icon name="file" size={22} />
              </div>

              <h3>
                Your vault is empty
              </h3>

              <p>
                Upload your first document to start
                building your secure vault.
              </p>

              <button
                className="dashboard-empty-action"
                onClick={onUploadClick}
              >
                <Icon name="upload" size={15} />
                Upload your first document
              </button>

            </div>

          ) : (

            <div className="dashboard-documents-grid">

              {recentDocs
                .slice(0, 4)
                .map((doc) => (

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


        {/* =================================================
            QUICK ACTIONS
            ================================================= */}

        <aside className="dashboard-sidebar-section">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-section-kicker">
                ACTIONS
              </span>

              <h2>
                Quick actions
              </h2>

            </div>

          </div>


          <div className="dashboard-actions-list">

            <button
              className="dashboard-action primary"
              onClick={onUploadClick}
            >

              <div className="dashboard-action-icon">
                <Icon name="upload" size={17} />
              </div>

              <div>

                <strong>
                  Upload document
                </strong>

                <span>
                  Add a new file to your vault
                </span>

              </div>

              <Icon name="arrow" size={14} />

            </button>


            <button
              className="dashboard-action"
              onClick={onCreateFolderClick}
            >

              <div className="dashboard-action-icon">
                <Icon name="folder" size={17} />
              </div>

              <div>

                <strong>
                  Create folder
                </strong>

                <span>
                  Keep your documents organized
                </span>

              </div>

              <Icon name="arrow" size={14} />

            </button>


            <button
              className="dashboard-action"
              onClick={() => setActivePage('shared')}
            >

              <div className="dashboard-action-icon">
                <Icon name="share" size={17} />
              </div>

              <div>

                <strong>
                  Manage sharing
                </strong>

                <span>
                  Review shared documents
                </span>

              </div>

              <Icon name="arrow" size={14} />

            </button>


            <button
              className="dashboard-action"
              onClick={() => setActivePage('trash')}
            >

              <div className="dashboard-action-icon">
                <Icon name="trash" size={17} />
              </div>

              <div>

                <strong>
                  Open trash
                </strong>

                <span>
                  Restore or permanently delete
                </span>

              </div>

              <Icon name="arrow" size={14} />

            </button>

          </div>

        </aside>

      </section>


      {/* ===================================================
          SECURITY / STORAGE / ACTIVITY
          =================================================== */}

      <section className="dashboard-secondary-grid">


        {/* Vault Health */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-heading">

            <div className="dashboard-panel-title">

              <div className="dashboard-panel-icon">
                <Icon name="shield" size={16} />
              </div>

              <div>

                <span>
                  SECURITY
                </span>

                <h3>
                  Vault health
                </h3>

              </div>

            </div>

            <div className="dashboard-secure-badge">
              <span />
              Secure
            </div>

          </div>


          <VaultHealthCard
            healthScore={healthScore}
            attentionCount={attentionCount}
            trashCount={stats?.trashCount || 0}
          />

        </div>


        {/* Storage */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-heading">

            <div className="dashboard-panel-title">

              <div className="dashboard-panel-icon">
                <Icon name="folder" size={16} />
              </div>

              <div>

                <span>
                  STORAGE
                </span>

                <h3>
                  Vault storage
                </h3>

              </div>

            </div>

          </div>


          <StorageCard
            usedBytes={stats?.storageUsedBytes || 0}
          />

        </div>


        {/* Activity */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-heading">

            <div className="dashboard-panel-title">

              <div className="dashboard-panel-icon">
                <Icon name="activity" size={16} />
              </div>

              <div>

                <span>
                  ACTIVITY
                </span>

                <h3>
                  Recent activity
                </h3>

              </div>

            </div>

            <button
              className="dashboard-mini-link"
              onClick={() => setActivePage('recent')}
            >
              View all
            </button>

          </div>


          <RecentActivityWidget
            activities={activities}
            onViewAll={() => setActivePage('recent')}
          />

        </div>

      </section>


      {/* ===================================================
          ATTENTION
          Only visually prominent when there are reminders.
          =================================================== */}

      {reminders.length > 0 && (

        <section className="dashboard-attention-wrapper">

          <div className="dashboard-attention-header">

            <div>

              <span className="dashboard-section-kicker">
                NEEDS YOUR ATTENTION
              </span>

              <h2>
                {reminders.length}{' '}
                {reminders.length === 1
                  ? 'item'
                  : 'items'}{' '}
                require attention
              </h2>

            </div>

            <button
              className="dashboard-view-all"
              onClick={() => setActivePage('reminders')}
            >
              View reminders
              <Icon name="arrow" size={13} />
            </button>

          </div>


          <AttentionRequiredCard
            reminders={reminders}
            onDismiss={handleDismissReminder}
            onViewAll={() => setActivePage('reminders')}
          />

        </section>

      )}


      {/* ===================================================
          QUIET EMPTY STATE
          =================================================== */}

      {reminders.length === 0 && (

        <div className="dashboard-all-clear">

          <div className="dashboard-all-clear-icon">
            <Icon name="shield" size={16} />
          </div>

          <div>

            <strong>
              Everything is up to date
            </strong>

            <span>
              No documents currently require your attention.
            </span>

          </div>

        </div>

      )}

    </div>
  );
};


export default Dashboard;