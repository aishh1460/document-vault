import apiClient from './apiClient';

export const getDashboardStats = (userId) =>
  apiClient.get('/api/dashboard/stats', { params: { userId } });

export const getAnalytics = (params = {}) =>
  apiClient.get('/api/analytics', { params });

export const getCategoryAnalytics = () =>
  apiClient.get('/api/analytics/categories');

export const getStorageAnalytics = () =>
  apiClient.get('/api/analytics/storage');
