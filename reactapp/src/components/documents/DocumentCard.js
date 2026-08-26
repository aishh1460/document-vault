import React from 'react';
import Badge from '../common/Badge';
import HighlightText from '../common/HighlightText';

const DocumentCard = ({
  document: doc,
  searchQuery = '',
  onSelect,
  onPreview,
  onToggleFavorite,
  onShare,
  onDelete,
  onDownload,
  onMoveToFolder,
}) => {
  const title = doc.documentTitle || doc.originalFileName || doc.fileName || 'Untitled';
  const category = doc.category || doc.documentCategory || 'OTHER';
  const classification = doc.securityClassification || 'PUBLIC';
  const isFav = doc.isFavorite || doc.favorite;
  const sizeKb = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : '—';
  
  let dateStr = doc.uploadDate || '';
  if (!dateStr && doc.createdAt) {
    dateStr = typeof doc.createdAt === 'string' ? doc.createdAt.substring(0, 10) : new Date(doc.createdAt).toISOString().substring(0, 10);
  }

  // Get file type icon
  const getFileIcon = () => {
    const ext = title.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📕';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (['txt', 'md'].includes(ext)) return '📝';
    return '📄';
  };

  return (
    <div
      className="glass-card doc-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: '14px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{getFileIcon()}</span>
          <div>
            <Badge variant="primary" size="sm">{category}</Badge>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>v{doc.version || 1}</span>
          </div>
        </div>

        {/* Favorite Star Button */}
        <button
          onClick={() => onToggleFavorite && onToggleFavorite(doc.id)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.3rem',
            cursor: 'pointer',
            color: isFav ? '#fbbf24' : 'rgba(255,255,255,0.2)',
            transition: 'transform 0.15s ease',
          }}
          title={isFav ? 'Remove from favorites' : 'Mark as favorite'}
        >
          {isFav ? '★' : '☆'}
        </button>
      </div>

      {/* Title */}
      <h4
        onClick={() => onSelect && onSelect(doc)}
        style={{
          margin: '0 0 8px 0',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          wordBreak: 'break-word',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
        title={title}
      >
        <HighlightText text={title} highlight={searchQuery} />
      </h4>

      {/* Meta Info */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span>{sizeKb}</span>
        <span>{dateStr}</span>
      </div>

      {/* OCR Preview snippet if any */}
      {doc.extractedText && (
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px 8px',
            borderRadius: '6px',
            marginBottom: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={doc.extractedText}
        >
          🔍 OCR: <HighlightText text={doc.extractedText.substring(0, 70)} highlight={searchQuery} />...
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={() => onPreview && onPreview(doc)}
            title="Preview document"
          >
            👁️ Preview
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={() => onDownload && onDownload(doc)}
            title="Download document"
          >
            📥
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={() => onShare && onShare(doc)}
            title="Share document link"
          >
            🔗
          </button>
          <button
            className="btn btn-danger"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={() => onDelete && onDelete(doc.id)}
            title="Delete document"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
