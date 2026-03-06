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

export function reqRepeat(config: any) {
  // 超时重试
  if (config._reqKey) return

  const key = getReqKey(config)
  const controller = new AbortController()

  config.signal = controller.signal

  // 判断是否存在key 存在取消请求 不存在添加
  if (reqQueue.has(key)) {
    controller.abort()

    return
  }

  config._reqKey = key

  //手动取消
  reqQueue.set(key, controller)
}

export function reqRepeatByRes(config: any) {
  reqQueue.delete(getReqKey(config))
}

export const cancelAllReq = () => {
  reqQueue.forEach(ctrl => ctrl.abort())

  reqQueue.clear()
}
