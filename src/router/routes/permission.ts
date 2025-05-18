/**
 * 权限路由
 * 把所有权限路由添加到路由表中，通过权限字段来控制访问
 * 以免登入登出，添加移除路由
 * 把属于前端相关字段留在路由表中，后端只存储对应标识字段，例如：路由名称 或 路径
 */

import { RouteName } from '@/config/router'
import { UserRole } from '@/config/user'
import { resetRoutePermission } from '@/utils/route'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: () => import('@/views/settings/Index.vue'),
    meta: { menuName: '设置' },
    children: [
      {
        path: '',
        name: RouteName.settings.root,
        component: () => import('@/views/settings/Home.vue')
      },
      {
        path: 'base',
        name: RouteName.settings.base,
        component: () => import('@/views/settings/Base.vue'),
        meta: { menuName: '基础设置' }
      },
      {
        path: 'advance',
        component: () => import('@/views/settings/Advance/Index.vue'),
        meta: { menuName: '高级设置', roles: [UserRole.ADMIN] },
        children: [
          {
            path: '',
            name: RouteName.settings.advance.root,
            component: () => import('@/views/settings/Advance/Home.vue')
          },
          {
            path: 'base',
            name: RouteName.settings.advance.base,
            component: () => import('@/views/settings/Advance/Base.vue'),
            meta: { menuName: '高级设置 - 基础' }
          },
          {
            path: 'other',
            name: RouteName.settings.advance.other,
            component: () => import('@/views/settings/Advance/Other.vue'),
            meta: { menuName: '高级设置 - 其它' }
          }
        ]
      }
    ]
  },
  {
    path: '/user',
    component: () => import('@/views/user/Index.vue'),
    meta: { menuName: '用户' },
    children: [
      {
        path: '',
        name: RouteName.user.root,
        component: () => import('@/views/user/Home.vue')
      },
      {
        path: 'base',
        name: RouteName.user.base,
        component: () => import('@/views/user/Base.vue'),
        meta: { menuName: '基础用户' }
      },
      {
        path: 'advance',
        name: RouteName.user.advance,
        component: () => import('@/views/user/Advance.vue'),
        meta: { menuName: '高级用户', roles: [UserRole.ADMIN] }
      }
    ]
  }
]

resetRoutePermission(routes)

export default routes
