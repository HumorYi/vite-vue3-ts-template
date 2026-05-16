import type { UserRes } from '@/types/api/user'
import { getPreUrl } from '@/utils/replace-caller-filename'

const { get, post } = useApi({ preUrl: getPreUrl() })

export async function getUser(params?: Record<string, any>) {
  return await get<UserRes>('/base-info', params)
}

export async function setUser(params: Record<string, any>) {
  return await post<Partial<UserRes>>('/base-info', params)
}
