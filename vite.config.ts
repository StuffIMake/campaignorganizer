import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: '/campaignorganizer/', // GitHub Pages repository name
  server: {
    port: 3000,
  },
  envPrefix: 'REACT_APP_',
  resolve: {
    alias: {
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['mapbox-gl', 'react-map-gl'],
          'utilities': ['zustand', 'uuid', 'howler']
        },
        // Ensure chunks have a consistent naming pattern
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000, // Increase the warning limit (in KB)
    sourcemap: true // Enable source maps for debugging
  }
}); 