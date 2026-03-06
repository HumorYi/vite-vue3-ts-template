import { RouteName } from '@/config/router'
import { useUserStore } from '@/store/useUserStore'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: false,
  scrollBehavior: (_to, _from, savedPosition) => savedPosition || { top: 0 }
})

// 全局前置守卫
router.beforeEach(async (to, _from) => {
  // 由于 to 更新 meta 后没有实时更新，借助 matched 来匹配 最终 to
  const { meta } = to.matched.find(record => to.name === record.name) || to

  const userStore = useUserStore()

  // meta { permission?: Boolean, auth?: Boolean }
  // permission: undefined，表示 不是权限路由
  // permission: false，表示 无权限
  // permission: true，表示 有权限
  // auth: true，表示 需要认证，即登录用户信息
  // 需要访问权限 或者 用户信息
  if (!userStore.isLogin && (meta.permission === false || meta.auth)) {
    await userStore.getUser()

    // 未登录，跳转登录页
    if (!userStore.isLogin && to.name !== RouteName.login) {
      return { name: RouteName.login, query: { redirect: to.fullPath } }
    }
  }

  // 没权限，跳回首页或指定页
  if (meta.permission === false) {
    // 可根据项目需求，添加提示
    console.log('无权限访问 xx 页面')
    return { name: RouteName.home }
  }

  // 有权限，直接访问
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

export default router
