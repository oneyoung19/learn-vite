import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import imagemin from 'unplugin-imagemin/vite'

export default defineConfig({
  plugins: [vue(), imagemin()]
})
