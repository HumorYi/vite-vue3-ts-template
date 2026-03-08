import { RouteName } from '@/config/router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.home,
    component: () => import('@/pages/home/Index.vue'),
    meta: {
      title: '首页',
      // 是否需要身份验证，即用户信息
      auth: false
    }
  },
  {
    path: '/login',
    name: RouteName.login,
    component: () => import('@/pages/login/Index.vue'),
    meta: {
      title: '登录页'
    }
  }
]

export default routes
