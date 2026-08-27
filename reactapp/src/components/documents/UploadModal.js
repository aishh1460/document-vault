import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import * as documentService from '../../services/documentService';

const UploadModal = ({ isOpen, onClose, onUploadSuccess, existingDocs = [] }) => {
  const { success, error: toastError, warning } = useToast();
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('OTHER');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  
  const [pendingVersionUpload, setPendingVersionUpload] = useState(null);
  const [changeDescription, setChangeDescription] = useState('');

  const requesterId = JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
      setPendingVersionUpload(null);
      setChangeDescription('');

      
      const dup = selected.find((f) =>
        existingDocs.some((d) => (d.documentTitle || d.originalFileName || d.fileName) === f.name)
      );
      if (dup) {
        setDuplicateWarning(`A file named "${dup.name}" may already exist. Upload will be confirmed against server checksum.`);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toastError('Please select at least one file');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          await documentService.uploadDocument(file, requesterId, { category });
        } catch (err) {
          const status = err.response?.status;
          const data = err.response?.data;
          if (status === 409 && data?.existingDocumentId) {
            
            setPendingVersionUpload({ file, existingDocumentId: data.existingDocumentId });
            setUploading(false);
            setProgress(0);
            warning(`"${file.name}" already exists in the vault. Confirm below to upload as a new version.`);
            return;
          }
          throw err;
        }
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      success(`Successfully uploaded ${files.length} document(s)`);
      if (onUploadSuccess) onUploadSuccess();
      handleClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVersionUpload = async () => {
    if (!pendingVersionUpload) return;
    const { file, existingDocumentId } = pendingVersionUpload;
    setUploading(true);
    setProgress(20);
    try {
      await documentService.uploadNewVersion(existingDocumentId, file, requesterId, changeDescription);
      setProgress(100);
      success(`New version of "${file.name}" uploaded successfully`);
      if (onUploadSuccess) onUploadSuccess();
      handleClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Version upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setProgress(0);
    setDuplicateWarning(null);
    setPendingVersionUpload(null);
    setChangeDescription('');
    onClose();
  };

  const renderFooter = () => {
    if (pendingVersionUpload) {
      return (
        <>
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVersionUpload} loading={uploading}>
            Upload as New Version
          </Button>
        </>
      );
    }
    return (
      <>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={files.length === 0}
        >
          Upload {files.length > 1 ? `(${files.length} Files)` : ''}
        </Button>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📥 Secure Document Ingestion"
      maxWidth="580px"
      footer={renderFooter()}
    >
      <form onSubmit={pendingVersionUpload ? handleVersionUpload : handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {}
        <div
          className="dropzone"
          style={{
            border: '2px dashed rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '2rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
          }}
          onClick={() => document.getElementById('multi-file-input').click()}
        >
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📁</span>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>
            {files.length > 0
              ? `${files.length} file(s) selected: ${files.map((f) => f.name).join(', ')}`
              : 'Click to select files or drag & drop'}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Supports PDF, DOCX, XLSX, PNG, JPG, CSV up to 100MB (AES-256 Encrypted)
          </span>
          <input
            id="multi-file-input"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {}
        {duplicateWarning && !pendingVersionUpload && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', color: '#fbbf24', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>⚠️</span>
            <span>{duplicateWarning}</span>
          </div>
        )}

        {}
        {pendingVersionUpload && (
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', padding: '12px 14px', fontSize: '0.85rem', color: '#a5b4fc' }}>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>🔄 This file already exists in the vault</div>
            <div style={{ marginBottom: '10px', opacity: 0.85 }}>
              A document with the same content was found. Click "Upload as New Version" to create a new version of the existing document.
            </div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', opacity: 0.8 }}>
              Change Description (optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Describe what changed in this version..."
              style={{ width: '100%' }}
            />
          </div>
        )}

        {}
        {!pendingVersionUpload && (
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Document Category
            </label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="OTHER">OTHER</option>
              <option value="CONTRACT">CONTRACT</option>
              <option value="INVOICE">INVOICE</option>
              <option value="REPORT">REPORT</option>
              <option value="POLICY">POLICY</option>
              <option value="LEGAL">LEGAL</option>
              <option value="FINANCIAL">FINANCIAL</option>
              <option value="HR">HR</option>
              <option value="TECHNICAL">TECHNICAL</option>
            </select>
          </div>
        )}

        {}
        {uploading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>{pendingVersionUpload ? 'Creating new version...' : 'Encrypting & Ingesting...'}</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UploadModal;
