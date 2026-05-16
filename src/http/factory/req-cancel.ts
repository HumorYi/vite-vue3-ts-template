import type { ApiOption } from '@/types/http'
import type { AxiosRequestConfig } from 'axios'
import { startLoading, stopLoading } from './loading'

// 创建存储 key 的 集合
const reqQueue = new Map<string, Record<string, any>>()

function getParam(obj: any) {
  if (!obj) return ''

  return JSON.stringify(
    Object.entries(typeof obj === 'string' ? JSON.parse(obj) : obj)
      .sort(([k1], [k2]) => k1.localeCompare(k2))
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
  )
}

function clearReq(queue: Record<string, any>, reason = '取消请求') {
  queue.abortController.abort(`${reason} canceled`)

  stopLoading(queue.loadingKey)
}

//格式化请求链接
export function getReqKey(config: AxiosRequestConfig) {
  const { url, method, data, params } = config

  // 记得这里一定要处理 每次请求都会变化的参数(比如每个请求都携带了时间戳),否则两个请求的key不一样
  return [url, method, getParam(data), getParam(params)].join('&')
}

export function reqRepeat(config: any, apiOption: ApiOption) {
  // 超时重试
  if (config.signal) return

  const { loadingKey = 'global', abortKey, componentKey } = apiOption
  const key = getReqKey(config)
  const abortController = new AbortController()

  config.signal = abortController.signal

  // 中断指定请求
  if (abortKey) {
    cancelReq(abortKey)
  }

  // 中断重复请求
  if (reqQueue.has(key)) {
    abortController.abort()

    return
  }

  if (loadingKey) {
    startLoading(loadingKey)
  }

  //手动取消
  reqQueue.set(key, { loadingKey, abortKey, componentKey, abortController })
}

export function reqRepeatByRes(config: any) {
  const key = getReqKey(config)

  const queue = reqQueue.get(key)

  if (!queue) return

  if (queue.loadingKey) {
    stopLoading(queue.loadingKey)
  }

  reqQueue.delete(key)
}

export const cancelReq = (abortKey: string, reason = '取消请求') => {
  if (!abortKey) return

  const keys: string[] = []

  reqQueue.forEach((queue, key) => {
    if (queue.abortKey === abortKey) {
      clearReq(queue, reason)

      keys.push(key)
    }
  })

  keys.forEach(key => reqQueue.delete(key))
}

export const cancelAllReq = (reason = '取消所有请求') => {
  reqQueue.forEach(queue => clearReq(queue, reason))

  reqQueue.clear()
}

export const cancelComponentAllReq = (
  componentKey: string,
  reason = '取消组件所有请求'
) => {
  if (!componentKey) return

  const keys: string[] = []

  reqQueue.forEach((queue, key) => {
    if (queue.componentKey === componentKey) {
      clearReq(queue, reason)

      keys.push(key)
    }
  })

  keys.forEach(key => reqQueue.delete(key))
}
