import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';
import * as folderService from '../../services/folderService';

const CreateFolderModal = ({ isOpen, onClose, onFolderCreated, parentId = null }) => {
  const { success, error: toastError } = useToast();
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const requesterId = JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toastError('Please enter a folder name');
      return;
    }

    setLoading(true);
    try {
      await folderService.createFolder(requesterId, folderName.trim(), parentId);
      success(`Folder "${folderName.trim()}" created successfully`);
      setFolderName('');
      if (onFolderCreated) onFolderCreated();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📁 Create New Folder"
      maxWidth="420px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Create Folder
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
            Folder Name
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Education, Career, Financial"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            autoFocus
            required
            style={{ width: '100%' }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;
