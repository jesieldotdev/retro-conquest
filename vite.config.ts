import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/API': {
        target: 'https://retroachievements.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
