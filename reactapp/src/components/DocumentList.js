import React, { useState } from 'react';
import * as documentService from '../services/documentService';

const DocumentList = ({ documents = [], onDelete, onSelectDocument, onManageAccess }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async (doc) => {
    try {
      setError(null);
      const docId = doc.id;
      const response = await documentService.downloadDocument(docId);

      if (window.URL && typeof window.URL.createObjectURL === 'function') {
        const blob = new Blob([response.data], {
          type: response.headers?.['content-type'] || 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.documentTitle || doc.originalFileName || doc.fileName || `document-${docId}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed', err);
      setError('Download failed');
    }
  };

  const handleDelete = async (docId) => {
    try {
      setError(null);
      setLoadingId(docId);
      await documentService.deleteDocument(docId);
      if (onDelete) {
        onDelete(docId);
      }
    } catch (err) {
      console.error('Delete failed', err);
      setError('Delete failed');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-card">
      <div className="flex justify-between items-center mb-4">
        <h3>Secure Document Repository</h3>
        {error && <span className="text-danger text-sm font-semibold">{error}</span>}
      </div>

      {documents.length === 0 ? (
        <div className="text-center p-8 text-muted">
          No documents found.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td
                    style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--primary-color)' }}
                    onClick={() => onSelectDocument && onSelectDocument(doc)}
                  >
                    {doc.documentTitle || doc.originalFileName || doc.fileName || `Document #${doc.id}`}
                  </td>
                  <td>
                    <span className="badge badge-active">
                      {doc.category || doc.documentCategory || 'OTHER'}
                    </span>
                  </td>
                  <td>{doc.uploadDate || doc.createdAt || 'N/A'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        onClick={() => handleDownload(doc)}
                      >
                        Download
                      </button>
                      {onManageAccess && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          onClick={() => onManageAccess(doc)}
                        >
                          Access
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                        onClick={() => handleDelete(doc.id)}
                        disabled={loadingId === doc.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
