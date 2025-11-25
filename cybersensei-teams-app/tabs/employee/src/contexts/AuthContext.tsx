import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authentication, app } from '@microsoft/teams-js';
import { Client } from '@microsoft/microsoft-graph-client';
import type { GraphUser } from '../types';
import { config } from '../config';

interface AuthContextType {
  token: string | null;
  user: GraphUser | null;
  userPhoto: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GraphUser | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si on est dans Teams
      const context = await app.getContext();
      
      if (!context) {
        throw new Error('Not running in Teams context');
      }

      // Obtenir le token d'authentification
      const authToken = await authentication.getAuthToken({
        resources: config.scopes,
      });

      setToken(authToken);

      // Récupérer les informations utilisateur via Graph
      const graphUser = await fetchGraphUser(authToken);
      setUser(graphUser);

      // Récupérer la photo
      const photo = await fetchUserPhoto(authToken);
      setUserPhoto(photo);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Erreur d\'authentification. Veuillez vous reconnecter.');
      
      // En développement, on peut utiliser un token et utilisateur de test
      if (import.meta.env.DEV) {
        console.warn('Using development mode - mock data');
        setToken('dev-token');
        setUser({
          id: 'dev-user-123',
          displayName: 'John Doe',
          mail: 'john.doe@company.com',
          jobTitle: 'Développeur',
          department: 'IT',
          userPrincipalName: 'john.doe@company.com',
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

  const fetchUserPhoto = async (accessToken: string): Promise<string | null> => {
    try {
      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });

      const photo = await client.api('/me/photo/$value').get();
      
      // Convertir le blob en URL
      const blob = new Blob([photo], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn('Could not fetch user photo:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, userPhoto, loading, error, refetch: initAuth }}>
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

