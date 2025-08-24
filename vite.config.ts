import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import cesiumPlugin from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [
    react(),
    cesiumPlugin({ rebuildCesium: false }), // TypeScript now recognizes this
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
});
