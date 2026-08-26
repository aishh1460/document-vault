import apiClient from './apiClient';

export const getAllTags = () => apiClient.get('/api/tags');

export const createTag = (name) => apiClient.post('/api/tags', { name });

export const renameTag = (id, name) => apiClient.patch(`/api/tags/${id}`, { name });

export const deleteTag = (id) => apiClient.delete(`/api/tags/${id}`);

export const attachTag = (documentId, tagId) => apiClient.post(`/api/documents/${documentId}/tags/${tagId}`);

export const detachTag = (documentId, tagId) => apiClient.delete(`/api/documents/${documentId}/tags/${tagId}`);
