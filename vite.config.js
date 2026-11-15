import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API runs as a second process on 4000 and is reached through this dev
// server's proxy so the browser only ever talks to one origin (host port 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // The API answers its own CORS preflight; Vite's default CORS middleware
    // would short-circuit OPTIONS with 204 before the proxy forwards it.
    cors: false,
    // Bind-mounted sources do not always forward inotify events.
    watch: { usePolling: true, interval: 400 },
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:4000',
      },
    },
  },
});
