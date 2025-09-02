declare module 'vite-plugin-cesium' {
  import type { Plugin } from 'vite';

  export interface VitePluginCesiumOptions {
    rebuildCesium?: boolean;
    cesiumBaseUrl?: string;
  }

  const cesiumPlugin: (options?: VitePluginCesiumOptions) => Plugin;
  export default cesiumPlugin;
}
