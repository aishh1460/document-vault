import React from 'react';
import DocumentCard from './DocumentCard';
import './DocumentGrid.css';

const DocumentGrid = ({
  documents = [],
  searchQuery = '',
  onSelectDocument,
  onPreviewDocument,
  onToggleFavorite,
  onShareDocument,
  onDeleteDocument,
  onDownloadDocument,
}) => {
  if (!documents.length) {
    return (
      <div className="document-grid-empty">
        <div className="document-grid-empty-icon">📄</div>
        <h3>No documents found</h3>
        <p>
          No documents match your current search or filter.
        </p>
      </div>
    );
  }

  return (
    <div className="document-grid">
      {documents.map((doc, index) => (
        <div
          className="document-grid-item"
          key={doc.id}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <DocumentCard
            document={doc}
            searchQuery={searchQuery}
            onSelect={onSelectDocument}
            onPreview={onPreviewDocument}
            onToggleFavorite={onToggleFavorite}
            onShare={onShareDocument}
            onDelete={onDeleteDocument}
            onDownload={onDownloadDocument}
          />
        </div>
      ))}
    </div>
  );
};

export default DocumentGrid;