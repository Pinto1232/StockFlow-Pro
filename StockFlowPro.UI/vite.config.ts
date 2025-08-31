/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Smart backend detection with proper port configuration
const getBackendConfig = () => {
  // Priority order: Environment variables > Local .NET HTTP > Docker fallback
  const envApiUrl = process.env.VITE_API_BASE_URL
  const envWsUrl = process.env.VITE_WS_URL
  
  console.log('🔧 Environment check:')
  console.log(`   VITE_API_BASE_URL: ${envApiUrl}`)
  console.log(`   VITE_WS_URL: ${envWsUrl}`)
  
  if (envApiUrl) {
    console.log('🔧 Using environment variables for backend configuration')
    console.log(`   API: ${envApiUrl}`)
    console.log(`   WebSocket: ${envWsUrl || 'default'}`)
    
    // For Docker environment with /api path
    if (envApiUrl === '/api') {
      console.log('🐳 Docker environment detected - using internal API routing')
      return {
        // Use the actual backend service name in docker-compose
        apiTarget: 'http://stockflow-api:8080',
        wsTarget: 'http://stockflow-api:8080',
        source: 'docker'
      }
    } else {
      return {
        apiTarget: envApiUrl.replace('/api', ''),
        wsTarget: envWsUrl?.replace(/^wss?:\/\//, 'http://') || 'http://localhost:8080',
        source: 'environment'
      }
    }
  }
  
  // Default to local .NET development HTTP (port 5131)
  console.log('🔧 Using local .NET development configuration (http://localhost:5131)')
  console.log('💡 Backend should be running on: http://localhost:5131')
  console.log('💡 Start backend with: cd StockFlowPro.Web && dotnet run')
  
  return {
    apiTarget: 'http://localhost:5131',
    wsTarget: 'http://localhost:5131',
    source: 'local-dotnet'
  }
}

const backendConfig = getBackendConfig()

console.log('🚀 Frontend Configuration:')
console.log(`   Frontend Dev Server: http://localhost:5173`)
console.log(`   Frontend Preview: http://localhost:4173 (after npm run build && npm run preview)`)
console.log(`   Docker Full Stack: http://localhost:8080 (docker-compose up -d)`)
console.log(`   Backend Target: ${backendConfig.apiTarget}`)
console.log(`   WebSocket Target: ${backendConfig.wsTarget}`)
console.log(`   Configuration Source: ${backendConfig.source}`)
console.log('')
console.log('🌐 Environment URLs:')
console.log(`   🏠 Local Development: http://localhost:5173`)
console.log(`   🔍 Local Preview: http://localhost:4173`)
console.log(`   🐳 Docker Local: http://localhost:8080`)
console.log(`   🚀 Staging: https://staging.stockflow.pro (when deployed)`)
console.log(`   🌍 Production: https://app.stockflow.pro (when deployed)`)
console.log('')
console.log('🔌 Backend URLs:')
console.log(`   🏠 Local Dev Backend: http://localhost:5131`)
console.log(`   🐳 Docker Backend: http://localhost:5000`)
console.log(`   🚀 Staging Backend: https://api-staging.stockflow.pro (when deployed)`)
console.log(`   🌍 Production Backend: https://api.stockflow.pro (when deployed)`)
console.log('')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: []
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0', // Critical for Docker - expose to all interfaces
    allowedHosts: ['localhost', 'stockflow-frontend', '127.0.0.1', '0.0.0.0'], // Allow Docker container names
    watch: {
      usePolling: true, // For file watching in Docker
      interval: 1000
    },
    hmr: {
      port: 5173,
      host: 'localhost',
      clientPort: 8080,
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: backendConfig.apiTarget,
        secure: false,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log(`❌ Proxy error connecting to ${backendConfig.apiTarget}:`, err.message);
            console.log('💡 Make sure your backend is running:');
            if (backendConfig.source === 'local-dotnet') {
              console.log('   cd StockFlowPro.Web && dotnet run');
              console.log('   Backend should be available at: http://localhost:5131');
            } else {
              console.log('   docker-compose up -d');
              console.log('   Backend should be available at: http://localhost:5000');
            }
          });
          proxy.on('proxyReq', (_, req) => {
            console.log(`📤 API Request: ${req.method} ${req.url} → ${backendConfig.apiTarget}`);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            const status = proxyRes.statusCode ?? 0;
            const statusIcon = status < 400 ? '✅' : '❌';
            console.log(`📥 API Response: ${statusIcon} ${status} ${req.url}`);
          });
        },
      },
      // Proxy backend health endpoint for connectivity checks
      '/health': {
        target: backendConfig.apiTarget,
        secure: false,
        changeOrigin: true,
      },
      '/stockflowhub': {
        target: backendConfig.wsTarget,
        secure: false,
        ws: true,
        changeOrigin: true
        // No rewrite: backend maps the hub at "/stockflowhub"
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      external: [
        /src\/architecture\/__tests__/,
        /src\/architecture\/adapters\/primary\/LegacyBridge/,
      ]
    }
  },
  assetsInclude: ['**/*.html'],
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