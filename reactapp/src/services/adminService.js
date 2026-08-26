import apiClient from './apiClient';

export const adminLogin = (loginData) =>
  apiClient.post('/api/admin/login', loginData);

export const getAdminUsers = () =>
  apiClient.get('/api/admin/users');

export const getAdminDocuments = () =>
  apiClient.get('/api/admin/documents');

export const getAdminStats = () =>
  apiClient.get('/api/admin/stats');

export const getSystemHealth = () =>
  apiClient.get('/api/admin/health');

export const exportBackup = (requesterId) =>
  apiClient.get('/api/backup/export', {
    params: { requesterId },
    responseType: 'blob',
  });

export const restoreBackup = (file, requesterId) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/api/backup/restore', formData, {
    params: { requesterId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getBackupStatus = () =>
  apiClient.get('/api/backup/status');

