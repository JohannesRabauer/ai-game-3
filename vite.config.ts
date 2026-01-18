import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ai-game-3/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the havok package
      allow: ['..']
    }
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.env', '**/*.wasm'],
  optimizeDeps: {
    exclude: ['@babylonjs/havok']
  }
});
