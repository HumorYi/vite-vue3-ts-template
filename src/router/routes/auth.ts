import { RouteName } from '@/config/route'
import { setRouteAuth } from '@/utils/route'
import type { RouteRecordRaw } from 'vue-router'

import permission from './permission'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.home,
    component: () => import('@/pages/home/Index.vue'),
    meta: { title: '首页' }
  },
  ...permission
]

setRouteAuth(routes)

export default routes
