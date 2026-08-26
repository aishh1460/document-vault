import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'danger', dur), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'slideInRight 0.3s ease-out',
              backdropFilter: 'blur(10px)',
              minWidth: '280px',
              maxWidth: '420px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor:
                toast.type === 'success'
                  ? 'rgba(16, 185, 129, 0.9)'
                  : toast.type === 'danger'
                  ? 'rgba(239, 68, 68, 0.9)'
                  : toast.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.9)'
                  : 'rgba(59, 130, 246, 0.9)',
            }}
          >
            <span>{toast.type === 'success' ? '✓' : toast.type === 'danger' ? '⚠' : toast.type === 'warning' ? '⚡' : 'ℹ'}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <span style={{ opacity: 0.7, fontSize: '1.1rem' }}>&times;</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
