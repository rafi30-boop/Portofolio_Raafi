import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  server: {
    hmr: {
      overlay: false
    }
  },
  build: {
    // Optimasi build
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons-vendor': ['react-icons'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})