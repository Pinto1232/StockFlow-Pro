import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5131',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: (id) => {
        // Externalize Node.js built-in modules to reduce warnings
        return ['fs', 'path', 'os', 'crypto', 'stream', 'util', 'url', 'module', 'perf_hooks', 'vm', 'assert', 'process', 'v8', 'events', 'tty'].includes(id);
      },
      output: {
        // Manual chunking to optimize bundle size
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries chunk
          'ui-vendor': ['@heroicons/react', 'lucide-react'],
          // Data fetching and state management
          'data-vendor': ['@tanstack/react-query', 'axios'],
          // SignalR in its own chunk to isolate potential issues
          'signalr': ['@microsoft/signalr']
          // Removed style-vendor as it was generating empty chunks
        }
      }
    }
  }
})
