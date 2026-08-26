import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0.5rem 0' }}>
        <div
          style={{
            fontSize: '2rem',
            lineHeight: 1,
            color: confirmVariant === 'danger' ? '#ef4444' : '#f59e0b',
          }}
        >
          {confirmVariant === 'danger' ? '⚠️' : '❓'}
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
