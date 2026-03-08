import { get, post } from '@/http'
import type { loginRes, User } from '@/types/api/user'
import type { ApiOption } from '@/types/http'

export async function apiLogin(params: Record<string, any>) {
  return await post<loginRes>('/login', params)
}

export async function apiLogout() {
  return await get('/logout')
}

export async function apiGetUser(params?: Record<string, any>) {
  return await get<User>('/user', params, { cache: true })
}

export async function apiSetUser(params: Record<string, any>, option?: ApiOption) {
  return await post<Partial<User>>('/user', params, option)
}
