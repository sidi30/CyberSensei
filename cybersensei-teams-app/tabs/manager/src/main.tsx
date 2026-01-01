import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

// Mode standalone : si on n'est pas dans un iframe (donc pas dans Teams), on ne tente pas d'initialiser le SDK
const isStandalone = !window.parent || window.parent === window;

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  );
};

if (isStandalone) {
  // En dehors de Teams (navigateur normal)
  renderApp();
} else {
  // Dans Teams, on initialise le SDK
  import('@microsoft/teams-js').then(({ app }) => {
    app.initialize()
      .then(() => {
        console.log('Teams SDK initialized');
        renderApp();
      })
      .catch((error) => {
        console.error('Failed to initialize Teams SDK:', error);
        renderApp(); // fallback
      });
  });
}

