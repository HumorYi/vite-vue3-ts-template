import { get } from '@/http'

export async function getFile(params: object) {
  return await get('/download', params, { download: true })
}
