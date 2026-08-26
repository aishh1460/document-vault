import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import * as documentService from '../../services/documentService';
import { useToast } from '../../context/ToastContext';

const DocumentDetailsModal = ({
  isOpen,
  onClose,
  document: doc,
  folders = [],
  onUpdate,
  onDownload,
  onManageAccess,
}) => {
  const { success, error: toastError } = useToast();
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(doc?.folder?.id || '');
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(doc?.documentTitle || doc?.originalFileName || '');

  if (!doc) return null;

  const requesterId = JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;

  const handleVersionUpload = async (e) => {
    e.preventDefault();
    if (!newVersionFile) return;
    try {
      const res = await documentService.uploadNewVersion(doc.id, newVersionFile, requesterId);
      success('New version committed successfully');
      setNewVersionFile(null);
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toastError('Failed to upload new version');
    }
  };

  const handleRestoreVersion = async (ver) => {
    try {
      const res = await documentService.restoreVersion(doc.id, ver, requesterId);
      success(`Reverted to version v${ver}`);
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toastError('Failed to restore version');
    }
  };

  const handleSaveRename = async () => {
    if (!newName.trim()) return;
    try {
      const res = await documentService.renameDocument(doc.id, requesterId, newName.trim());
      success('Document renamed');
      setRenaming(false);
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toastError('Failed to rename document');
    }
  };

  const handleFolderMove = async () => {
    try {
      const fId = selectedFolderId ? Number(selectedFolderId) : null;
      const res = await documentService.moveToFolder(doc.id, requesterId, fId);
      success('Folder assignment updated');
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      toastError('Failed to move document');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📄 Document Metadata & Cryptographic Details"
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              if (onManageAccess) onManageAccess(doc);
            }}
          >
            Manage Permissions
          </Button>
          <Button variant="primary" onClick={() => onDownload && onDownload(doc)}>
            Download Decrypted
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Title and rename */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
          {renaming ? (
            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button size="sm" variant="primary" onClick={handleSaveRename}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => setRenaming(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {doc.documentTitle || doc.originalFileName || doc.fileName}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ID: #{doc.id} • Category: {doc.category || doc.documentCategory || 'OTHER'}
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setRenaming(true)}>
                ✏️ Rename
              </Button>
            </>
          )}
        </div>

        {/* Cryptographic and security parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '12px', fontSize: '0.85rem' }}>
            <h5 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>🔐 Cryptographic Parameters</h5>
            <p style={{ margin: '4px 0' }}><strong>Version:</strong> v{doc.version || 1}</p>
            <p style={{ margin: '4px 0' }}><strong>Size:</strong> {doc.fileSize ? (doc.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}</p>
            <p style={{ margin: '4px 0' }}><strong>MIME Type:</strong> {doc.mimeType || 'application/octet-stream'}</p>
            <p style={{ margin: '4px 0', wordBreak: 'break-all' }}>
              <strong>SHA-256 Checksum:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{doc.checksum || 'N/A'}</span>
            </p>
            <p style={{ margin: '4px 0' }}><strong>Encryption:</strong> AES-256 (At-Rest)</p>
          </div>

          <div className="glass-card" style={{ padding: '12px', fontSize: '0.85rem' }}>
            <h5 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>🛡️ Vault Governance</h5>
            <p style={{ margin: '4px 0' }}><strong>Status:</strong> <Badge variant="success">{doc.status || 'ACTIVE'}</Badge></p>
            <p style={{ margin: '4px 0' }}><strong>Classification:</strong> <Badge variant="primary">{doc.securityClassification || 'PUBLIC'}</Badge></p>
            <p style={{ margin: '4px 0' }}><strong>Created:</strong> {new Date(doc.createdAt || Date.now()).toLocaleString()}</p>
            <p style={{ margin: '4px 0' }}><strong>Digital Signature:</strong> Verified</p>
          </div>
        </div>

        {/* Move to folder */}
        <div className="glass-card" style={{ padding: '12px' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>📁 Folder Location</h5>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="form-input"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">(Root / No Folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>📁 {f.name}</option>
              ))}
            </select>
            <Button size="sm" variant="secondary" onClick={handleFolderMove}>
              Move
            </Button>
          </div>
        </div>

        {/* Version Management */}
        <div className="glass-card" style={{ padding: '12px' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>📦 Version Control</h5>
          <form onSubmit={handleVersionUpload} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="file"
              className="form-input"
              onChange={(e) => setNewVersionFile(e.target.files[0])}
              required
            />
            <Button type="submit" size="sm" variant="primary">
              Commit New Version
            </Button>
          </form>

          {/* Revert to versions */}
          <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: doc.version || 1 }, (_, i) => i + 1).reverse().map((ver) => (
                  <tr key={ver}>
                    <td>Version v{ver} {ver === doc.version ? '(Active)' : ''}</td>
                    <td>
                      {ver !== doc.version ? (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => handleRestoreVersion(ver)}
                        >
                          Revert
                        </button>
                      ) : 'Current'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OCR extracted text */}
        {doc.extractedText && (
          <div className="glass-card" style={{ padding: '12px' }}>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>🔍 OCR Extracted Text</h5>
            <textarea
              className="form-input"
              readOnly
              rows={4}
              value={doc.extractedText}
              style={{ width: '100%', fontSize: '0.8rem', resize: 'vertical' }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DocumentDetailsModal;
