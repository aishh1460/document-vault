import React, { useState } from 'react';

const DocumentUploadForm = ({ onUpload }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!title) {
        const name = e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, '');
        setTitle(name);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        const name = e.target.files[0].name.replace(/\.[^/.]+$/, '');
        setTitle(name);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      return;
    }
    if (onUpload) {
      onUpload(file, title, category);
    }
    setTitle('');
    setCategory('');
    setFile(null);
  };

  return (
    <div className="glass-card mb-4">
      <h3 className="mb-4">Secure File Ingestion</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label">Title / Label</label>
          <input
            type="text"
            className="form-input"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Classification Category</label>
          <input
            type="text"
            className="form-input"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.getElementById('file-upload-input');
            if (input) input.click();
          }}
        >
          <span className="dropzone-icon">📥</span>
          <p className="font-semibold text-sm">
            {file ? `Selected: ${file.name}` : 'Drag & drop file here or click to browse'}
          </p>
          <p className="text-muted text-sm">Supports PDF, DOCX, XLSX up to 50MB</p>
          <input
            id="file-upload-input"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4">
          Upload
        </button>
      </form>
    </div>
  );
};

export default DocumentUploadForm;
