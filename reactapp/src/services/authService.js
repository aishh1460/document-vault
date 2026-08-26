import apiClient from './apiClient';

export const register = (registerData) => apiClient.post('/api/users/register', registerData);

export const login = (loginData) => apiClient.post('/api/auth/login', loginData);

export const adminLogin = (loginData) => apiClient.post('/api/admin/login', loginData);

export const logout = () => {
  const token = localStorage.getItem('vault_token');
  localStorage.removeItem('vault_token');
  localStorage.removeItem('vault_user');
  return apiClient.post('/api/auth/logout', null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getProfile = (userId) => apiClient.get('/api/users/profile', { params: { userId } });

export const updateProfile = (userId, profileData) => apiClient.put('/api/users/profile', profileData, { params: { userId } });

export const setupMfa = (userId, mfaData) => apiClient.post('/api/security/mfa/setup', mfaData, { params: { userId } });

export const rotateKeys = (userId) => apiClient.post('/api/security/keys/rotate', null, { params: { userId } });
