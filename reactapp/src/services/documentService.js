import apiClient from './apiClient';

export const uploadDocument = (file, ownerId, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata.category) formData.append('category', metadata.category);
  if (metadata.title) formData.append('title', metadata.title);
  if (metadata.folderId) formData.append('folderId', metadata.folderId);
  if (metadata.tags) formData.append('tags', metadata.tags);

  return apiClient.post('/api/documents/upload', formData, {
    params: { ownerId, ...metadata },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDocuments = (params = {}) => apiClient.get('/api/documents', { params });

export const getDocumentById = (id, requesterId) => apiClient.get(`/api/documents/${id}`, { params: { requesterId } });

export const searchDocuments = (q, ownerId) => apiClient.get('/api/documents/search', { params: { q, ownerId } });

export const renameDocument = (id, requesterId, newName) => apiClient.patch(`/api/documents/${id}/rename`, null, { params: { requesterId, newName } });

export const moveDocument = (id, requesterId, category) => apiClient.patch(`/api/documents/${id}/move`, null, { params: { requesterId, category } });

export const moveToFolder = (id, requesterId, folderId) => apiClient.patch(`/api/documents/${id}/move-to-folder`, null, { params: { requesterId, folderId } });

export const deleteDocument = (id, requesterId) => {
  const rId = requesterId || JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;
  return apiClient.delete(`/api/documents/${id}`, { params: { requesterId: rId } });
};

export const restoreDocument = (id, requesterId) => apiClient.patch(`/api/documents/${id}/restore`, null, { params: { requesterId } });

export const archiveDocument = (id, requesterId) => apiClient.patch(`/api/documents/${id}/archive`, null, { params: { requesterId } });

export const permanentlyDelete = (id, requesterId) => {
  const rId = requesterId || JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;
  return apiClient.delete(`/api/documents/${id}/permanent`, { params: { requesterId: rId } });
};

export const downloadDocument = (id, requesterId) => {
  const rId = requesterId || JSON.parse(localStorage.getItem('vault_user') || '{}').userId || 1;
  return apiClient.get(`/api/documents/download/${id}`, {
    params: { requesterId: rId },
    responseType: 'blob',
  });
};

export const uploadNewVersion = (id, file, requesterId, changeDescription = '') => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/api/documents/${id}/version`, formData, {
    params: { requesterId, changeDescription },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDocumentVersions = (id, requesterId, page = 0, size = 20) =>
  apiClient.get(`/api/documents/${id}/versions`, { params: { requesterId, page, size } });

export const restoreVersion = (id, targetVersion, requesterId) =>
  apiClient.patch(`/api/documents/${id}/version/${targetVersion}`, null, { params: { requesterId } });

export const toggleFavorite = (documentId, requesterId) =>
  apiClient.patch(`/api/favorites/${documentId}/toggle`, null, { params: { requesterId } });

export const getFavorites = (userId, params = {}) =>
  apiClient.get(`/api/favorites/user/${userId}`, { params });

export const getTrash = (ownerId, params = {}) =>
  apiClient.get('/api/documents/trash', { params: { ownerId, ...params } });

export const emptyTrash = (ownerId) =>
  apiClient.delete('/api/documents/trash', { params: { ownerId } });

export const purgeExpiredTrash = (retentionDays = 30) =>
  apiClient.post('/api/documents/trash/purge', null, { params: { retentionDays } });

export const getExpiredDocuments = (ownerId) =>
  apiClient.get('/api/documents/expired', { params: { ownerId } });

export const checkExpiredDocuments = () =>
  apiClient.post('/api/documents/expired/check');

