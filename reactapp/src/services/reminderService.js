import apiClient from './apiClient';

export const createReminder = (userId, documentId, message, remindAt) =>
  apiClient.post('/api/reminders', { userId, documentId, message, remindAt });

export const getRemindersByUser = (userId) =>
  apiClient.get(`/api/reminders/user/${userId}`);

export const getRemindersByDocument = (documentId) =>
  apiClient.get(`/api/reminders/document/${documentId}`);

export const dismissReminder = (reminderId) =>
  apiClient.patch(`/api/reminders/${reminderId}/dismiss`);

export const deleteReminder = (reminderId) =>
  apiClient.delete(`/api/reminders/${reminderId}`);
