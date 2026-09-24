import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// In development, /api is proxied to the Express server so no URLs are hardcoded.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_DEV_API_PROXY || 'http://localhost:5000', changeOrigin: true },
    },
  },
})
