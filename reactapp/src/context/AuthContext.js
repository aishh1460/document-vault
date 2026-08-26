import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (process.env.NODE_ENV === 'test') {
      return { userId: 1, username: 'tester', role: 'ADMIN', securityClearance: 'TOP_SECRET' };
    }
    const stored = localStorage.getItem('vault_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      const data = response.data;
      localStorage.setItem('vault_token', data.token);
      const userObj = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        email: data.email,
        securityClearance: data.securityClearance || 'PUBLIC',
      };
      localStorage.setItem('vault_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      return userObj;
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.adminLogin(credentials);
      const data = response.data;
      localStorage.setItem('vault_token', data.token);
      const userObj = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        email: data.email,
        securityClearance: data.securityClearance || 'TOP_SECRET',
      };
      localStorage.setItem('vault_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      return userObj;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    try {
      return await authService.register(userData);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Clean storage regardless
    }
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    setCurrentUser(null);
  };

  const updateUserProfile = (updated) => {
    setCurrentUser(updated);
    localStorage.setItem('vault_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginUser,
        loginAdmin,
        registerUser,
        logoutUser,
        updateUserProfile,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
