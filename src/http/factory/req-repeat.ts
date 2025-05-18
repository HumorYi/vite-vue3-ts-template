import type { AxiosRequestConfig } from 'axios'

//格式化请求链接
function getReqKey(config: AxiosRequestConfig) {
  const { url, method, data, params } = config

  //记得这里一定要处理 每次请求都掉会变化的参数(比如每个请求都携带了时间戳),否则二个请求的key不一样
  return [
    url,
    method,
    JSON.stringify(data) || '',
    JSON.stringify(params) || ''
  ].join('&')
}

// 创建存储 key 的 集合
export const reqQueue = new Map()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reqRepeat(config: any) {
  // 超时重试
  if (config._reqKey) return

  const key = getReqKey(config)

  //判断是否存在key 存在取消请求 不存在添加
  if (reqQueue.has(key)) {
    const controller = new AbortController()

    config.signal = controller.signal

    controller.abort()

    return
  }

  config._reqKey = key

  //手动取消
  reqQueue.set(key, true)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reqRepeatByRes(config: any) {
  reqQueue.delete(config._reqKey)
}
