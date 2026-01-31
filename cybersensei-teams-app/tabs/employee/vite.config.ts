import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // En dev, on utilise '/' pour éviter les problèmes de routing
  // En prod, on utilise '/tabs/employee/' pour Teams
  const base = mode === 'development' ? '/' : '/tabs/employee/';

  return {
    plugins: [react()],
    base,
    server: {
      port: 5175,
      https: false,
      host: true, // Permet l'accès depuis l'extérieur
      cors: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
        env.VITE_BACKEND_URL || 'http://localhost:8080'
      ),
    },
  };
});
