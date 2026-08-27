import React from 'react';

const Button = ({
  children,
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <button
      type={type}
      className={`custom-btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease-in-out',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
      ) : (
        icon && <span>{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
