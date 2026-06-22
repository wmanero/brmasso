import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'espacobarbararodrigues.com.br',
      'www.espacobarbararodrigues.com.br'
    ]
  }
})
