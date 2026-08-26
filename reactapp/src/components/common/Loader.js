import React from 'react';

const Loader = ({ text = 'Loading documents...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '12px',
        color: 'var(--text-muted)',
      }}
    >
      <div
        className="custom-spinner"
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: 'var(--primary-color, #6366f1)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>
    </div>
  );
};

export default Loader;
