import type { RouteLocationAsRelativeGeneric } from 'vue-router'

import { RouteName } from '@/config/router'
import router from '@/router'

export function useAuth() {
  const token = ref(localStorage.getItem('token') || '')

  function login() {
    const { name, query } = router.currentRoute.value

    if (name === RouteName.home) return

    router.replace(
      (query.redirect as RouteLocationAsRelativeGeneric) || {
        name: RouteName.home
      }
    )
  }

  function logout() {
    tokenInvalid()
  }

  function toLogin() {
    const { name, fullPath } = router.currentRoute.value

    tokenInvalid()

    if (name === RouteName.login) return

    router.push({
      name: RouteName.login,
      query: { redirect: fullPath }
    })
  }

  function hasToken() {
    return Boolean(token.value)
  }

  function setToken(val = '') {
    token.value = val

    localStorage.setItem('token', val)
  }

  function tokenInvalid() {
    if (!token.value) return

    setToken()
  }

  return { login, logout, toLogin, setToken, hasToken }
}
