import apiClient from './apiClient';

export const getUserActivities = (userId) => apiClient.get(`/api/activity/user/${userId}`);
export const getRecentActivities = () => apiClient.get('/api/activity/recent');
export const getDocumentActivities = (documentId) => apiClient.get(`/api/activity/document/${documentId}`);

