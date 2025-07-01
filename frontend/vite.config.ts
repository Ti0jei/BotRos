import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'), // ✅ указывает на корень, где лежат App.tsx и components/
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
});
