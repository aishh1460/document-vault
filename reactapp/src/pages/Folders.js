import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FolderCard from '../components/folders/FolderCard';
import DocumentCard from '../components/documents/DocumentCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import * as folderService from '../services/folderService';
import * as documentService from '../services/documentService';

const Folders = ({
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
  const { success, error: toastError } = useToast();

  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderDocs, setFolderDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadFolders();
    }
  }, [currentUser, refreshTrigger]);

  useEffect(() => {
    if (currentFolder) {
      loadFolderDocuments(currentFolder.id);
    }
  }, [currentFolder, refreshTrigger]);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const res = await folderService.getFoldersByOwner(currentUser.userId);
      setFolders(res.data || []);
    } catch (e) {
      toastError('Could not load folders');
    } finally {
      setLoading(false);
    }
  };

  const loadFolderDocuments = async (fId) => {
    try {
      const res = await documentService.getDocuments({ ownerId: currentUser.userId });
      const all = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setFolderDocs(all.filter((d) => d.folder?.id === fId));
    } catch (e) {}
  };

  const handleRename = async (folder) => {
    const newName = window.prompt('Enter new folder name:', folder.name);
    if (!newName || !newName.trim() || newName.trim() === folder.name) return;

    try {
      await folderService.renameFolder(folder.id, currentUser.userId, newName.trim());
      success('Folder renamed');
      loadFolders();
      if (currentFolder?.id === folder.id) {
        setCurrentFolder((prev) => ({ ...prev, name: newName.trim() }));
      }
    } catch (err) {
      toastError('Failed to rename folder');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFolderId) return;
    try {
      await folderService.deleteFolder(deleteFolderId, currentUser.userId);
      success('Folder deleted');
      setShowDeleteConfirm(false);
      setDeleteFolderId(null);
      if (currentFolder?.id === deleteFolderId) {
        setCurrentFolder(null);
      }
      loadFolders();
    } catch (err) {
      toastError('Failed to delete folder');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentFolder && (
              <button
                onClick={() => setCurrentFolder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Folders ←
              </button>
            )}
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentFolder ? `📁 ${currentFolder.name}` : '📁 Vault Folders'}
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {currentFolder
              ? 'Viewing documents assigned to this folder'
              : 'Organize your documents with hierarchical directories'}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onCreateFolderClick}
          style={{ padding: '0.6rem 1.2rem' }}
        >
          + New Folder
        </button>
      </div>

      {loading ? (
        <Loader text="Loading folders..." />
      ) : currentFolder ? (
        <div>
          {folderDocs.length === 0 ? (
            <EmptyState
              icon="📂"
              title="Folder is empty"
              description="Move documents into this folder using the document details modal."
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {folderDocs.map((doc) => (
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
      ) : folders.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No folders created"
          description="Create custom folders like 'Education', 'Career', or 'Personal' to organize documents."
          actionLabel="+ Create Folder"
          onAction={onCreateFolderClick}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={(f) => setCurrentFolder(f)}
              onRename={handleRename}
              onDelete={(id) => {
                setDeleteFolderId(id);
                setShowDeleteConfirm(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Delete Folder Confirm */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? Documents in this folder will be unassigned to root."
        confirmText="Delete Folder"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Folders;
