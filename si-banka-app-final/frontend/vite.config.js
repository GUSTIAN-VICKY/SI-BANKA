import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

/**
 * Vite Configuration — Si-Banka Frontend
 * 
 * - React plugin untuk JSX/Fast Refresh
 * - SSL plugin untuk HTTPS di dev (diperlukan untuk Camera API)
 * - Manual chunks untuk optimal code splitting
 * - Proxy ke Laravel backend
 */
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],

  // ── Build Optimization ──────────────────────────
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-swal': ['sweetalert2'],
          'vendor-axios': ['axios'],
        },
      },
    },
  },

  // ── Dev Server ──────────────────────────────────
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
