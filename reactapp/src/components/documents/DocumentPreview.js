import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import * as documentService from '../../services/documentService';

const DocumentPreview = ({
  isOpen,
  onClose,
  document: doc,
  onDownload,
  onShare,
  onToggleFavorite,
  onDelete,
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const title = doc?.documentTitle || doc?.originalFileName || doc?.fileName || 'Document Preview';
  const isFav = doc?.isFavorite || doc?.favorite;

  useEffect(() => {
    if (isOpen && doc?.id) {
      loadFilePreview();
    }
    return () => {
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [isOpen, doc]);

  const loadFilePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const requesterId = JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;
      const res = await documentService.downloadDocument(doc.id, requesterId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers?.['content-type'] || 'application/octet-stream' }));
      setBlobUrl(url);
    } catch (err) {
      setError('Could not load direct preview. You can still download the file.');
    } finally {
      setLoading(false);
    }
  };

  const getFileType = () => {
    if (!doc) return 'unknown';
    const ext = title.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['txt', 'csv', 'json', 'md', 'xml'].includes(ext)) return 'text';
    return 'other';
  };

  const fileType = getFileType();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📄 Preview: ${title}`}
      maxWidth="850px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              onClick={() => onToggleFavorite && onToggleFavorite(doc.id)}
            >
              {isFav ? '★ Favorited' : '☆ Favorite'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onShare && onShare(doc)}
            >
              🔗 Share
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="danger"
              onClick={() => {
                if (onDelete) onDelete(doc.id);
                onClose();
              }}
            >
              Delete
            </Button>
            <Button
              variant="primary"
              onClick={() => onDownload && onDownload(doc)}
            >
              Download
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', overflow: 'hidden', padding: '10px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading preview...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
            <Button variant="primary" onClick={() => onDownload && onDownload(doc)}>
              Download Instead
            </Button>
          </div>
        ) : blobUrl ? (
          fileType === 'image' ? (
            <img
              src={blobUrl}
              alt={title}
              style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px' }}
            />
          ) : fileType === 'pdf' ? (
            <iframe
              src={blobUrl}
              title={title}
              style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>📄</span>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Preview is ready for download or viewing.
              </p>
              <Button variant="primary" onClick={() => onDownload && onDownload(doc)}>
                Download Decrypted File
              </Button>
            </div>
          )
        ) : null}

        {doc?.extractedText && (
          <div style={{ width: '100%', marginTop: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>OCR Extracted Content:</strong>
            <pre style={{ margin: '8px 0 0 0', fontSize: '0.8rem', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', color: 'var(--text-muted)' }}>
              {doc.extractedText}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DocumentPreview;
