// import './js/index'

import { createApp } from 'vue'

import App from '@/pages/App.vue'
import router from '@/router'
import store from '@/store'

createApp(App).use(router).use(store).mount('#app')
