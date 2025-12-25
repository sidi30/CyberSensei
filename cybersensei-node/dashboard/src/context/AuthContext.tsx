import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ⚠️ MODE BYPASS ACTIVÉ - AUTHENTIFICATION DÉSACTIVÉE
  const bypassAuth = true; // Activé pour accès direct au dashboard

  // Check if user is already logged in on mount
  useEffect(() => {
    if (bypassAuth) {
      // Mode bypass: créer un utilisateur fictif
      console.warn('⚠️ MODE BYPASS ACTIVÉ - Authentification désactivée');
      setUser({
        id: 1,
        name: 'Admin Bypass',
        email: 'admin@cybersensei.io',
        role: 'ADMIN',
        department: 'IT',
        active: true,
        createdAt: new Date().toISOString()
      });
      setIsLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      loadCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [bypassAuth]);

  const loadCurrentUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    // MODE BYPASS TEMPORAIRE - À RETIRER EN PRODUCTION
    if (bypassAuth) {
      console.warn('⚠️ MODE BYPASS ACTIVÉ - Authentification désactivée');
      setUser({
        id: 1,
        name: 'Admin Bypass',
        email: credentials.email,
        role: 'ADMIN',
        department: 'IT',
        active: true,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('token', 'bypass-token');
      return;
    }
    
    const response = await authAPI.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


