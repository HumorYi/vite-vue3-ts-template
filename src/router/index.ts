import { RouteName } from '@/config/router'
import { useUserStore } from '@/store/useUserStore'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

/**
 * @description 动态路由参数配置简介 📚
 * @param path ==> 菜单路径
 * @param name ==> 菜单别名
 * @param redirect ==> 重定向地址
 * @param component ==> 视图文件路径
 * @param meta ==> 菜单信息
 * @param meta.icon ==> 菜单图标
 * @param meta.moduleId ==> 模块Id,判断是否有权限进入
 * @param meta.img ==> 模块背景图
 * @param meta.code ==> 模块编号
 * @param meta.title ==> 菜单标题
 * @param meta.activeMenu ==> 当前路由为详情页时，需要高亮的菜单
 * @param meta.isLink ==> 是否外链
 * @param meta.isHide ==> 是否隐藏
 * @param meta.isFull ==> 是否全屏(示例：数据大屏页面)
 * @param meta.isAffix ==> 是否固定在 tabs nav
 * @param meta.isKeepAlive ==> 是否缓存
 * */
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: false,
  scrollBehavior: (_to, _from, savedPosition) => savedPosition || { top: 0 }
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
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
      return next({ name: RouteName.login, query: { redirect: to.fullPath } })
    }
  }

  // 没权限，跳回首页或指定页
  if (meta.permission === false) {
    // 可根据项目需求，添加提示
    console.log('无权限访问 xx 页面')
    return next({ name: RouteName.home })
  }

  // 有权限，直接访问
  next()
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
