import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import legacyPlugin from '@vitejs/plugin-legacy'
// import imagemin from 'unplugin-imagemin/vite'

export default defineConfig(({ mode }) => {
  // env文件中的环境变量默认只会注入到客户端代码中 如果node环境下要使用 需要手动加载 https://vitejs.dev/guide/api-javascript.html#loadenv
  const env = loadEnv(mode, process.cwd(), '')
  // console.log(mode, env)
  return {
    base: env.NODE_ENV === 'production' ? '/learn-vite/' : '',
    plugins: [vue(), legacyPlugin()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      // outDir: 'dist-manifest',
      // manifest: true,
      // rollupOptions: {
      //   input: resolve(__dirname, 'src/main.js')
      // }
    },
    server: {
      host: '0.0.0.0'
    }
  }
})
