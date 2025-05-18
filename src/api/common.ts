import { get } from '@/http'

export async function apiGetFile(params: object) {
  return await get('/download', params, { download: true })
}
