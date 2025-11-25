import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authentication, app } from '@microsoft/teams-js';
import { Client } from '@microsoft/microsoft-graph-client';
import type { GraphUser } from '../types';
import { config } from '../config';

interface AuthContextType {
  token: string | null;
  user: GraphUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
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
    } catch (err) {
      console.error('Auth error:', err);
      setError('Erreur d\'authentification. Veuillez vous reconnecter.');
      
      if (import.meta.env.DEV) {
        console.warn('Using development mode - mock data');
        setToken('dev-token');
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

  return (
    <AuthContext.Provider value={{ token, user, loading, error, refetch: initAuth }}>
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

