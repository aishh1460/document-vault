import React from 'react';

/**
 * Renders text with substring matching the query wrapped in a stylized <mark> tag.
 */
const HighlightText = ({ text, highlight = '', className = '', style = {} }) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) {
    return <span className={className} style={style}>{text}</span>;
  }

  const query = highlight.trim();
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <span className={className} style={style}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              borderRadius: '3px',
              padding: '1px 3px',
              fontWeight: 600,
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default HighlightText;
