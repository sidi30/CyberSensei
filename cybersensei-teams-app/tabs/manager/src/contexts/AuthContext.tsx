import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authentication, app } from '@microsoft/teams-js';
import { Client } from '@microsoft/microsoft-graph-client';
import axios from 'axios';
import type { GraphUser } from '../types';
import { config } from '../config';

interface AuthContextType {
  token: string | null;
  backendToken: string | null;
  user: GraphUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const context = await app.getContext();
      
      if (!context) {
        throw new Error('Not running in Teams context');
      }

      const authToken = await authentication.getAuthToken({
        resources: config.scopes,
      });

      setToken(authToken);

      const graphUser = await fetchGraphUser(authToken);
      setUser(graphUser);

      // Échanger le token Teams contre un JWT backend
      const backendJwt = await exchangeTeamsTokenForBackendJwt(graphUser, context);
      setBackendToken(backendJwt);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Erreur d\'authentification. Veuillez vous reconnecter.');
      
      if (import.meta.env.DEV) {
        console.warn('Using development mode - mock data');
        setToken('dev-token');
        setBackendToken('dev-backend-token');
        setUser({
          id: 'dev-manager-123',
          displayName: 'Marie Dupont',
          mail: 'marie.dupont@company.com',
          jobTitle: 'Responsable Sécurité',
          department: 'IT Security',
          userPrincipalName: 'marie.dupont@company.com',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphUser = async (accessToken: string): Promise<GraphUser> => {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const user = await client
      .api('/me')
      .select('id,displayName,mail,jobTitle,department,userPrincipalName')
      .get();

    return {
      id: user.id,
      displayName: user.displayName,
      mail: user.mail || user.userPrincipalName,
      jobTitle: user.jobTitle,
      department: user.department,
      userPrincipalName: user.userPrincipalName,
    };
  };

  /**
   * Échange le token Teams contre un JWT backend
   */
  const exchangeTeamsTokenForBackendJwt = async (
    graphUser: GraphUser,
    context: any
  ): Promise<string> => {
    try {
      const response = await axios.post(
        `${config.backendBaseUrl}/api/auth/teams/exchange`,
        {
          teamsUserId: graphUser.id,
          email: graphUser.mail || graphUser.userPrincipalName,
          displayName: graphUser.displayName,
          department: graphUser.department,
          jobTitle: graphUser.jobTitle,
          tenantId: context.user?.tenant?.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from backend auth exchange');
      }

      return response.data.token;
    } catch (error) {
      console.error('Error exchanging Teams token for backend JWT:', error);
      throw new Error('Impossible d\'obtenir un token backend. Vérifiez la connexion au backend.');
    }
  };

  return (
    <AuthContext.Provider value={{ token, backendToken, user, loading, error, refetch: initAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

