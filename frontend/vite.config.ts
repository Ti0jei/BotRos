import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  plugins: [react()],
  base: '/', // ✅ для продакшена
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
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
})
