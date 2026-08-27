import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import * as documentService from '../services/documentService';

const Trash = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [trashDocs, setTrashDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permanentDeleteId, setPermanentDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadTrash();
    }
  }, [currentUser]);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const res = await documentService.getTrash(currentUser.userId);
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setTrashDocs(list);
    } catch (e) {
      toastError('Could not load trash documents');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await documentService.restoreDocument(id, currentUser.userId);
      setTrashDocs((prev) => prev.filter((d) => d.id !== id));
      success('Document restored to vault');
    } catch (err) {
      toastError('Failed to restore document');
    }
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteId) return;
    try {
      await documentService.permanentlyDelete(permanentDeleteId, currentUser.userId);
      setTrashDocs((prev) => prev.filter((d) => d.id !== permanentDeleteId));
      success('Document permanently deleted from vault and disk');
      setShowConfirm(false);
      setPermanentDeleteId(null);
    } catch (err) {
      toastError('Failed to permanently delete document');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🗑️ Trash & Recovery
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Soft-deleted documents can be restored or permanently removed from disk
        </p>
      </div>

      {loading ? (
        <Loader text="Loading trash..." />
      ) : trashDocs.length === 0 ? (
        <EmptyState
          icon="🗑️"
          title="Trash is empty"
          description="Deleted documents will appear here before being permanently removed."
        />
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Deleted On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trashDocs.map((doc) => {
                const title = doc.documentTitle || doc.originalFileName || doc.fileName || 'Untitled';
                return (
                  <tr key={doc.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {title}
                      </span>
                    </td>
                    <td>{doc.category || doc.documentCategory || 'OTHER'}</td>
                    <td>{doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : '—'}</td>
                    <td>{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Recently'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleRestore(doc.id)}
                        >
                          ♻️ Restore
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => {
                            setPermanentDeleteId(doc.id);
                            setShowConfirm(true);
                          }}
                        >
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handlePermanentDeleteConfirm}
        title="Permanently Delete Document"
        message="This action cannot be undone. The document and its encrypted files will be erased from disk immediately."
        confirmText="Delete Forever"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Trash;
