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

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null as User | null,
    isLogin: false
  }),
  actions: {
    async login() {
      try {
        const tokenData = await apiLogin({ name: 'xxx' })

        this.token = tokenData.token

        const { name, query } = router.currentRoute.value

        if (name === RouteName.home) return

        router.replace(
          (query.redirect as RouteLocationAsRelativeGeneric) || {
            name: RouteName.home
          }
        )
      } catch (error) {
        throw error
      }
    },
    async logout() {
      try {
        await apiLogout()

        resetRoutePermission(permission)

        this.token = ''
        this.user = null
      } catch (error) {
        throw error
      }
    },
    async getUser() {
      if (!this.token) return

      if (!this.user) {
        try {
          const userData = await apiGetUser({ name: 'haha' })

          this.user = userData

          this.isLogin = true

          switch (ROUTER_PERMISSION_TYPE) {
            case RouterPermission.DYNAMIC.valueOf():
              setRoutePermissionByDynamic(
                permission,
                this.user?.routes as unknown as RouteRecordRaw[]
              )
              break

            case RouterPermission.ROLE.valueOf():
              setRoutePermissionByRole(permission, this.user?.role as string)
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

      return this.user
    },
    async setUser(param: Record<string, any>) {
      const res = await apiSetUser(param)

      if (res.success) {
        this.user = res.data as User
      }
    },
    hasRoutePermission(name: string) {
      return this.isLogin && hasRoutePermissionUtil(permission, name)
    },
    toLogin() {
      const { name, fullPath } = router.currentRoute.value

      this.token = ''

      if (name === RouteName.login) return

      router.push({
        name: RouteName.login,
        query: { redirect: fullPath }
      })
    }
  },
  persist: {
    storage: localStorage,
    pick: ['token']
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
