import { acceptHMRUpdate, defineStore } from 'pinia'
import {
  useRoute,
  useRouter,
  type RouteLocationAsRelativeGeneric
} from 'vue-router'

import { RouteName } from '@/config/route'

import { type User } from '@/types/api/user'

import { apiGetUser, apiLogin, apiLogout, apiSetUser } from '@/api/user'

import { resetRoutePermission, setRoutePermission } from '@/utils/route'

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

      clear()
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

      setRoutePermission(res.data.role)
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

    clear()

    router.push({ name: RouteName.login, query: { redirect: fullPath } })
  }

  function clear() {
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
