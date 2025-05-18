import { acceptHMRUpdate, defineStore } from 'pinia'

import {
  getUser as getUserApi,
  login as loginApi,
  logout as logoutApi,
  setUser as setUserApi
} from '@/api/user'
import { useAuth } from '@/composables/useAuth'
import { ROUTER_PERMISSION_TYPE, RouterPermission } from '@/config/router'
import permission from '@/router/routes/permission'
import type { User } from '@/types/api'
import {
  hasRoutePermission as hasRoutePermissionUtil,
  resetRoutePermission,
  setRoutePermissionByAuth,
  setRoutePermissionByDynamic,
  setRoutePermissionByRole
} from '@/utils/route'
import type { RouteRecordRaw } from 'vue-router'

export const useUserStore = defineStore(
  'user',
  () => {
    const auth = useAuth()
    const user = ref<User | null>(null)
    // 有 token 不能认为已经登录，可能 token 失效，所以要先验证 token
    const isLogin = computed(() => Boolean(user.value))

    async function login() {
      try {
        const data = await loginApi({ name: 'xxx' })

        auth.setToken(data.token)

        await getUser()

        auth.login()
      } catch (error) {
        throw error
      }
    }

    async function logout() {
      try {
        await logoutApi()

        resetRoutePermission(permission)

        auth.logout()
      } catch (error) {
        throw error
      }
    }

    async function getUser() {
      if (!auth.hasToken()) return

      try {
        const data = await getUserApi({ name: 'haha' })

        user.value = data

        setRoutePermission()
      } catch (error) {
        throw error
      }
    }

    function setRoutePermission() {
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
    }

    async function setUser() {
      await setUserApi({ name: 'ha' })
    }

    function hasRoutePermission(name: string) {
      return isLogin.value && hasRoutePermissionUtil(permission, name)
    }

    return {
      toLogin: auth.toLogin,
      isLogin,
      login,
      logout,
      user,
      getUser,
      setUser,
      hasRoutePermission
    }
  }
  // {
  //   persist: {
  //     enabled: true,
  //     strategies: [{ storage: localStorage, paths: [] }]
  //   }
  // }
)

import.meta.hot?.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
