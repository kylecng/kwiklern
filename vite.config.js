import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import manifest from './src/manifest.js'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { onWriteBundle } from './postbuild.js'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      port: 5174,
      // strictPort: true,
      hmr: {
        port: 5174,
      },
    },

    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        input: { main: 'main.html' },
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
    plugins: [crx({ manifest }), react(), nodePolyfills(), onWriteBundle()],
  }
})
