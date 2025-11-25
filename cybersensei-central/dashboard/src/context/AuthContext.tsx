import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import type { User, LoginCredentials, AdminRole } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    async function checkAuth() {
      if (api.isAuthenticated()) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          api.clearAuth();
        }
      }
      setLoading(false);
    }

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await api.login(credentials);
    setUser(response.user as User);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    if (api.isAuthenticated()) {
      const profile = await api.getProfile();
      setUser(profile);
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: api.isAuthenticated(),
    isSuperAdmin: user?.role === 'SUPERADMIN',
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

