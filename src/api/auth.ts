import type { LoginRes } from '@/types/api/auth'

import { getPreUrl } from '@/utils/replace-caller-filename'

// 由于 useApi 内部引用了 useAuthStore，所以这里不能在顶部使用 useApi
export default function auth() {
  const { post } = useApi({ preUrl: getPreUrl() })

  async function login(params: Record<string, any>) {
    return await post<LoginRes>('/login', params)
  }

  async function logout() {
    return await post('/logout')
  }

  async function refreshToken(token: string) {
    return await post<LoginRes>('refresh-token', {}, {
      headers: { 'X-Refresh-Token': token }
    })
  }

  return {
    login,
    logout,
    refreshToken
  }
}
