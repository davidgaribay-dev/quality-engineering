import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(here, './src'),
      // Resolve the workspace contract package straight to its TS source so
      // Vite transpiles it as part of the app (no build step in dev).
      '@org/contracts': resolve(here, '../contracts/src/index.ts'),
    },
  },
  server: {
    port: 4200,
    // The SPA calls the API same-origin; Vite proxies /api and /images to Hono.
    proxy: {
      '/api': 'http://localhost:3333',
      '/images': 'http://localhost:3333',
    },
  },
});
