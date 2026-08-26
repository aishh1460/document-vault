import apiClient from './apiClient';

export const getDocumentVersions = (documentId, requesterId) =>
  apiClient.get(`/api/documents/${documentId}/versions`, { params: { requesterId } });

export const uploadNewVersion = (documentId, file, requesterId, changeDescription = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (changeDescription) {
    formData.append('changeDescription', changeDescription);
  }
  return apiClient.post(`/api/documents/${documentId}/version`, formData, {
    params: { requesterId },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const restoreVersion = (documentId, targetVersion, requesterId) =>
  apiClient.patch(`/api/documents/${documentId}/version/${targetVersion}`, null, { params: { requesterId } });

export const downloadVersion = (documentId, versionNumber, requesterId) =>
  apiClient.get(`/api/documents/${documentId}/version/${versionNumber}/download`, {
    params: { requesterId },
    responseType: 'blob',
  });
