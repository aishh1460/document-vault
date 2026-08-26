import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocumentCard from '../components/documents/DocumentCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import * as documentService from '../services/documentService';

const Favorites = ({
  onSelectDocument,
  onPreviewDocument,
  onShareDocument,
  onDeleteDocument,
  onDownloadDocument,
  refreshTrigger,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.userId) {
      loadFavorites();
    }
  }, [currentUser, refreshTrigger]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await documentService.getFavorites(currentUser.userId);
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setFavorites(list);
    } catch (e) {
      toastError('Could not load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (docId) => {
    try {
      await documentService.toggleFavorite(docId, currentUser.userId);
      setFavorites((prev) => prev.filter((d) => d.id !== docId));
      success('Removed from favorites');
    } catch (e) {
      toastError('Failed to update favorite status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          ⭐ Starred Favorites
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Quick access to your most frequently used documents
        </p>
      </div>

      {loading ? (
        <Loader text="Loading favorites..." />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No favorites yet"
          description="Click the star icon (☆) on any document card to pin it here for quick access."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {favorites.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onSelect={onSelectDocument}
              onPreview={onPreviewDocument}
              onToggleFavorite={handleToggleFavorite}
              onShare={onShareDocument}
              onDelete={onDeleteDocument}
              onDownload={onDownloadDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
