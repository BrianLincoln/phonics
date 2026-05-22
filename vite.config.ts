import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    fs: {
      // Prevent Vite from serving the standalone phonics sub-project
      deny: ['phonics/**'],
    },
  },
  optimizeDeps: {
    // Exclude the standalone sub-project from dep scanning
    exclude: [],
    entries: ['index.html'],
  },
});
