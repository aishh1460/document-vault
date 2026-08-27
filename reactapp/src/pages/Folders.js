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
  const [documents, setDocuments] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderDocs, setFolderDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadData();
    }
  }, [currentUser, refreshTrigger]);

  useEffect(() => {
    if (currentFolder) {
      loadFolderDocuments(currentFolder.id);
    }
  }, [currentFolder, refreshTrigger]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [folderRes, documentRes] =
        await Promise.all([
          folderService.getFoldersByOwner(
            currentUser.userId
          ),
          documentService.getDocuments({
            ownerId: currentUser.userId,
          }),
        ]);

      setFolders(folderRes.data || []);

      const documentList =
        documentRes.data?.content ||
        (Array.isArray(documentRes.data)
          ? documentRes.data
          : []);

      setDocuments(documentList);
    } catch (error) {
      console.error(
        'Failed to load folders:',
        error
      );

      toastError(
        'Could not load folders'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFolderDocuments = async (folderId) => {
    try {
      const res =
        await documentService.getDocuments({
          ownerId: currentUser.userId,
        });

      const allDocuments =
        res.data?.content ||
        (Array.isArray(res.data)
          ? res.data
          : []);

      setFolderDocs(
        allDocuments.filter(
          (document) =>
            Number(document.folder?.id || document.folderId) ===
            Number(folderId)
        )
      );
    } catch (error) {
      console.error(
        'Failed to load folder documents:',
        error
      );

      setFolderDocs([]);
    }
  };

  const getFolderDocumentCount = (folderId) => {
    return documents.filter(
      (document) =>
        Number(document.folder?.id || document.folderId) ===
        Number(folderId)
    ).length;
  };

  const handleRename = async (folder) => {
    const newName = window.prompt(
      'Enter new folder name:',
      folder.name
    );

    if (
      !newName ||
      !newName.trim() ||
      newName.trim() === folder.name
    ) {
      return;
    }

    try {
      await folderService.renameFolder(
        folder.id,
        currentUser.userId,
        newName.trim()
      );

      success('Folder renamed');

      await loadData();

      if (
        currentFolder?.id === folder.id
      ) {
        setCurrentFolder((previous) => ({
          ...previous,
          name: newName.trim(),
        }));
      }
    } catch (error) {
      console.error(
        'Rename folder error:',
        error
      );

      toastError(
        error.response?.data?.message ||
        'Failed to rename folder'
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFolderId) {
      return;
    }

    try {
      await folderService.deleteFolder(
        deleteFolderId,
        currentUser.userId
      );

      success('Folder deleted');

      setShowDeleteConfirm(false);
      setDeleteFolderId(null);

      if (
        currentFolder?.id ===
        deleteFolderId
      ) {
        setCurrentFolder(null);
        setFolderDocs([]);
      }

      await loadData();
    } catch (error) {
      console.error(
        'Delete folder error:',
        error
      );

      toastError(
        error.response?.data?.message ||
        'Failed to delete folder'
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >

      {/* Header */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
        }}
      >

        <div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >

            {currentFolder && (
              <button
                onClick={() =>
                  setCurrentFolder(null)
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8FE3CF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Folders
              </button>
            )}

            <h2
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#F7F2E8',
                letterSpacing: '-0.035em',
              }}
            >
              {currentFolder
                ? currentFolder.name
                : 'Vault Folders'}
            </h2>

          </div>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.85rem',
              color: '#718099',
            }}
          >
            {currentFolder
              ? 'Documents assigned to this folder'
              : 'Organize your documents into secure directories'}
          </p>

        </div>

        {!currentFolder && (
          <button
            className="btn btn-primary"
            onClick={onCreateFolderClick}
            style={{
              padding: '0.65rem 1.2rem',
              flexShrink: 0,
            }}
          >
            + New Folder
          </button>
        )}

      </div>

      {/* Content */}

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
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >

              {folderDocs.map((document) => (

                <DocumentCard
                  key={document.id}
                  document={document}
                  onSelect={onSelectDocument}
                  onPreview={onPreviewDocument}
                  onToggleFavorite={
                    onToggleFavorite
                  }
                  onShare={
                    onShareDocument
                  }
                  onDelete={
                    onDeleteDocument
                  }
                  onDownload={
                    onDownloadDocument
                  }
                />

              ))}

            </div>

          )}

        </div>

      ) : folders.length === 0 ? (

        <EmptyState
          icon="📁"
          title="No folders created"
          description="Create custom folders like Education, Career, or Personal to organize your documents."
          actionLabel="+ Create Folder"
          onAction={onCreateFolderClick}
        />

      ) : (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '18px',
          }}
        >

          {folders.map((folder) => (

            <FolderCard
              key={folder.id}
              folder={folder}
              docCount={
                getFolderDocumentCount(
                  folder.id
                )
              }
              onOpen={(selectedFolder) =>
                setCurrentFolder(
                  selectedFolder
                )
              }
              onRename={handleRename}
              onDelete={(id) => {
                setDeleteFolderId(id);
                setShowDeleteConfirm(true);
              }}
            />

          ))}

        </div>

      )}

      {/* Delete Confirmation */}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() =>
          setShowDeleteConfirm(false)
        }
        onConfirm={
          handleDeleteConfirm
        }
        title="Delete Folder"
        message="Are you sure you want to delete this folder? Documents in this folder will be unassigned to root."
        confirmText="Delete Folder"
        confirmVariant="danger"
      />

    </div>
  );
};

export default Folders;