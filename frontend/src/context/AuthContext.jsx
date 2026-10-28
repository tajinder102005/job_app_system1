import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getRole, getUserName, getUserEmail, getUserId, getUserStatus, getCompanyId, getCompanyName, setAuth, clearAuth, ROLES } from '../utils/auth';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [role, setRoleState] = useState(getRole());
  const [name, setNameState] = useState(getUserName());
  const [email, setEmailState] = useState(getUserEmail());
  const [userId, setUserIdState] = useState(getUserId());
  const [status, setStatusState] = useState(getUserStatus());
  const [companyId, setCompanyIdState] = useState(getCompanyId());
  const [companyName, setCompanyNameState] = useState(getCompanyName());
  const [loading, setLoading] = useState(false);

  const syncFromStorage = () => {
    setTokenState(getToken());
    setRoleState(getRole());
    setNameState(getUserName());
    setEmailState(getUserEmail());
    setUserIdState(getUserId());
    setStatusState(getUserStatus());
    setCompanyIdState(getCompanyId());
    setCompanyNameState(getCompanyName());
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      const data = res.data;
      setAuth(data);
      syncFromStorage();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please check credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      const data = res.data;
      setAuth(data);
      syncFromStorage();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.response?.data?.error || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    syncFromStorage();
    window.location.href = '/';
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        name,
        email,
        userId,
        status,
        companyId,
        companyName,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        syncFromStorage,
        ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
