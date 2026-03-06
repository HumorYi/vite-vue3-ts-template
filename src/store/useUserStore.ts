import { acceptHMRUpdate, defineStore } from 'pinia'
import {
  type RouteRecordRaw,
  type RouteLocationAsRelativeGeneric
} from 'vue-router'

import {
  ROUTER_PERMISSION_TYPE,
  RouteName,
  RouterPermission
} from '@/config/router'
import router from '@/router'
import permission from '@/router/routes/permission'
import { type User } from '@/types/api'

import { apiGetUser, apiLogin, apiLogout, apiSetUser } from '@/api/user'

import {
  hasRoutePermission as hasRoutePermissionUtil,
  resetRoutePermission,
  setRoutePermissionByAuth,
  setRoutePermissionByDynamic,
  setRoutePermissionByRole
} from '@/utils/route'

import { getToken, setToken, removeToken } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  const isLogin = computed(() => !!user.value)

  async function login() {
    const { name, query } = router.currentRoute.value

    if (name === RouteName.home) return

    try {
      const res = await apiLogin({ name: 'xxx' })

      if (!res?.success) return

      setToken(res.data.token)

      await getUser()

      // router.replace(
      //   (query.redirect as RouteLocationAsRelativeGeneric) || {
      //     name: RouteName.home
      //   }
      // )
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    try {
      const res = await apiLogout()

      if (!res?.success) return

      reset()
    } catch (error) {
      throw error
    }
  }

  async function getUser() {
    if (isLogin.value || !getToken()) return

    try {
      const res = await apiGetUser()

      if (!res?.success) return

      user.value = res.data

      switch (ROUTER_PERMISSION_TYPE) {
        case RouterPermission.DYNAMIC.valueOf():
          setRoutePermissionByDynamic(
            permission,
            user.value?.routes as unknown as RouteRecordRaw[]
          )
          break

        case RouterPermission.ROLE.valueOf():
          setRoutePermissionByRole(permission, user.value?.role as string)
          break

        case RouterPermission.AUTH.valueOf():
          setRoutePermissionByAuth(permission)
          break

        default:
          break
      }
    } catch (error) {
      throw error
    }
  }

  // 更新用户信息，apiParam 是接口参数，userParam 是用户信息参数，默认为 apiParam
  async function setUser(
    apiParam: Record<string, any>,
    userParam?: Partial<User>
  ) {
    const res = await apiSetUser(apiParam)

    if (!res?.success) return

    user.value = { ...user.value, ...(userParam || apiParam) } as User
  }

  function hasRoutePermission(name: string) {
    return isLogin.value && hasRoutePermissionUtil(permission, name)
  }

  function toLogin() {
    const { name, fullPath } = router.currentRoute.value

    if (name === RouteName.login) return

    reset()

    router.push({ name: RouteName.login, query: { redirect: fullPath } })
  }

  function reset() {
    user.value = null

    removeToken()

    resetRoutePermission(permission)
  }

  return {
    user,
    isLogin,
    login,
    logout,
    getUser,
    setUser,
    hasRoutePermission,
    toLogin
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
