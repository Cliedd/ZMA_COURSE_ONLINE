import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/v1': { target: 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: 'http://localhost:8081', changeOrigin: true },
      '/login/oauth2': { target: 'http://localhost:8081', changeOrigin: true },
      // Direct to zma-community, not the gateway — matches nginx.conf in prod
      '/ws': { target: 'http://localhost:8087', ws: true, changeOrigin: true },
    },
  },
})
