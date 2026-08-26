import React, { useState, useMemo } from 'react';
import DocumentCard from './DocumentCard';
import EmptyState from '../common/EmptyState';
import HighlightText from '../common/HighlightText';

const DocumentGrid = ({
  documents = [],
  onSelectDocument,
  onPreviewDocument,
  onToggleFavorite,
  onShareDocument,
  onDeleteDocument,
  onDownloadDocument,
  onUploadClick,
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, name-asc, size-desc

  const filteredAndSorted = useMemo(() => {
    return documents
      .filter((doc) => {
        const title = (doc.documentTitle || doc.originalFileName || doc.fileName || '').toLowerCase();
        const category = (doc.category || doc.documentCategory || '').toLowerCase();
        const ocr = (doc.extractedText || '').toLowerCase();
        const q = search.toLowerCase();
        const matchesQuery = !q || title.includes(q) || category.includes(q) || ocr.includes(q);
        const matchesCat = categoryFilter === 'ALL' || (doc.category || doc.documentCategory) === categoryFilter;
        return matchesQuery && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.createdAt || b.uploadDate || 0) - new Date(a.createdAt || a.uploadDate || 0);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.createdAt || a.uploadDate || 0) - new Date(b.createdAt || b.uploadDate || 0);
        }
        if (sortBy === 'name-asc') {
          const nameA = a.documentTitle || a.originalFileName || a.fileName || '';
          const nameB = b.documentTitle || b.originalFileName || b.fileName || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'size-desc') {
          return (b.fileSize || 0) - (a.fileSize || 0);
        }
        return 0;
      });
  }, [documents, search, categoryFilter, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Controls Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        {/* Search & Category Filter */}
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, category, or OCR text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />

          <select
            className="form-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="CONTRACT">Contract</option>
            <option value="INVOICE">Invoice</option>
            <option value="REPORT">Report</option>
            <option value="POLICY">Policy</option>
            <option value="LEGAL">Legal</option>
            <option value="FINANCIAL">Financial</option>
            <option value="HR">HR</option>
            <option value="TECHNICAL">Technical</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Sort and View Toggle */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="size-desc">Largest Size</option>
          </select>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary-color)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--primary-color)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredAndSorted.length === 0 ? (
        <EmptyState
          icon="📄"
          title={search ? 'No matching documents found' : 'Vault is empty'}
          description={
            search
              ? 'Try changing your search term or clearing filters.'
              : 'Upload your first confidential document to begin.'
          }
          actionLabel={!search && onUploadClick ? '+ Upload Document' : null}
          onAction={onUploadClick}
        />
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredAndSorted.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              searchQuery={search}
              onSelect={onSelectDocument}
              onPreview={onPreviewDocument}
              onToggleFavorite={onToggleFavorite}
              onShare={onShareDocument}
              onDelete={onDeleteDocument}
              onDownload={onDownloadDocument}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Classification</th>
                <th>Size</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((doc) => {
                const title = doc.documentTitle || doc.originalFileName || doc.fileName || 'Untitled';
                const isFav = doc.isFavorite || doc.favorite;
                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => onToggleFavorite && onToggleFavorite(doc.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? '#fbbf24' : 'rgba(255,255,255,0.2)', fontSize: '1rem' }}
                        >
                          {isFav ? '★' : '☆'}
                        </button>
                        <span
                          style={{ fontWeight: 600, color: 'var(--primary-color)', cursor: 'pointer' }}
                          onClick={() => onSelectDocument && onSelectDocument(doc)}
                        >
                          <HighlightText text={title} highlight={search} />
                        </span>
                      </div>
                    </td>
                    <td>{doc.category || doc.documentCategory || 'OTHER'}</td>
                    <td>{doc.securityClassification || 'PUBLIC'}</td>
                    <td>{doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : '—'}</td>
                    <td>{doc.uploadDate || (doc.createdAt ? doc.createdAt.substring(0, 10) : '—')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => onPreviewDocument && onPreviewDocument(doc)}
                        >
                          Preview
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => onDownloadDocument && onDownloadDocument(doc)}
                        >
                          📥
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => onShareDocument && onShareDocument(doc)}
                        >
                          🔗
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => onDeleteDocument && onDeleteDocument(doc.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentGrid;
