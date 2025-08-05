import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  
  const config = {
    plugins: [react()],
    optimizeDeps: {
      include: ['@ckeditor/ckeditor5-build-classic', '@ckeditor/ckeditor5-react'],
      exclude: []
    },
    define: {
      global: 'globalThis',
      // Ensure process.env is not exposed in production
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
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
            'ckeditor': ['@ckeditor/ckeditor5-build-classic', '@ckeditor/ckeditor5-react'],
            'utils': ['axios', 'socket.io-client', 'uuid']
          }
        }
      }
    },
    // Preview configuration
    preview: {
      port: 4173
    }
  };

  // Add server configuration only for development
  if (!isProduction) {
    config.server = {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      hmr: {
        port: 3001,
        host: 'localhost'
      },
      proxy: {
        '/api': {
          target: 'http://server:5000',
          changeOrigin: true,
          secure: false
        },
        '/socket.io': {
          target: 'http://server:5000',
          changeOrigin: true,
          secure: false,
          ws: true
        }
      },
      watch: {
        usePolling: true,
        ignored: ['**/node_modules/**', '**/.git/**']
      }
    };
  }

  return config;
});