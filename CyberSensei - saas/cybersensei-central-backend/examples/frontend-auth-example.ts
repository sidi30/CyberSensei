/**
 * Exemple d'implémentation frontend pour l'authentification
 * Compatible React, Vue, Angular, ou Vanilla JS
 */

// ============================================
// 1. AUTH SERVICE
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'SUPERADMIN' | 'SUPPORT';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'SUPPORT';
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface LoginResponse {
  access_token: string;
  user: Omit<User, 'active' | 'createdAt' | 'lastLoginAt'>;
}

class AuthService {
  private baseUrl: string;
  private tokenKey: string = 'access_token';
  private userKey: string = 'user';

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Se connecter
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();

    // Stocker le token et l'utilisateur
    this.setToken(data.access_token);
    this.setUser(data.user);

    return data;
  }

  /**
   * Se déconnecter
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(): Promise<User> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/auth/me`);

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to fetch profile');
    }

    const user: User = await response.json();
    this.setUser(user);
    return user;
  }

  /**
   * Créer un nouvel administrateur (SUPERADMIN only)
   */
  async register(data: RegisterData): Promise<User> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Lister tous les administrateurs (SUPERADMIN only)
   */
  async getAllAdmins(): Promise<User[]> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/auth/admins`);

    if (!response.ok) {
      throw new Error('Failed to fetch admins');
    }

    return response.json();
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: 'SUPERADMIN' | 'SUPPORT'): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  /**
   * Vérifier si l'utilisateur est SUPERADMIN
   */
  isSuperAdmin(): boolean {
    return this.hasRole('SUPERADMIN');
  }

  /**
   * Récupérer le token depuis localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Stocker le token dans localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Récupérer l'utilisateur depuis localStorage
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Stocker l'utilisateur dans localStorage
   */
  private setUser(user: Partial<User>): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Effectuer une requête avec authentification
   */
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

// ============================================
// 2. UTILISATION (REACT EXAMPLE)
// ============================================

// Initialiser le service
const authService = new AuthService('http://localhost:3000');

// ----------------------------------------
// Login Component
// ----------------------------------------

/*
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log('✅ Login successful:', response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
*/

// ----------------------------------------
// Protected Route Component
// ----------------------------------------

/*
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'SUPERADMIN' | 'SUPPORT';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (requiredRole && !authService.hasRole(requiredRole)) {
      navigate('/unauthorized');
    }
  }, [requiredRole, navigate]);

  if (!authService.isAuthenticated()) {
    return null;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}
*/

// ----------------------------------------
// App Component with Routes
// ----------------------------------------

/*
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute requiredRole="SUPERADMIN">
              <UploadPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}
*/

// ----------------------------------------
// Auth Context (React)
// ----------------------------------------

/*
interface AuthContextValue {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    async function verifyToken() {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    }

    verifyToken();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    isSuperAdmin: authService.isSuperAdmin(),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
*/

// ----------------------------------------
// Usage in Components
// ----------------------------------------

/*
function DashboardPage() {
  const { user, logout, isSuperAdmin } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {user?.role}</p>
      
      {isSuperAdmin && (
        <Link to="/admin/users">Manage Admins</Link>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function AdminUsersPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const data = await authService.getAllAdmins();
        setAdmins(data);
      } catch (error) {
        console.error('Failed to fetch admins:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdmins();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.role}</td>
              <td>{admin.lastLoginAt || 'Never'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/

// ============================================
// 3. AXIOS INTERCEPTOR (Alternative)
// ============================================

/*
import axios from 'axios';

// Créer une instance axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Utilisation
async function fetchGlobalSummary() {
  const response = await api.get('/admin/global/summary');
  return response.data;
}
*/

// ============================================
// EXPORT
// ============================================

export default authService;
export { AuthService };
export type { LoginCredentials, RegisterData, User, LoginResponse };

