import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use relative base path for better compatibility
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    target: 'es2015',
    // PRODUCTION: Enhanced build configuration
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          emailjs: ['@emailjs/browser']
        }
      }
    },
    // PRODUCTION: Ensure all dependencies are bundled
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false
  },
  // PRODUCTION: Resolve configuration for better compatibility
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})