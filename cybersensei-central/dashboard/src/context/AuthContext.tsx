import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  // MODE BYPASS - Utilisateur par défaut toujours connecté
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Admin',
    email: 'admin@cybersensei.io',
    role: 'SUPERADMIN' as AdminRole,
    active: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });
  const [loading] = useState(false);

  useEffect(() => {
    // Authentification désactivée - utilisateur toujours connecté
    console.warn('⚠️ MODE BYPASS ACTIVÉ - Authentification désactivée');
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
    isAuthenticated: true, // Toujours authentifié
    isSuperAdmin: true, // Toujours super admin
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

