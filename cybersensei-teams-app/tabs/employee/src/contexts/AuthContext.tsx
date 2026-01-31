/**
 * CyberSensei Teams - Authentication Context
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
  userPhoto: string | null;
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
  BACKEND_TOKEN: 'cybersensei_backend_token',
  USER_DATA: 'cybersensei_user_data',
  TOKEN_EXPIRY: 'cybersensei_token_expiry',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTeamsContext, setIsTeamsContext] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Check if running in Teams
  const checkTeamsContext = useCallback(async (): Promise<boolean> => {
    try {
      // Check if in iframe (Teams embeds tabs in iframes)
      const inIframe = window.self !== window.top;
      
      if (!inIframe && !import.meta.env.DEV) {
        return false;
      }

      // Try to initialize Teams SDK
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
      // Token expires in 23 hours (give 1 hour buffer for 24h tokens)
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

  // Fetch user photo from Microsoft Graph
  const fetchUserPhoto = async (accessToken: string): Promise<string | null> => {
    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });

      const photo = await client.api('/me/photo/$value').get();
      const blob = new Blob([photo], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch {
      console.warn('Could not fetch user photo');
      return null;
    }
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

      // Check if we're in Teams
      const inTeams = await checkTeamsContext();
      setIsTeamsContext(inTeams);

      // Development/Standalone mode
      if (!inTeams) {
        console.warn('⚠️ MODE STANDALONE - Pas dans Teams, utilisation de données de test');
        
        // Check for cached credentials first
        const cached = getCachedCredentials();
        if (cached) {
          setBackendToken(cached.token);
          setUser(cached.user);
          setToken('cached-token');
          setLoading(false);
          return;
        }

        // Use dev user
        const devUser: GraphUser = {
          id: 'dev-user-' + Math.random().toString(36).substring(7),
          displayName: 'Utilisateur Test',
          mail: 'test@entreprise.fr',
          jobTitle: 'Employé',
          department: 'IT',
          userPrincipalName: 'test@entreprise.fr',
        };

        setToken('dev-token');
        setBackendToken('bypass-token');
        setUser(devUser);
        setLoading(false);
        return;
      }

      // Production Teams SSO flow
      console.log('🔐 Initializing Teams SSO authentication...');

      // Get Teams context
      const context = await app.getContext() as TeamsContext;
      setTenantId(context.user?.tenant?.id || null);

      // Get authentication token from Teams
      const authToken = await authentication.getAuthToken({
        resources: config.scopes,
        silent: true,
      });

      setToken(authToken);

      // Fetch user info from Microsoft Graph
      const graphUser = await fetchGraphUser(authToken);
      setUser(graphUser);

      // Exchange token for backend JWT
      const backendJwt = await exchangeTeamsTokenForBackendJwt(graphUser, context);
      setBackendToken(backendJwt);

      // Cache credentials
      cacheCredentials(backendJwt, graphUser);

      // Fetch user photo (non-blocking)
      fetchUserPhoto(authToken).then(setUserPhoto).catch(() => {});

      console.log('✅ Authentication successful for:', graphUser.displayName);
    } catch (err) {
      console.error('Authentication error:', err);

      // Try to use cached credentials as fallback
      const cached = getCachedCredentials();
      if (cached) {
        console.log('Using cached credentials as fallback');
        setBackendToken(cached.token);
        setUser(cached.user);
        setToken('cached-token');
      } else if (import.meta.env.DEV) {
        // Dev fallback
        console.warn('Using development fallback');
        setToken('dev-token');
        setBackendToken('bypass-token');
        setUser({
          id: 'dev-user-fallback',
          displayName: 'Utilisateur Test (Fallback)',
          mail: 'test@entreprise.fr',
          jobTitle: 'Employé',
          department: 'IT',
          userPrincipalName: 'test@entreprise.fr',
        });
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
    setUserPhoto(null);
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
        userPhoto,
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
