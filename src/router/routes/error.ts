import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '403页面'
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404页面'
    }
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '500页面'
    }
  },
  // 解决刷新页面，路由警告
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue')
  }
]

export default routes
