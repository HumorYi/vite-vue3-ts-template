import { acceptHMRUpdate, defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { ROUTER_PERMISSION_TYPE, RouterPermission } from '@/config/router'
import permission from '@/router/routes/permission'
import type { User } from '@/types/api'

import { apiGetUser, apiLogin, apiLogout, apiSetUser } from '@/api/user'

import {
  hasRoutePermission as hasRoutePermissionUtil,
  resetRoutePermission,
  setRoutePermissionByAuth,
  setRoutePermissionByDynamic,
  setRoutePermissionByRole
} from '@/utils/route'

export const useUserStore = defineStore(
  'user',
  () => {
    const auth = useAuth()
    const user = ref<User | null>(null)
    // 有 token 不能认为已经登录，可能 token 失效，所以要先验证 token
    const isLogin = computed(() => Boolean(user.value))

    async function login() {
      try {
        const data = await apiLogin({ name: 'xxx' })

        auth.setToken(data.token)

        await getUser()

        auth.login()
      } catch (error) {
        throw error
      }
    }

    async function logout() {
      try {
        await apiLogout()

        resetRoutePermission(permission)

        auth.logout()
      } catch (error) {
        throw error
      }
    }

    async function getUser() {
      if (!auth.hasToken()) return

      try {
        const data = await apiGetUser({ name: 'haha' })

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
      await apiSetUser({ name: 'ha' })
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
  // ,
  // {
  //   persist: {
  //     enabled: true,
  //     // 注意：目前测试，只有响应式的值 并且 return 出去 才会存储
  //     strategies: [{ storage: localStorage, paths: ['user'] }]
  //   }
  // }
)

import.meta.hot?.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
