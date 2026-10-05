import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// The hosted build: the site served from a web server's root.
const hostedBuild = {
  rollupOptions: {
    output: {
      // React and the router are ~80% of the script and change far less
      // often than the site's own code; a separate chunk means a content
      // deploy does not make returning visitors re-download them.
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router'],
      },
    },
  },
}

// `npm run build:static`: the shareable package, opened straight from disk.
// Browsers refuse module scripts on file://, so the whole site is one classic
// script; paths are relative; and scripts/package-static.mjs then writes the
// per-page HTML files, copies the images in and zips the folder.
const staticBuild = {
  outDir: 'share/you-matter-media',
  emptyOutDir: true,
  modulePreload: false,
  cssCodeSplit: false,
  rollupOptions: {
    output: {
      format: 'iife',
      inlineDynamicImports: true,
      entryFileNames: 'js/script.js',
      assetFileNames: (info) =>
        info.name?.endsWith('.css') ? 'css/style.css' : 'images/[name][extname]',
    },
  },
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5174,
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  ...(mode === 'static'
    ? { base: './', publicDir: false, build: staticBuild }
    : { build: hostedBuild }),
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
}))
