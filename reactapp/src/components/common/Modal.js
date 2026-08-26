import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px',
  footer = null,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card"
        style={{ maxWidth, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{title}</h3>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ marginBottom: footer ? '1.5rem' : 0 }}>
          {children}
        </div>

        {footer && (
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '1rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
