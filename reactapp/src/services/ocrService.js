import apiClient from './apiClient';

export const extractText = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/api/ocr/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const processDocumentOcr = (documentId) =>
  apiClient.post(`/api/documents/${documentId}/ocr`);

export const getOcrStatus = (documentId) =>
  apiClient.get(`/api/documents/${documentId}/ocr`);
