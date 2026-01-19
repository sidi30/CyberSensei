export const config = {
  backendBaseUrl: process.env.BACKEND_BASE_URL || 'http://localhost:10000',
  scopes: ['User.Read', 'email', 'profile'],
};

