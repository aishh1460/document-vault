import React from 'react';

const FolderCard = ({
  folder,
  docCount = 0,
  onOpen,
  onRename,
  onDelete,
}) => {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={() => onOpen && onOpen(folder)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '2.2rem' }}>📁</span>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {folder.name}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {docCount} document(s)
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-secondary"
          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          onClick={() => onRename && onRename(folder)}
          title="Rename folder"
        >
          ✏️ Rename
        </button>
        <button
          className="btn btn-danger"
          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
          onClick={() => onDelete && onDelete(folder.id)}
          title="Delete folder"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default FolderCard;
