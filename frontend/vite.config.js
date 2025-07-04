import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // FSD Architecture layers
      '@/app': path.resolve(__dirname, './src/app'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/widgets': path.resolve(__dirname, './src/widgets'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/entities': path.resolve(__dirname, './src/entities'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      // Legacy aliases for compatibility
      '@/assets': path.resolve(__dirname, './src/shared/assets'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    allowedHosts: ['localhost', '127.0.0.1', 'requify_frontend', 'requify-frontend-dev'],
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/docs': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/redoc': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/openapi.json': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          forms: ['react-hook-form', '@hookform/resolvers', 'yup'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
})
