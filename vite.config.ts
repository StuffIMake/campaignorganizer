import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import istanbul from 'vite-plugin-istanbul';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Only add istanbul when VITE_COVERAGE=true, but with forced instrumentation
    process.env.VITE_COVERAGE === 'true' && istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'test/', 'e2e/'],
      extension: ['.js', '.ts', '.tsx'],
      forceBuildInstrument: true, // This setting was key to making it work
    }),
  ].filter(Boolean),
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