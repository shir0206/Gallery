import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Gallery/',
  plugins: [react()],
  build: {
    // The gallery wall is essential to the first screen. Embedding its 93 KB
    // WebP avoids a second, base-path-sensitive request after deployment.
    // Larger room/artwork assets remain separate files.
    assetsInlineLimit: 94 * 1024,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
