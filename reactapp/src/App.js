import React, { useState, useEffect } from 'react';
import * as documentService from './services/documentService';
import * as folderService from './services/folderService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import PageLayout from './components/layout/PageLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Folders from './pages/Folders';
import Favorites from './pages/Favorites';
import Shared from './pages/Shared';
import Recent from './pages/Recent';
import Trash from './pages/Trash';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import PublicShare from './pages/PublicShare';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

// Modals
import UploadModal from './components/documents/UploadModal';
import CreateFolderModal from './components/folders/CreateFolderModal';
import DocumentPreview from './components/documents/DocumentPreview';
import DocumentDetailsModal from './components/documents/DocumentDetailsModal';
import ShareModal from './components/sharing/ShareModal';


function MainApp() {

  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  // Landing / authentication state
  const [showLanding, setShowLanding] = useState(true);
  const [authView, setAuthView] = useState('login');
  const [authAdminMode, setAuthAdminMode] = useState(false);

  // Main application state
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState([]);

  // Refresh counter used to signal child pages to reload
  const [refreshCount, setRefreshCount] = useState(0);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [detailsDoc, setDetailsDoc] = useState(null);
  const [shareDoc, setShareDoc] = useState(null);


  // Check if current URL is a public share token link
  // Example: /share/abc123
  const path = window.location.pathname;
  const isShareRoute = path.startsWith('/share/');
  const shareToken = isShareRoute
    ? path.split('/share/')[1]
    : null;


  // --------------------------------------------------
  // Refresh
  // --------------------------------------------------

  const triggerRefresh = () => {
    setRefreshCount((c) => c + 1);
  };


  // --------------------------------------------------
  // Fetch folders
  // --------------------------------------------------

  const fetchFolders = async () => {

    if (!currentUser?.userId) {
      return;
    }

    try {

      const res = await folderService.getFoldersByOwner(
        currentUser.userId
      );

      setFolders(res.data || []);

    } catch (err) {

      // Non-critical
      console.error('Failed to fetch folders:', err);

    }
  };


  // Fetch folders whenever the authenticated user changes
  useEffect(() => {

    if (currentUser) {
      fetchFolders();
    }

  }, [currentUser]);


  // --------------------------------------------------
  // Download document
  // --------------------------------------------------

  const handleDownload = async (doc) => {

    try {

      /*
       * The backend should eventually derive the authenticated
       * user from the security context instead of trusting a
       * requesterId supplied by the frontend.
       *
       * Keeping the current API contract here for now.
       */
      const requesterId = currentUser?.userId;

      if (!requesterId) {
        toastError('Please sign in to download documents');
        return;
      }

      const response = await documentService.downloadDocument(
        doc.id,
        requesterId
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers?.['content-type'] ||
            'application/octet-stream',
        }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute(
        'download',
        doc.documentTitle ||
        doc.originalFileName ||
        doc.fileName ||
        `document-${doc.id}`
      );

      document.body.appendChild(link);

      link.click();

      link.parentNode.removeChild(link);

      window.URL.revokeObjectURL(url);

      success('Download initiated');

    } catch (err) {

      console.error('Download failed:', err);

      toastError('Download failed');
    }
  };


  // --------------------------------------------------
  // Delete document
  // --------------------------------------------------

  const handleDelete = async (docId) => {

    try {

      const requesterId = currentUser?.userId;

      if (!requesterId) {
        toastError('Please sign in to delete documents');
        return;
      }

      await documentService.deleteDocument(
        docId,
        requesterId
      );

      success('Document moved to trash');

      if (detailsDoc?.id === docId) {
        setDetailsDoc(null);
      }

      if (previewDoc?.id === docId) {
        setPreviewDoc(null);
      }

      triggerRefresh();

    } catch (err) {

      console.error('Delete failed:', err);

      toastError('Failed to delete document');
    }
  };


  // --------------------------------------------------
  // Toggle favorite
  // --------------------------------------------------

  const handleToggleFavorite = async (docId) => {

    try {

      const requesterId = currentUser?.userId;

      if (!requesterId) {
        toastError('Please sign in to modify favorites');
        return;
      }

      await documentService.toggleFavorite(
        docId,
        requesterId
      );

      success('Favorite status updated');

      triggerRefresh();

    } catch (err) {

      console.error('Favorite update failed:', err);

      toastError('Failed to update favorite status');
    }
  };


  // --------------------------------------------------
  // Global search
  // --------------------------------------------------

  const handleGlobalSearch = async (query) => {

    setSearchQuery(query);

    if (!query) {
      triggerRefresh();
      return;
    }

    try {

      // Navigate to documents page.
      // Documents page handles the actual search.
      setActivePage('documents');

    } catch (e) {

      toastError('Search query failed');
    }
  };


  // --------------------------------------------------
  // Public share route
  // --------------------------------------------------

  if (isShareRoute && shareToken) {

    return (
      <PublicShare
        token={shareToken}
        onExit={() => {
          window.location.pathname = '/';
        }}
      />
    );
  }


  // --------------------------------------------------
  // Unauthenticated user
  // --------------------------------------------------

  if (!currentUser) {

    /*
     * STEP 1
     * Show landing page before authentication.
     */
    if (showLanding) {

      return (
        <LandingPage

          onGetStarted={() => {

            setShowLanding(false);

            setAuthView('register');

          }}

          onLogin={() => {

            setShowLanding(false);

            setAuthView('login');

          }}

        />
      );
    }


    /*
     * STEP 2
     * Show Login / Register after leaving landing page.
     */
    return (
      <div
        className="app-container"
        style={{ padding: '1rem' }}
      >

        {authView === 'login' ? (
          <Login
            initialAdminMode={authAdminMode}
            onToggleRegister={(isAdmin) => {
              setAuthAdminMode(Boolean(isAdmin));
              setAuthView('register');
            }}
          />
        ) : (
          <Register
            initialAdminMode={authAdminMode}
            onToggleLogin={(isAdmin) => {
              setAuthAdminMode(Boolean(isAdmin));
              setAuthView('login');
            }}
          />
        )}

      </div>
    );
  }


  // --------------------------------------------------
  // AUTHENTICATED APPLICATION
  // --------------------------------------------------

  return (
    <PageLayout

      activePage={activePage}

      setActivePage={setActivePage}

      onSearch={handleGlobalSearch}

      searchQuery={searchQuery}

      setSearchQuery={setSearchQuery}

    >

      {/* -------------------------------------------- */}
      {/* Dashboard */}
      {/* -------------------------------------------- */}

      {activePage === 'dashboard' && (

        <Dashboard

          setActivePage={setActivePage}

          onUploadClick={() => {
            setUploadModalOpen(true);
          }}

          onCreateFolderClick={() => {
            setCreateFolderModalOpen(true);
          }}

          onSelectDocument={(doc) => {
            setDetailsDoc(doc);
          }}

          onPreviewDocument={(doc) => {
            setPreviewDoc(doc);
          }}

          onToggleFavorite={handleToggleFavorite}

          onShareDocument={(doc) => {
            setShareDoc(doc);
          }}

          onDeleteDocument={handleDelete}

          onDownloadDocument={handleDownload}

          refreshTrigger={refreshCount}

        />

      )}


      {/* -------------------------------------------- */}
      {/* Documents */}
      {/* -------------------------------------------- */}

      {activePage === 'documents' && (

        <Documents

          refreshTrigger={refreshCount}

          searchQuery={searchQuery}

          onUploadClick={() => {
            setUploadModalOpen(true);
          }}

          onSelectDocument={(doc) => {
            setDetailsDoc(doc);
          }}

          onPreviewDocument={(doc) => {
            setPreviewDoc(doc);
          }}

          onShareDocument={(doc) => {
            setShareDoc(doc);
          }}

          onDownloadDocument={handleDownload}

        />

      )}


      {/* -------------------------------------------- */}
      {/* Folders */}
      {/* -------------------------------------------- */}

      {activePage === 'folders' && (

        <Folders

          onCreateFolderClick={() => {
            setCreateFolderModalOpen(true);
          }}

          onSelectDocument={(doc) => {
            setDetailsDoc(doc);
          }}

          onPreviewDocument={(doc) => {
            setPreviewDoc(doc);
          }}

          onToggleFavorite={handleToggleFavorite}

          onShareDocument={(doc) => {
            setShareDoc(doc);
          }}

          onDeleteDocument={handleDelete}

          onDownloadDocument={handleDownload}

        />

      )}


      {/* -------------------------------------------- */}
      {/* Favorites */}
      {/* -------------------------------------------- */}

      {activePage === 'favorites' && (

        <Favorites

          onSelectDocument={(doc) => {
            setDetailsDoc(doc);
          }}

          onPreviewDocument={(doc) => {
            setPreviewDoc(doc);
          }}

          onShareDocument={(doc) => {
            setShareDoc(doc);
          }}

          onDeleteDocument={handleDelete}

          onDownloadDocument={handleDownload}

        />

      )}


      {/* -------------------------------------------- */}
      {/* Shared */}
      {/* -------------------------------------------- */}

      {activePage === 'shared' && (
        <Shared />
      )}


      {/* -------------------------------------------- */}
      {/* Recent */}
      {/* -------------------------------------------- */}

      {activePage === 'recent' && (
        <Recent />
      )}


      {/* -------------------------------------------- */}
      {/* Trash */}
      {/* -------------------------------------------- */}

      {activePage === 'trash' && (
        <Trash />
      )}


      {/* -------------------------------------------- */}
      {/* Reminders */}
      {/* -------------------------------------------- */}

      {activePage === 'reminders' && (
        <Reminders />
      )}


      {/* -------------------------------------------- */}
      {/* Settings */}
      {/* -------------------------------------------- */}

      {activePage === 'settings' && (
        <Settings />
      )}


      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}


      {/* -------------------------------------------- */}
      {/* Upload */}
      {/* -------------------------------------------- */}

      <UploadModal

        isOpen={uploadModalOpen}

        onClose={() => {
          setUploadModalOpen(false);
        }}

        onUploadSuccess={() => {
          triggerRefresh();
        }}

      />


      {/* -------------------------------------------- */}
      {/* Create Folder */}
      {/* -------------------------------------------- */}

      <CreateFolderModal

        isOpen={createFolderModalOpen}

        onClose={() => {
          setCreateFolderModalOpen(false);
        }}

        onFolderCreated={() => {

          triggerRefresh();

          fetchFolders();

        }}

      />


      {/* -------------------------------------------- */}
      {/* Document Preview */}
      {/* -------------------------------------------- */}

      {previewDoc && (

        <DocumentPreview

          isOpen={Boolean(previewDoc)}

          document={previewDoc}

          onClose={() => {
            setPreviewDoc(null);
          }}

          onDownload={handleDownload}

          onShare={(doc) => {

            setPreviewDoc(null);

            setShareDoc(doc);

          }}

          onToggleFavorite={handleToggleFavorite}

          onDelete={handleDelete}

        />

      )}


      {/* -------------------------------------------- */}
      {/* Document Details */}
      {/* -------------------------------------------- */}

      {detailsDoc && (

        <DocumentDetailsModal

          isOpen={Boolean(detailsDoc)}

          document={detailsDoc}

          folders={folders}

          onClose={() => {
            setDetailsDoc(null);
          }}

          onUpdate={(updated) => {

            setDetailsDoc(updated);

            triggerRefresh();

          }}

          onDownload={handleDownload}

          onManageAccess={(doc) => {

            setDetailsDoc(null);

            setShareDoc(doc);

          }}

        />

      )}


      {/* -------------------------------------------- */}
      {/* Share */}
      {/* -------------------------------------------- */}

      {shareDoc && (

        <ShareModal

          isOpen={Boolean(shareDoc)}

          document={shareDoc}

          onClose={() => {
            setShareDoc(null);
          }}

          onShareCreated={() => {
            triggerRefresh();
          }}

        />

      )}

    </PageLayout>
  );
}


// ==================================================
// ROOT APP
// ==================================================

function App() {

  return (

    <ThemeProvider>

      <AuthProvider>

        <ToastProvider>

          <MainApp />

        </ToastProvider>

      </AuthProvider>

    </ThemeProvider>

  );
}


export default App;
