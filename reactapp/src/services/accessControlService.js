import apiClient from './apiClient';

export const grantAccess = (granterId, accessData) =>
  apiClient.post('/api/access/grant', accessData, { params: { granterId } });

export const revokeAccess = (revokeData) =>
  apiClient.post('/api/access/revoke', revokeData);

export const getPermissionsMatrix = (userId) =>
  apiClient.get('/api/access/permissions', { params: { userId } });

export const getDocumentPermissions = (documentId, requesterId) =>
  apiClient.get(`/api/access/document/${documentId}`, { params: { requesterId } });

export const getAccessReview = (ownerId) =>
  apiClient.get('/api/access/review', { params: { ownerId } });

export const cleanupExpiredGrants = () =>
  apiClient.post('/api/access/cleanup-expired');

