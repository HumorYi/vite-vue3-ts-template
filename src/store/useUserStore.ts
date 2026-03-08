import { acceptHMRUpdate, defineStore } from 'pinia'
import {
  useRoute,
  useRouter,
  type RouteLocationAsRelativeGeneric,
  type RouteRecordRaw
} from 'vue-router'

import {
  ROUTER_PERMISSION_TYPE,
  RouteName,
  RouterPermission
} from '@/config/router'

import { type User } from '@/types/api/user'

import { apiGetUser, apiLogin, apiLogout, apiSetUser } from '@/api/user'

import {
  resetRoutePermission,
  setRoutePermissionByAuth,
  setRoutePermissionByDynamic,
  setRoutePermissionByRole
} from '@/utils/route'

import type { ApiOption } from '@/types/http'
import { getToken, removeToken, setToken } from '@/utils/token'
import { useTimeout } from '@vueuse/core'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const route = useRoute()
  const user = ref<User | null>(null)

  const isLogin = computed(() => !!user.value)

  async function login() {
    const { name, query } = route

    if (name === RouteName.home) return

    try {
      const res = await apiLogin({ name: 'xxx' })

      if (!res?.success) return

      setToken(res.data.token)

      await getUser()

      router.replace(
        (query.redirect as RouteLocationAsRelativeGeneric) || {
          name: RouteName.home
        }
      )
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
            user.value?.routes as unknown as RouteRecordRaw[]
          )
          break

        case RouterPermission.ROLE.valueOf():
          setRoutePermissionByRole(user.value?.role as string)
          break

        case RouterPermission.AUTH.valueOf():
          setRoutePermissionByAuth()
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
    userParam?: Partial<User>,
    apiOption?: ApiOption
  ) {
    const res = await apiSetUser(apiParam, apiOption)

    if (!res?.success) return

    useTimeout(2000, {
      callback: () => {
        // 组件卸载后禁止异步内容处理
        if (apiOption?.componentInstance?.isUnmounted) return

        console.log('back')
      }
    })

    user.value = { ...user.value, ...(userParam || apiParam) } as User
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

    resetRoutePermission()
  }

  return {
    user,
    isLogin,
    login,
    logout,
    getUser,
    setUser,
    toLogin
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
