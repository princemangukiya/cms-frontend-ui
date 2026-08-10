import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // React ka Port
    open: true, // npm run dev karte hi browser apne aap khulega
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Aapka Spring Boot Application Server
        changeOrigin: true,
        secure: false,
      },
    },
  },
})