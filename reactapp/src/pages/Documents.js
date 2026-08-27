import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DocumentGrid from '../components/documents/DocumentGrid';
import Loader from '../components/common/Loader';
import * as documentService from '../services/documentService';
import './Documents.css';

const Documents = ({
  onSelectDocument,
  onPreviewDocument,
  onShareDocument,
  onUploadClick,
  onDownloadDocument,
  refreshTrigger,
}) => {
  const { currentUser } = useAuth();
  const { error: toastError } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (currentUser?.userId) {
      loadDocuments();
    }
  }, [currentUser, refreshTrigger]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentUser?.role !== 'ADMIN') {
        params.ownerId = currentUser.userId;
      }
      const res = await documentService.getDocuments(params);
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setDocuments(list);
    } catch (err) {
      toastError('Could not retrieve vault documents');
    } finally {
      setLoading(false);
    }
  };

  const getCategory = (doc) => {
    return (doc.category || doc.documentCategory || 'OTHER').toUpperCase();
  };

  const getTitle = (doc) => {
    return doc.documentTitle || doc.originalFileName || doc.fileName || 'Untitled';
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [
        getTitle(doc),
        getCategory(doc),
        doc.extractedText || '',
        doc.description || '',
      ].some((value) => String(value).toLowerCase().includes(query));
      const matchesCategory = category === 'ALL' || getCategory(doc) === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'OLDEST') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortOrder === 'NAME') {
        return getTitle(a).localeCompare(getTitle(b));
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const categories = [...new Set(documents.map(getCategory))];

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div className="documents-heading">
          <div className="documents-eyebrow">
            <span className="documents-eyebrow-dot" />
            DOCUMENT VAULT
          </div>
          <h1>All <span>Documents</span></h1>
          <p>Browse, search, sort, and manage all your secure encrypted files</p>
        </div>

        <button className="documents-upload-button" onClick={onUploadClick}>
          <span>↥</span>
          Upload Document
        </button>
      </div>

      <div className="documents-toolbar">
        <div className="documents-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by name, category, or OCR text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="documents-filter"
        >
          <option value="ALL">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="documents-filter"
        >
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
          <option value="NAME">Name A–Z</option>
        </select>

        <div className="documents-view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ▦
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="documents-result-bar">
        <div>
          <span className="documents-result-count">{filteredDocuments.length}</span>
          <span> documents in your vault</span>
        </div>
        {searchQuery && (
          <span className="documents-search-status">
            Searching for "{searchQuery}"
          </span>
        )}
      </div>

      {loading ? (
        <div className="documents-loading">
          <Loader text="Loading documents..." />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="documents-empty">
          <div className="documents-empty-icon">⌁</div>
          <h3>No documents found</h3>
          <p>
            {searchQuery || category !== 'ALL'
              ? 'Try changing your search or category filter.'
              : 'Upload your first document to start building your vault.'}
          </p>
          {!searchQuery && category === 'ALL' && (
            <button onClick={onUploadClick}>+ Upload Document</button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'documents-grid' : 'documents-list'}>
          <DocumentGrid
            documents={filteredDocuments}
            onSelectDocument={onSelectDocument}
            onPreviewDocument={onPreviewDocument}
            onToggleFavorite={async (docId) => {
              try {
                const res = await documentService.toggleFavorite(
                  docId,
                  currentUser.userId
                );
                setDocuments((prev) =>
                  prev.map((doc) =>
                    doc.id === docId
                      ? {
                          ...doc,
                          isFavorite: res.data.isFavorite,
                          favorite: res.data.isFavorite,
                        }
                      : doc
                  )
                );
              } catch (err) {
                toastError('Failed to update favorite status');
              }
            }}
            onShareDocument={onShareDocument}
            onDeleteDocument={async (docId) => {
              try {
                await documentService.deleteDocument(
                  docId,
                  currentUser.userId
                );
                setDocuments((prev) =>
                  prev.filter((doc) => doc.id !== docId)
                );
              } catch (err) {
                toastError('Failed to delete document');
              }
            }}
            onDownloadDocument={onDownloadDocument}
            onUploadClick={onUploadClick}
            searchQuery={searchQuery}
            viewMode={viewMode}
          />
        </div>
      )}

      {!loading && filteredDocuments.length > 0 && (
        <div className="documents-footer">
          <span>Showing {filteredDocuments.length} of {documents.length} documents</span>
        </div>
      )}
    </div>
  );
};

export default Documents;