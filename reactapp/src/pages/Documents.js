import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocumentGrid from '../components/documents/DocumentGrid';
import Loader from '../components/common/Loader';
import * as documentService from '../services/documentService';

const Documents = ({
  onSelectDocument,
  onPreviewDocument,
  onShareDocument,
  onUploadClick,
  onDownloadDocument,
  refreshTrigger,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.userId) {
      loadDocuments();
    }
  }, [currentUser, refreshTrigger]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentUser?.role !== 'ADMIN') {
        params.ownerId = currentUser.userId;
      }
      const res = await documentService.getDocuments(params);
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setDocuments(list);
    } catch (err) {
      toastError('Could not retrieve vault documents');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (docId) => {
    try {
      const res = await documentService.toggleFavorite(docId, currentUser.userId);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isFavorite: res.data.isFavorite, favorite: res.data.isFavorite } : d))
      );
      success('Favorite status updated');
    } catch (err) {
      toastError('Failed to toggle favorite');
    }
  };

  const handleDelete = async (docId) => {
    try {
      await documentService.deleteDocument(docId, currentUser.userId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      success('Document moved to trash');
    } catch (err) {
      toastError('Failed to delete document');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            📄 All Documents
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Browse, search, sort, and manage all your secure encrypted files
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={onUploadClick}
          style={{ padding: '0.6rem 1.2rem' }}
        >
          + Upload Document
        </button>
      </div>

      {loading ? (
        <Loader text="Loading documents..." />
      ) : (
        <DocumentGrid
          documents={documents}
          onSelectDocument={onSelectDocument}
          onPreviewDocument={onPreviewDocument}
          onToggleFavorite={handleToggleFavorite}
          onShareDocument={onShareDocument}
          onDeleteDocument={handleDelete}
          onDownloadDocument={onDownloadDocument}
          onUploadClick={onUploadClick}
        />
      )}
    </div>
  );
};

export default Documents;
