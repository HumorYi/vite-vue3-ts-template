import type { InternalAxiosRequestConfig } from 'axios'

export type ApiResult<T> = {
  success: boolean
  code: number
  message: string
  data: T
}

export type ReqOption = {
  handleReqConfig?: (config: InternalAxiosRequestConfig) => void
}

export type ResOption = {
  // 超时重试最大次数，默认 3 次
  timeoutRetryMax?: number
  // 超时重试递增毫秒，默认 1000 毫秒。例如默认超时为5000，重试1次为6000，重试2次为7000，
  timeoutRetryIncreaseMs?: number
  // 处理响应数据，默认返回原始数据
  handleResData?: (data: ApiResult<any>) => void
}

export type FactoryOption = FactoryAndApiOption & {
  instanceReq?: ReqOption
  instanceRes?: ResOption
}

export type ApiOption = FactoryAndApiOption & {
  // 请求超时时间，默认 10 * 1000 毫秒
  timeout?: number
  // 请求头
  headers?: Record<string, string>
  // 请求地址前缀
  preUrl?: string
  // 中断请求 Key，用于 中断请求
  abortKey?: string
  // 组件 Key，用于 中断组件内所有请求
  componentKey?: string
  // 是否开启文件下载
  download?: boolean
}

type FactoryAndApiOption = {
  // 默认携带 token，不携带 传 false
  token?: boolean
  // 是否先进先出，即按照请求顺序返回，即使后面请求先完成也得等前面请求完成才会返回
  fifo?: boolean
  // 先进先出延迟毫秒
  fifoDelay?: number
  // 加载状态标识（多请求区分加载态），默认：'global'
  loadingKey?: string
  // 是否缓存
  cache?: boolean
  // 缓存时间 毫秒
  cacheTime?: number
}

export interface LoadingState {
  /** 全局加载状态（如页面级加载） */
  global: boolean
  /** 自定义 key 的加载状态（如按钮级加载），支持动态扩展 */
  [key: string]: boolean
}
