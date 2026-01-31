import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: '/tabs/manager/',
    server: {
      port: 5176,
      https: false,
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
