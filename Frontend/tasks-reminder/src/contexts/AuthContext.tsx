import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [showAuthModal, setShowAuthModal] = useState(!localStorage.getItem('token'));

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Invalid credentials');
    }
    
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    setShowAuthModal(false);
  };

  const register = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || 'Registration failed');
    }
    
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    setShowAuthModal(false);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (!token) {
      setShowAuthModal(true);
    }
  }, [token]);

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    showAuthModal,
    setShowAuthModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};