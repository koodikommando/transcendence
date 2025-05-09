import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      // Match exactly with the tsconfig.json path aliases
      '@': path.resolve(__dirname, './src'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@components': path.resolve(__dirname, './src/components'),
      '@game': path.resolve(__dirname, './src/components/game'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@shared': path.resolve(__dirname, '../shared'),
      '@utils': path.resolve(__dirname, '../shared/utils'),
      '@types': path.resolve(__dirname, '../shared/types'),
      '@messages': path.resolve(__dirname, '../shared/messages'),
    },
  },
  // Improve build speed, performance and output
  build: {
    sourcemap: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['tailwindcss'],
        },
      },
    },
  },
});
