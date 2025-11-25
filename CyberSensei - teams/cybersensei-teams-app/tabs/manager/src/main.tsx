import React from 'react';
import ReactDOM from 'react-dom/client';
import { app } from '@microsoft/teams-js';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

// Initialiser le SDK Teams
app.initialize().then(() => {
  console.log('Teams SDK initialized');
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  );
}).catch((error) => {
  console.error('Failed to initialize Teams SDK:', error);
  
  // Fallback pour le développement hors Teams
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  );
});

