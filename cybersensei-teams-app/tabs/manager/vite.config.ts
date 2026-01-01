import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    https: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.BACKEND_BASE_URL': JSON.stringify(
      process.env.BACKEND_BASE_URL || 'http://localhost:8080'
    ),
  },
});

