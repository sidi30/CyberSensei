export const config = {
  backendBaseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:8080',
  scopes: ['User.Read', 'email', 'profile'],
};

