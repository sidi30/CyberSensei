/**
 * CyberSensei Teams - Manager Authentication Context
 * Handles Microsoft Teams SSO with Azure AD and backend JWT exchange
 * Production-ready with fallback for development/standalone mode
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authentication, app, HostClientType } from '@microsoft/teams-js';
import { Client } from '@microsoft/microsoft-graph-client';
import axios from 'axios';
import type { GraphUser } from '../types';
import { config } from '../config';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AuthContextType {
  token: string | null;
  backendToken: string | null;
  user: GraphUser | null;
  loading: boolean;
  error: string | null;
  isTeamsContext: boolean;
  tenantId: string | null;
  refetch: () => Promise<void>;
  logout: () => void;
}

interface TeamsContext {
  user?: {
    tenant?: {
      id: string;
    };
    id?: string;
  };
  app?: {
    host?: {
      clientType?: HostClientType;
    };
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Context
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for token persistence
const STORAGE_KEYS = {
  BACKEND_TOKEN: 'cybersensei_manager_backend_token',
  USER_DATA: 'cybersensei_manager_user_data',
  TOKEN_EXPIRY: 'cybersensei_manager_token_expiry',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamsContext, setIsTeamsContext] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Check if running in Teams
  const checkTeamsContext = useCallback(async (): Promise<boolean> => {
    try {
      const inIframe = window.self !== window.top;
      
      if (!inIframe && !import.meta.env.DEV) {
        return false;
      }

      await app.initialize();
      const context = await app.getContext();
      
      return !!context;
    } catch {
      return false;
      }
  }, []);

  // Get cached credentials if valid
  const getCachedCredentials = useCallback((): { token: string; user: GraphUser } | null => {
    try {
      const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!expiry || Date.now() > parseInt(expiry, 10)) {
        return null;
      }

      const cachedToken = localStorage.getItem(STORAGE_KEYS.BACKEND_TOKEN);
      const cachedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (cachedToken && cachedUser) {
        return {
          token: cachedToken,
          user: JSON.parse(cachedUser),
        };
      }
    } catch (err) {
      console.warn('Error reading cached credentials:', err);
    }
    return null;
  }, []);

  // Save credentials to cache
  const cacheCredentials = useCallback((backendJwt: string, userData: GraphUser) => {
    try {
      const expiry = Date.now() + 23 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEYS.BACKEND_TOKEN, backendJwt);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
    } catch (err) {
      console.warn('Error caching credentials:', err);
    }
  }, []);

  // Clear cached credentials
  const clearCache = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.BACKEND_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  }, []);

  // Fetch user from Microsoft Graph
  const fetchGraphUser = async (accessToken: string): Promise<GraphUser> => {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const userData = await client
      .api('/me')
      .select('id,displayName,mail,jobTitle,department,userPrincipalName')
      .get();

    return {
      id: userData.id,
      displayName: userData.displayName,
      mail: userData.mail || userData.userPrincipalName,
      jobTitle: userData.jobTitle,
      department: userData.department,
      userPrincipalName: userData.userPrincipalName,
    };
  };

  // Exchange Teams token for backend JWT
  const exchangeTeamsTokenForBackendJwt = async (
    graphUser: GraphUser,
    context: TeamsContext
  ): Promise<string> => {
      const response = await axios.post(
        `${config.backendBaseUrl}/api/auth/teams/exchange`,
        {
          teamsUserId: graphUser.id,
          email: graphUser.mail || graphUser.userPrincipalName,
          displayName: graphUser.displayName,
          department: graphUser.department,
          jobTitle: graphUser.jobTitle,
        tenantHint: context.user?.tenant?.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        timeout: 15000,
        }
      );

    if (!response.data?.token) {
        throw new Error('Invalid response from backend auth exchange');
      }

      return response.data.token;
  };

  // Main authentication flow
  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const inTeams = await checkTeamsContext();
      setIsTeamsContext(inTeams);

      // Development/Standalone mode
      if (!inTeams) {
        console.warn('⚠️ MODE STANDALONE - Pas dans Teams, connexion au backend en mode dev');

        const cached = getCachedCredentials();
        if (cached) {
          setBackendToken(cached.token);
          setUser(cached.user);
          setToken('cached-token');
          setLoading(false);
          return;
        }

        // Try to authenticate with backend dev-login endpoint
        try {
          const response = await axios.post(
            `${config.backendBaseUrl}/api/auth/dev-login?role=MANAGER`,
            {},
            { timeout: 10000 }
          );

          if (response.data?.token) {
            const devUser: GraphUser = {
              id: response.data.userId?.toString() || 'dev-manager',
              displayName: response.data.displayName || 'Manager Test',
              mail: response.data.email || 'manager@entreprise.fr',
              jobTitle: 'Responsable Securite',
              department: 'IT Security',
              userPrincipalName: response.data.email || 'manager@entreprise.fr',
            };

            setToken('dev-token');
            setBackendToken(response.data.token);
            setUser(devUser);
            cacheCredentials(response.data.token, devUser);
            console.log('✅ Dev login (Manager) successful:', devUser.displayName);
            setLoading(false);
            return;
          }
        } catch (devErr) {
          console.error('Dev login failed:', devErr);
          setError('Backend non disponible. Demarrez le backend avec: docker compose --profile node up -d');
          setLoading(false);
          return;
        }
      }

      // Production Teams SSO flow
      console.log('🔐 Initializing Teams SSO authentication (Manager)...');

      const context = await app.getContext() as TeamsContext;
      setTenantId(context.user?.tenant?.id || null);

      const authToken = await authentication.getAuthToken({
        resources: config.scopes,
        silent: true,
      });

      setToken(authToken);

      const graphUser = await fetchGraphUser(authToken);
      setUser(graphUser);

      const backendJwt = await exchangeTeamsTokenForBackendJwt(graphUser, context);
      setBackendToken(backendJwt);

      cacheCredentials(backendJwt, graphUser);

      console.log('✅ Authentication successful for:', graphUser.displayName);
    } catch (err) {
      console.error('Authentication error:', err);

      const cached = getCachedCredentials();
      if (cached) {
        console.log('Using cached credentials as fallback');
        setBackendToken(cached.token);
        setUser(cached.user);
        setToken('cached-token');
      } else {
        setError('Erreur d\'authentification. Veuillez actualiser la page ou contacter le support.');
      }
    } finally {
      setLoading(false);
    }
  }, [checkTeamsContext, getCachedCredentials, cacheCredentials]);

  // Logout function
  const logout = useCallback(() => {
    clearCache();
    setToken(null);
    setBackendToken(null);
    setUser(null);
    setError(null);
  }, [clearCache]);

  // Initialize on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <AuthContext.Provider
      value={{
        token,
        backendToken,
        user,
        loading,
        error,
        isTeamsContext,
        tenantId,
        refetch: initAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
