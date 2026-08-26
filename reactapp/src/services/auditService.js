import apiClient from './apiClient';

export const getAuditLogs = (userId) =>
  apiClient.get('/api/audit/logs', { params: { userId } });

export const getSecurityAuditLogs = (userId) =>
  apiClient.get('/api/security/audit', { params: { userId } });

export const initiateForensics = (userId) =>
  apiClient.post('/api/audit/forensics', null, { params: { userId } });

export const getComplianceStatus = () =>
  apiClient.get('/api/compliance/status');

export const getComplianceReports = () =>
  apiClient.get('/api/compliance/reports');

export const createPolicy = (policyData) =>
  apiClient.post('/api/compliance/policies', policyData);

export const placeLegalHold = (holdData) =>
  apiClient.post('/api/legal-hold', holdData);

export const reportIncident = (incidentData) =>
  apiClient.post('/api/security/incidents', incidentData);

export const initiateAccessReview = (userId) =>
  apiClient.post('/api/security/access-review', null, { params: { userId } });

export const getSecurityCompliance = () =>
  apiClient.get('/api/security/compliance');
