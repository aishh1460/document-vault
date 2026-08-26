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

// Modals
import UploadModal from './components/documents/UploadModal';
import CreateFolderModal from './components/folders/CreateFolderModal';
import DocumentPreview from './components/documents/DocumentPreview';
import DocumentDetailsModal from './components/documents/DocumentDetailsModal';
import ShareModal from './components/sharing/ShareModal';

function MainApp() {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
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

  // Check if current URL is a public share token link (e.g. /share/:token)
  const path = window.location.pathname;
  const isShareRoute = path.startsWith('/share/');
  const shareToken = isShareRoute ? path.split('/share/')[1] : null;

  const triggerRefresh = () => setRefreshCount((c) => c + 1);

  const fetchFolders = async () => {
    if (!currentUser?.userId) return;
    try {
      const res = await folderService.getFoldersByOwner(currentUser.userId);
      setFolders(res.data || []);
    } catch (err) {
      // Non-critical
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFolders();
    }
  }, [currentUser]);

  const handleDownload = async (doc) => {
    try {
      const requesterId = currentUser ? currentUser.userId : 1;
      const response = await documentService.downloadDocument(doc.id, requesterId);
      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        doc.documentTitle || doc.originalFileName || doc.fileName || `document-${doc.id}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Download initiated');
    } catch (err) {
      toastError('Download failed');
    }
  };

  const handleDelete = async (docId) => {
    try {
      const requesterId = currentUser ? currentUser.userId : 1;
      await documentService.deleteDocument(docId, requesterId);
      success('Document moved to trash');
      if (detailsDoc?.id === docId) setDetailsDoc(null);
      if (previewDoc?.id === docId) setPreviewDoc(null);
      triggerRefresh();
    } catch (err) {
      toastError('Failed to delete document');
    }
  };

  const handleToggleFavorite = async (docId) => {
    try {
      const requesterId = currentUser ? currentUser.userId : 1;
      await documentService.toggleFavorite(docId, requesterId);
      success('Favorite status updated');
      triggerRefresh();
    } catch (err) {
      toastError('Failed to update favorite status');
    }
  };

  const handleGlobalSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      triggerRefresh();
      return;
    }
    try {
      // Navigate to documents page and let it handle the search
      setActivePage('documents');
    } catch (e) {
      toastError('Search query failed');
    }
  };

  // If public share link is opened directly
  if (isShareRoute && shareToken) {
    return <PublicShare token={shareToken} onExit={() => (window.location.pathname = '/')} />;
  }

  // If user is not authenticated
  if (!currentUser) {
    return (
      <div className="app-container" style={{ padding: '1rem' }}>
        {authView === 'login' ? (
          <Login onToggleRegister={() => setAuthView('register')} />
        ) : (
          <Register onToggleLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <PageLayout
      activePage={activePage}
      setActivePage={setActivePage}
      onSearch={handleGlobalSearch}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {activePage === 'dashboard' && (
        <Dashboard
          setActivePage={setActivePage}
          onUploadClick={() => setUploadModalOpen(true)}
          onCreateFolderClick={() => setCreateFolderModalOpen(true)}
          onSelectDocument={(doc) => setDetailsDoc(doc)}
          onPreviewDocument={(doc) => setPreviewDoc(doc)}
          onToggleFavorite={handleToggleFavorite}
          onShareDocument={(doc) => setShareDoc(doc)}
          onDeleteDocument={handleDelete}
          onDownloadDocument={handleDownload}
          refreshTrigger={refreshCount}
        />
      )}

      {activePage === 'documents' && (
        <Documents
          refreshTrigger={refreshCount}
          searchQuery={searchQuery}
          onUploadClick={() => setUploadModalOpen(true)}
          onSelectDocument={(doc) => setDetailsDoc(doc)}
          onPreviewDocument={(doc) => setPreviewDoc(doc)}
          onShareDocument={(doc) => setShareDoc(doc)}
          onDownloadDocument={handleDownload}
        />
      )}

      {activePage === 'folders' && (
        <Folders
          onCreateFolderClick={() => setCreateFolderModalOpen(true)}
          onSelectDocument={(doc) => setDetailsDoc(doc)}
          onPreviewDocument={(doc) => setPreviewDoc(doc)}
          onToggleFavorite={handleToggleFavorite}
          onShareDocument={(doc) => setShareDoc(doc)}
          onDeleteDocument={handleDelete}
          onDownloadDocument={handleDownload}
        />
      )}

      {activePage === 'favorites' && (
        <Favorites
          onSelectDocument={(doc) => setDetailsDoc(doc)}
          onPreviewDocument={(doc) => setPreviewDoc(doc)}
          onShareDocument={(doc) => setShareDoc(doc)}
          onDeleteDocument={handleDelete}
          onDownloadDocument={handleDownload}
        />
      )}

      {activePage === 'shared' && <Shared />}

      {activePage === 'recent' && <Recent />}

      {activePage === 'trash' && <Trash />}

      {activePage === 'reminders' && <Reminders />}

      {activePage === 'settings' && <Settings />}

      {/* Modals */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={triggerRefresh}
      />

      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        onFolderCreated={() => {
          triggerRefresh();
          fetchFolders();
        }}
      />

      {previewDoc && (
        <DocumentPreview
          isOpen={Boolean(previewDoc)}
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={handleDownload}
          onShare={(doc) => {
            setPreviewDoc(null);
            setShareDoc(doc);
          }}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      )}

      {detailsDoc && (
        <DocumentDetailsModal
          isOpen={Boolean(detailsDoc)}
          document={detailsDoc}
          folders={folders}
          onClose={() => setDetailsDoc(null)}
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

      {shareDoc && (
        <ShareModal
          isOpen={Boolean(shareDoc)}
          document={shareDoc}
          onClose={() => setShareDoc(null)}
          onShareCreated={triggerRefresh}
        />
      )}
    </PageLayout>
  );
}

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
