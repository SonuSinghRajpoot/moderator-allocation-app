import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false,
    host: true
  },
  optimizeDeps: {
    exclude: [
      '@tauri-apps/api/fs',
      '@tauri-apps/api/dialog',
      '@tauri-apps/api/path'
    ]
  },
  define: {
    __TAURI__: 'false'
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      external: [
        '@tauri-apps/api/fs',
        '@tauri-apps/api/dialog',
        '@tauri-apps/api/path'
      ]
    }
  }
}) 