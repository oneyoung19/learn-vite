import path from 'node:path'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import imagemin from 'unplugin-imagemin/vite'

export default defineConfig({
  plugins: [vue(), imagemin({
    // sharp or squoosh
    mode: 'sharp'
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // outDir: 'dist-manifest',
    // manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.js')
    }
  }
})
