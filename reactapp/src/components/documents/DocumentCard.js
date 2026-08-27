import React from 'react';
import Badge from '../common/Badge';
import HighlightText from '../common/HighlightText';
import './DocumentCard.css';

const DocumentCard = ({
  document: doc,
  searchQuery = '',
  onSelect,
  onPreview,
  onToggleFavorite,
  onShare,
  onDelete,
  onDownload,
}) => {
  const title = doc.documentTitle || doc.originalFileName || doc.fileName || 'Untitled';
  const category = doc.category || doc.documentCategory || 'OTHER';
  const version = doc.version || 1;
  const isFav = Boolean(doc.isFavorite || doc.favorite);
  const sizeKb = doc.fileSize
    ? `${(doc.fileSize / 1024).toFixed(1)} KB`
    : '—';

  let dateStr = doc.uploadDate || '';
  if (!dateStr && doc.createdAt) {
    dateStr = typeof doc.createdAt === 'string'
      ? doc.createdAt.substring(0, 10)
      : new Date(doc.createdAt).toISOString().substring(0, 10);
  }

  const getFileIcon = () => {
    const ext = title.split('.').pop().toLowerCase();

    if (ext === 'pdf') return '📕';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (['txt', 'md'].includes(ext)) return '📝';

    return '📄';
  };

  return (
    <article className="vault-document-card">
      <div className="vault-card-glow" />

      <div className="vault-card-header">
        <div className="vault-file-info">
          <div className="vault-file-icon">
            <span>{getFileIcon()}</span>
          </div>

          <div className="vault-file-category">
            <Badge variant="primary" size="sm">
              {category}
            </Badge>
            <span className="vault-version">v{version}</span>
          </div>
        </div>

        <button
          className={`vault-favorite ${isFav ? 'favorite-active' : ''}`}
          onClick={() => onToggleFavorite && onToggleFavorite(doc.id)}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>

      <button
        className="vault-document-title"
        onClick={() => onSelect && onSelect(doc)}
        title={title}
      >
        <HighlightText text={title} highlight={searchQuery} />
      </button>

      <div className="vault-document-meta">
        <span>
          <span className="meta-icon">◫</span>
          {sizeKb}
        </span>
        <span>
          <span className="meta-icon">◷</span>
          {dateStr || 'Unknown date'}
        </span>
      </div>

      {doc.extractedText && (
        <div className="vault-ocr">
          <span>⌕</span>
          <HighlightText
            text={doc.extractedText.substring(0, 75)}
            highlight={searchQuery}
          />
          <span className="ocr-dots">...</span>
        </div>
      )}

      <div className="vault-card-divider" />

      <div className="vault-card-actions">
        <button
          className="vault-action preview-action"
          onClick={() => onPreview && onPreview(doc)}
        >
          <span>◉</span>
          Preview
        </button>

        <button
          className="vault-icon-action"
          onClick={() => onDownload && onDownload(doc)}
          title="Download"
        >
          ↓
        </button>

        <button
          className="vault-icon-action"
          onClick={() => onShare && onShare(doc)}
          title="Share"
        >
          ↗
        </button>

        <button
          className="vault-icon-action delete-action"
          onClick={() => onDelete && onDelete(doc.id)}
          title="Delete"
        >
          ♢
        </button>
      </div>
    </article>
  );
};

export default DocumentCard;