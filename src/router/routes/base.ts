import { RouteName } from '@/config/route'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: RouteName.login,
    component: () => import('@/pages/login/Index.vue'),
    meta: { title: '登录页' }
  }
]

export default routes
