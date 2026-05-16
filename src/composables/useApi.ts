import { type Method } from 'axios'
import http from '@/http'
import type { ApiOption } from '@/types/http'

function factory(baseURL: string) {
  const instance = http(baseURL)

  function handle(method: Method = 'get', commonOption: ApiOption = {}) {
    return async <T>(
      url: string,
      params: Record<string, any> = {},
      apiOption?: ApiOption
    ) => {
      const { componentKey } = useApiComponent()

      const requestMethod = method as keyof typeof instance

      return await instance[requestMethod]<T>(url, params, {
        ...commonOption,
        ...apiOption,
        componentKey
      })
    }
  }

  return (option: ApiOption = {}) => ({
    get: handle('get', option),
    post: handle('post', option),
    put: handle('put', option),
    del: handle('delete', option)
  })
}

export const useApi = factory(import.meta.env.VITE_APP_API_BASE)
export const useApiOther = factory(import.meta.env.VITE_APP_API_BASE_OTHER)
