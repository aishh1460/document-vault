import apiClient from './apiClient';

export const getNotificationsByUser = (userId) => apiClient.get(`/api/notifications/user/${userId}`);

export const getUnreadNotifications = (userId) => apiClient.get(`/api/notifications/user/${userId}/unread`);

export const markAsRead = (notificationId) => apiClient.patch(`/api/notifications/${notificationId}/read`);

export const markAllRead = (userId) => apiClient.patch(`/api/notifications/user/${userId}/read-all`);

export const deleteNotification = (notificationId) => apiClient.delete(`/api/notifications/${notificationId}`);
