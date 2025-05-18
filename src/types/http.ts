import type { InternalAxiosRequestConfig } from 'axios'

export type ApiResult<T> = {
  code: number
  message: string
  data: T
}

export type LoadingOption = {
  mountDom?: HTMLElement
  id?: string
  type?: string
  className?: string
  message?: string
}

export type LoadingTimerOption = {
  hide?: boolean
  delay?: number
  loading?: LoadingOption
}

export type ApiOption = FactoryAndApiOption & {
  // 单个请求超时
  timeout?: number
  // 文件下载，传 true
  download?: boolean
}

export type ReqOption = {
  handleReqConfig?: (config: InternalAxiosRequestConfig) => void
}

export type ResOption = {
  // 超时重试最大次数，默认 3 次
  timeoutRetryMax?: number
  // 超时重试递增毫秒，默认 1000 毫秒。例如默认超时为5000，重试1次为6000，重试2次为7000，
  timeoutRetryIncreaseMs?: number
}

export type FactoryOption = FactoryAndApiOption & {
  instanceReq?: ReqOption
  instanceRes?: ResOption
}

type FactoryAndApiOption = {
  // 默认携带 token，不携带 传 false
  token?: boolean
  // 是否先进先出，即按照请求顺序返回，即使后面请求先完成也得等前面请求完成才会返回
  fifo?: boolean
  // 先进先出延迟毫秒
  fifoDelay?: number
  // loading 定时器选项，用于控制 loading 执行时机 和 对应选项
  loadingTimerOption?: LoadingTimerOption
}
