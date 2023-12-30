import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import manifest from './src/manifest.js'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { onWriteBundle } from './postbuild.js'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },

    alias: {
      react: path.resolve('./node_modules/react'),
    },

    plugins: [crx({ manifest }), react(), nodePolyfills(), onWriteBundle()],
  }
})
