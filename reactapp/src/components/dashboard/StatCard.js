import React from 'react';

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  onClick,
  color = '#6366f1',
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `rgba(${color === '#6366f1' ? '99, 102, 241' : color === '#10b981' ? '16, 185, 129' : color === '#f59e0b' ? '245, 158, 11' : '59, 130, 246'}, 0.15)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block' }}>
          {title}
        </span>
        <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
