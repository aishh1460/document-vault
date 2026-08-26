import apiClient from './apiClient';

export const getFoldersByOwner = (ownerId) => apiClient.get(`/api/folders/user/${ownerId}`);

export const getChildFolders = (folderId) => apiClient.get(`/api/folders/${folderId}/children`);

export const createFolder = (ownerId, name, parentId = null) =>
  apiClient.post('/api/folders', null, { params: { ownerId, name, parentId } });

export const renameFolder = (folderId, ownerId, name) =>
  apiClient.patch(`/api/folders/${folderId}/rename`, { name }, { params: { ownerId } });

export const deleteFolder = (folderId, ownerId) =>
  apiClient.delete(`/api/folders/${folderId}`, { params: { ownerId } });
