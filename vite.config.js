import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Fixes black screen on Android file:// protocol
  server: {
    allowedHosts: true
  },
  plugins: [
    react()
  ],
})
