import type {
  RouteLocationNormalizedGeneric,
  RouteLocationRaw,
  RouteRecordNormalized
} from 'vue-router'

import type { UserRes, UserRoute } from '@/types/api/user'
import type { FEATURE_TYPE } from '@/types/permission'
import { getUser as getUserApi } from '@/api/user'
import PERMISSION_FEATURE from '@/config/permission-feature'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRes | null>(null)
  // 权限校验用：把接口返回的 `routes` 预先扁平化为 fullPath Set
  // 避免每次导航都递归拼接路径，提升 permission middleware 性能。
  const userRoutesFullPathSet = ref<Set<string>>(new Set())

  function clear() {
    user.value = null
    userRoutesFullPathSet.value = new Set()
  }

  async function getUser() {
    const res = await getUserApi()

    if (res?.success) {
      user.value = res.data

      if (res.data?.routes) {
        userRoutesFullPathSet.value = new Set(
          getRoutesFullPath(res.data.routes)
        )
      } else {
        userRoutesFullPathSet.value = new Set()
      }
    }
  }

  const isLogin = computed(() => !!user.value)

  // 路由权限验证，客户端可能通过 路由地址 或 路由名称来判断权限，通过路由表找到对应路由记录，取记录中的分组信息做判断
  function hasPermissionPage(to: RouteLocationRaw) {
    const router = useRouter()
    const routes = router.getRoutes()
    let targetRoute: RouteRecordNormalized | undefined

    if (typeof to === 'string') {
      targetRoute = routes.find(route => route.path === to)
    } else {
      const path = to.path
      const name = (to as RouteLocationNormalizedGeneric).name

      targetRoute = routes.find(
        route =>
          (path && route.path && route.path === path) ||
          (name && route.name && route.name === name)
      )
    }

    if (!targetRoute) {
      return false
    }

    return hasPermissionPageByMiddleware(
      router.resolve(targetRoute.path) as RouteLocationNormalizedGeneric
    )
  }

  function hasPermissionPageByMiddleware(to: RouteLocationNormalizedGeneric) {
    if (!user.value) {
      return false
    }

    if (user.value.role) {
      const { groups = [] } = to.meta

      if (groups.length) {
        return groups.includes(user.value.role)
      }
    } else if (user.value.routes?.length) {
      return userRoutesFullPathSet.value.has(to.fullPath)
    }

    return true
  }

  function hasPermissionFeature(name: string, type: FEATURE_TYPE) {
    if (!user.value) {
      return false
    }

    if (user.value.role) {
      const result = PERMISSION_FEATURE[name]?.[type]

      if (result?.length) {
        return result.includes(user.value.role)
      }
    }

    if (user.value.feature) {
      const result = user.value.feature[name]?.[type]

      if (typeof result === 'boolean') {
        return result
      }
    }

    return true
  }

  function getRoutesFullPath(routes: UserRoute[], parentPath = '') {
    const arr: string[] = []

    routes.forEach(route => {
      let routePath = parentPath

      if (route.path) {
        routePath += (route.path.startsWith('/') ? '' : '/') + route.path

        arr.push(routePath)
      }

      if (route.children?.length)
        arr.push(...getRoutesFullPath(route.children, routePath))
    })

    return arr
  }

  return {
    user,
    clear,
    getUser,
    isLogin,
    hasPermissionPage,
    hasPermissionPageByMiddleware,
    hasPermissionFeature
  }
})
