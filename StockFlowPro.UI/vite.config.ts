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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
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
      '/stockflowhub': {
        target: backendConfig.wsTarget,
        secure: false,
        ws: true,
        changeOrigin: true
        // No rewrite: backend maps the hub at "/stockflowhub"
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
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