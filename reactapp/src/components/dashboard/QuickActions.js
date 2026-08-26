import React from 'react';
import Button from '../common/Button';

const QuickActions = ({
  onUploadClick,
  onCreateFolderClick,
  onViewSharesClick,
  onViewTrashClick,
}) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        ⚡ Quick Vault Actions
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        <Button variant="primary" onClick={onUploadClick} style={{ padding: '10px' }}>
          📤 Upload Files
        </Button>
        <Button variant="secondary" onClick={onCreateFolderClick} style={{ padding: '10px' }}>
          📁 New Folder
        </Button>
        <Button variant="secondary" onClick={onViewSharesClick} style={{ padding: '10px' }}>
          🔗 Share Links
        </Button>
        <Button variant="secondary" onClick={onViewTrashClick} style={{ padding: '10px' }}>
          🗑️ Open Trash
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
