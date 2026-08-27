import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import * as documentService from './services/documentService';
import * as folderService from './services/folderService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import PageLayout from './components/layout/PageLayout';

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

import UploadModal from './components/documents/UploadModal';
import CreateFolderModal from './components/folders/CreateFolderModal';
import DocumentPreview from './components/documents/DocumentPreview';
import DocumentDetailsModal from './components/documents/DocumentDetailsModal';
import ShareModal from './components/sharing/ShareModal';

function MainApp() {

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  
  const [showLanding, setShowLanding] = useState(true);
  const [authView, setAuthView] = useState('login');
  const [authAdminMode, setAuthAdminMode] = useState(false);

  
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState([]);

  
  const [refreshCount, setRefreshCount] = useState(0);

  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [detailsDoc, setDetailsDoc] = useState(null);
  const [shareDoc, setShareDoc] = useState(null);

  
  
  

  const triggerRefresh = () => {
    setRefreshCount((c) => c + 1);
  };

  
  
  

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

      
      console.error('Failed to fetch folders:', err);

    }
  };

  
  useEffect(() => {

    if (currentUser) {
      fetchFolders();
    }

  }, [currentUser]);

  
  
  

  const handleDownload = async (doc) => {

    try {

      
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

  
  
  

  const handleGlobalSearch = async (query) => {

    setSearchQuery(query);

    if (!query) {
      triggerRefresh();
      return;
    }

    try {

      
      setActivePage('documents');
      navigate('/documents');

    } catch (e) {

      toastError('Search query failed');
    }
  };

  
  
  

  if (!currentUser) {

    
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

  
  
  

  
  const modalLayer = (
    <>
      {}
      {}
      {}

      <UploadModal

        isOpen={uploadModalOpen}

        onClose={() => {
          setUploadModalOpen(false);
        }}

        onUploadSuccess={() => {
          triggerRefresh();
        }}

      />

      {}
      {}
      {}

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

      {}
      {}
      {}

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

      {}
      {}
      {}

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

      {}
      {}
      {}

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
    </>
  );

  return (
    <PageLayout
      activePage={activePage}
      setActivePage={setActivePage}
      onSearch={handleGlobalSearch}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <Routes>
        {}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {}
        <Route
          path="/dashboard"
          element={
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
          }
        />

        {}
        <Route
          path="/documents"
          element={
            <Documents
              refreshTrigger={refreshCount}
              searchQuery={searchQuery}
              onUploadClick={() => setUploadModalOpen(true)}
              onSelectDocument={(doc) => setDetailsDoc(doc)}
              onPreviewDocument={(doc) => setPreviewDoc(doc)}
              onShareDocument={(doc) => setShareDoc(doc)}
              onDownloadDocument={handleDownload}
            />
          }
        />

        {}
        <Route
          path="/folders"
          element={
            <Folders
              onCreateFolderClick={() => setCreateFolderModalOpen(true)}
              onSelectDocument={(doc) => setDetailsDoc(doc)}
              onPreviewDocument={(doc) => setPreviewDoc(doc)}
              onToggleFavorite={handleToggleFavorite}
              onShareDocument={(doc) => setShareDoc(doc)}
              onDeleteDocument={handleDelete}
              onDownloadDocument={handleDownload}
            />
          }
        />

        {}
        <Route
          path="/favorites"
          element={
            <Favorites
              onSelectDocument={(doc) => setDetailsDoc(doc)}
              onPreviewDocument={(doc) => setPreviewDoc(doc)}
              onShareDocument={(doc) => setShareDoc(doc)}
              onDeleteDocument={handleDelete}
              onDownloadDocument={handleDownload}
            />
          }
        />

        {}
        <Route path="/shared" element={<Shared />} />

        {}
        <Route path="/recent" element={<Recent />} />

        {}
        <Route path="/trash" element={<Trash />} />

        {}
        <Route path="/reminders" element={<Reminders />} />

        {}
        <Route path="/settings" element={<Settings />} />

        {}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {modalLayer}
    </PageLayout>
  );
}

function App() {

  return (

    <BrowserRouter>

      <ThemeProvider>

        <AuthProvider>

          <ToastProvider>

            {}
            <Routes>
              <Route path="/share/:token" element={<PublicShare />} />
              <Route path="*" element={<MainApp />} />
            </Routes>

          </ToastProvider>

        </AuthProvider>

      </ThemeProvider>

    </BrowserRouter>

  );
}

export default App;
