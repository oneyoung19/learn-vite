// import './js/index'
// 在你应用的入口起始处添加此 polyfill
// import 'vite/modulepreload-polyfill'

import { createApp } from 'vue'

import App from '@/pages/App.vue'
import router from '@/router'
import store from '@/store'

createApp(App).use(router).use(store).mount('#app')
