import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: () => import('@/pages/Home.vue')
    },
    {
      name: 'HMR',
      path: '/hmr',
      component: () => import('@/pages/HMR.vue')
    },
    {
      name: 'Store',
      path: '/store',
      component: () => import('@/pages/Store.vue')
    },
    {
      name: 'Upload',
      path: '/upload',
      meta: {
        hiddenMenu: true,
      },
      component: () => import('@/pages/Upload.vue')
    }
  ]
})

export default router
