import React from 'react';
import Folder from '../common/Folder';
import './FolderCard.css';

const FolderCard = ({
  folder,
  docCount = 0,
  onOpen,
  onRename,
  onDelete,
}) => {
  const handleOpen = () => {
    if (onOpen) {
      onOpen(folder);
    }
  };

  return (
    <div
      className="vault-folder-card"
      onClick={handleOpen}
    >
      <div className="vault-folder-top">
        <span className="vault-folder-label">
          FOLDER
        </span>

        <span className="vault-folder-index">
          {String(folder.id).padStart(2, '0')}
        </span>
      </div>

      <div className="vault-folder-visual">
        <Folder
          size={1.35}
          color="#8FE3CF"
          items={[
            <div className="folder-paper-item">
              DOC
            </div>,
            <div className="folder-paper-item">
              VAULT
            </div>,
            <div className="folder-paper-item">
              FILE
            </div>,
          ]}
        />
      </div>

      <div className="vault-folder-info">

        <div className="vault-folder-name-row">

          <div>
            <h3 className="vault-folder-name">
              {folder.name}
            </h3>

            <div className="vault-folder-count">
              {docCount === 1
                ? '1 document'
                : `${docCount} documents`}
            </div>
          </div>

          <span className="vault-folder-arrow">
            ↗
          </span>

        </div>

      </div>

      <div
        className="vault-folder-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="vault-folder-action rename"
          onClick={() =>
            onRename && onRename(folder)
          }
        >
          <span>✎</span>
          Rename
        </button>

        <button
          className="vault-folder-action delete"
          onClick={() =>
            onDelete && onDelete(folder.id)
          }
          title="Delete folder"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default FolderCard;