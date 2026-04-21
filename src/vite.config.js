import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],  // Vite akan otomatis mencari file dengan extensions ini
  },
  server: {
    hmr: {
      overlay: false  // Optional: disable error overlay
    }
  }
})