export const config = {
  backendBaseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  scopes: ['User.Read', 'email', 'profile'],
};

