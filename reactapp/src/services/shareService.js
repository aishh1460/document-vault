import apiClient from './apiClient';

export const createShareLink = (requesterId, shareData) =>
  apiClient.post('/api/shares/create', shareData, { params: { requesterId } });

export const getShareByToken = (token) =>
  apiClient.get(`/api/shares/token/${token}`);

export const downloadSharedDocument = (token) =>
  apiClient.get(`/api/shares/download/${token}`, { responseType: 'blob' });

export const getSharesByDocument = (documentId, requesterId) =>
  apiClient.get(`/api/shares/document/${documentId}`, { params: { requesterId } });

export const getSharesByUser = (userId) =>
  apiClient.get(`/api/shares/user/${userId}`);

export const revokeShareLink = (shareId, requesterId) =>
  apiClient.delete(`/api/shares/${shareId}`, { params: { requesterId } });
