import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:meta-layouts'
import { cancelAllReq } from '@/http/factory/req-cancel'

// 路由组会出现根路由，需要手动调整路由顺序，以免跟路由被覆盖
const rootIndex = routes.findIndex(route => route.name === '/')
const rootRoute = routes[rootIndex]

if (rootRoute) {
  routes.unshift(rootRoute)
  routes.splice(rootIndex + 1, 1)
}

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
  scrollBehavior: (_to, _from, savedPosition) => savedPosition || { top: 0 }
})

// 全局前置守卫
router.beforeEach(async (to, _from) => {
  // 路由切换取消之前的所有请求
  cancelAllReq()

  // 由于 to 更新 meta 后没有实时更新，借助 matched 来匹配 最终 to
  const { meta } = to.matched.find(record => to.name === record.name) || to

  const userStore = useUserStore()
  const authStore = useAuthStore()

  // 如果没有登录，且有token，获取用户信息
  if (!userStore.isLogin && authStore.getToken()) {
    await userStore.getUser()
  }

  // 认证路由组，未登录，跳转登录页
  if (meta.groups?.includes('auth') && !userStore.isLogin) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 权限路由组，没权限，跳转403页
  if (
    meta.groups?.includes('permission') &&
    !userStore.hasPermissionPageByMiddleware(to)
  ) {
    return { path: '/forbidden' }
  }

  // 有权限，直接访问
  const title = (meta.title as string) ?? import.meta.env.VITE_APP_TITLE

  useTitle(title)
})

// 全局解析守卫
router.beforeResolve(async (_to, _from) => {})

// 全局后置钩子
router.afterEach(async (_to, _from, failure) => {
  if (failure) {
    console.log(`router failure: ${failure}`)

    return false
  }

  return true
})

// 这将在运行时更新路由而无需重新加载页面
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
