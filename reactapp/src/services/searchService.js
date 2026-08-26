import apiClient from './apiClient';

export const searchDocuments = (q, ownerId, filters = {}) =>
  apiClient.get('/api/documents/search', { params: { q, ownerId, ...filters } });

export const advancedSearch = (searchParams = {}) =>
  apiClient.get('/api/documents/search', { params: searchParams });
