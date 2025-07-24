import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory
    outDir: 'dist',
    // Generate source maps for production (can be disabled for security)
    sourcemap: false,
    // Minify the output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true // Remove debugger statements
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Manual chunking for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'ui-vendor': ['@material-tailwind/react', '@heroicons/react', 'framer-motion'],
          'editor': ['@ckeditor/ckeditor5-build-classic', '@ckeditor/ckeditor5-react'],
          'utils': ['axios', 'socket.io-client', 'uuid']
        }
      }
    }
  },
  // Define environment variables
  define: {
    // Ensure process.env is not exposed in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  // Server configuration for development
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  // Preview configuration
  preview: {
    port: 4173
  }
})