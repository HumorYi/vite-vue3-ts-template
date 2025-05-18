import { get, post } from '@/http'
import type { loginRes, User } from '@/types/api'

export async function login(params: object): Promise<loginRes> {
  return await post('/login', params)
}

export async function logout() {
  return await get('/logout')
}

export async function getUser(params: object): Promise<User> {
  return await get('/user', params, { fifo: true })
}

export async function setUser(params: object) {
  return await post('/user', params, { fifo: true })
}
