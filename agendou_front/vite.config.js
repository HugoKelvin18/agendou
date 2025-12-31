import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    
    // Otimizacao de chunking
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar bibliotecas de UI
          'ui-vendor': ['lucide-react', 'recharts'],
          // Separar axios (chamadas HTTP)
          'http-vendor': ['axios']
        }
      }
    },
    
    // Aumentar limite de aviso de tamanho de chunk (para evitar warnings)
    chunkSizeWarningLimit: 1000,
    
    // Otimizacoes adicionais
    minify: 'esbuild',
    target: 'es2015',
    
    // CSS code splitting
    cssCodeSplit: true
  },
  
  // Configuracao do servidor de desenvolvimento
  server: {
    port: 5173,
    host: true, // Permite acesso de outros dispositivos na rede
    open: false
  },
  
  // Preview server (para testar build local)
  preview: {
    port: 4173,
    host: true
  }
})
