import type { InternalAxiosRequestConfig } from 'axios'
import Qs from 'qs'

export default function handleReqConfig(config: InternalAxiosRequestConfig) {
  const { method, headers, data } = config

  if (method === 'post') {
    // headers['Content-Type'] 默认 application/json
    if (
      data &&
      typeof data !== 'string' &&
      data.constructor !== FormData &&
      headers['Content-Type'] === 'application/x-www-form-urlencoded'
    ) {
      // 格式化模式有三种：indices、brackets、repeat
      config.data = Qs.stringify(data, { arrayFormat: 'indices' })
    }

    if (data?.constructor === FormData) {
      headers['Content-Type'] = 'multipart/form-data'
    }
  }
}
