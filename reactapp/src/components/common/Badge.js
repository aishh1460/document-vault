import React from 'react';

const Badge = ({
  children,
  variant = 'default', // default, primary, success, warning, danger, info
  size = 'sm',
  style = {},
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)', border: 'rgba(255, 255, 255, 0.15)' };
    }
  };

  const { bg, color, border } = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
