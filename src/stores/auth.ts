import type { LoginBody, LoginRes } from '@/types/api/auth'
import auth from '@/api/auth'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const {
      login: loginApi,
      logout: logoutApi,
      refreshToken: refreshTokenApi
    } = auth()
    const router = useRouter()
    const route = useRoute()
    const { getUser, clear: clearUser } = useUserStore()

    const accessToken = ref('')
    const refreshToken = ref('')

    function clear() {
      accessToken.value = ''
      refreshToken.value = ''

      clearUser()
    }

    function getToken() {
      return accessToken.value
    }

    function setToken(data: LoginRes) {
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
    }

    async function login(params: LoginBody) {
      try {
        const res = await loginApi(params)

        if (!res?.success) return

        setToken(res.data)

        await getUser()

        router.replace(
          (route.query.redirect as string) || {
            path: '/'
          }
        )
      } catch (error) {
        throw error
      }
    }

    async function logout() {
      try {
        const res = await logoutApi()

        if (!res?.success) return

        clear()
      } catch (error) {
        throw error
      }
    }

    async function getRefreshToken() {
      if (!refreshToken.value) return

      const res = await refreshTokenApi(refreshToken.value)

      if (res.success) {
        setToken(res.data)

        return accessToken.value
      }
    }

    function toPage(path: string) {
      router.push({
        path,
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }

    function toLogin() {
      clear()

      toPage('/login')
    }

    function toForbidden() {
      toPage('/forbidden')
    }

    function toNotFound() {
      toPage('/not-found')
    }

    return {
      accessToken,
      refreshToken,
      setToken,
      getToken,
      clear,
      getRefreshToken,
      login,
      logout,
      toLogin,
      toForbidden,
      toNotFound
    }
  },
  { persist: true }
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
