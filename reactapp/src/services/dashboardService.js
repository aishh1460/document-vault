import apiClient from './apiClient';

export const getDashboardStats = (userId) =>
  apiClient.get('/api/dashboard/stats', { params: { userId } });
