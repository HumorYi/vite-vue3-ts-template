import type { ApiOption } from '@/types/http'
import type { AxiosRequestConfig } from 'axios'

function getParam(obj: any) {
  if (!obj) return ''

  return JSON.stringify(
    Object.entries(typeof obj === 'string' ? JSON.parse(obj) : obj)
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
  )
}

//格式化请求链接
export function getReqKey(config: AxiosRequestConfig) {
  const { url, method, data, params } = config

  //记得这里一定要处理 每次请求都会变化的参数(比如每个请求都携带了时间戳),否则两个请求的key不一样
  return [url, method, getParam(data), getParam(params)].join('&')
}

// 创建存储 key 的 集合
const reqQueue = new Map()

export function reqRepeat(config: any, apiOption: ApiOption) {
  // 超时重试
  if (config.signal) return

  const key = getReqKey(config)
  const abortController = apiOption.abortController || new AbortController()

  config.signal = abortController.signal

  // 判断是否存在key 存在取消请求 不存在添加
  if (reqQueue.has(key)) {
    abortController.abort()

    return
  }

  //手动取消
  reqQueue.set(key, abortController)
}

export function reqRepeatByRes(config: any) {
  const key = getReqKey(config)

  if (reqQueue.has(key)) reqQueue.delete(key)
}

export const cancelAllReq = () => {
  reqQueue.forEach(ctrl => ctrl.abort())

  reqQueue.clear()
}
