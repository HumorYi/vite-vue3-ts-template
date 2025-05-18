import { get, post } from '@/http'
import type { loginRes, User } from '@/types/api'

export async function apiLogin(params: object): Promise<loginRes> {
  return await post('/login', params)
}

export async function apiLogout() {
  return await get('/logout')
}

export async function apiGetUser(params: object): Promise<User> {
  return await get('/user', params, { fifo: true })
}

export async function apiSetUser(params: object) {
  return await post('/user', params, { fifo: true })
}
