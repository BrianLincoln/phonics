import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  base: '/phonics/',
  plugins: [react()],
  server: {
    historyApiFallback: {
      index: '/phonics/index.html',
    },
  },
});
