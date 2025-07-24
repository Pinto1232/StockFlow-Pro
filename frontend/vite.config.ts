/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/stockflowhub': {
        target: 'https://localhost:7046',
        secure: false,
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stockflowhub/, '/hubs/stockflowhub')
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
        // Temporarily exclude problematic architecture files from build
        /src\/architecture\/__tests__/,
        /src\/architecture\/adapters\/primary\/LegacyBridge/,
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  }
})