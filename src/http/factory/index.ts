import {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method
} from 'axios'

import type {
  ApiOption,
  ApiResult,
  FactoryOption,
  ReqOption,
  ResOption
} from '@/types/http'

import { fifo } from '@/utils/base'

import { reqRepeat, reqRepeatByRes } from './req-cancel'

import resDownload from './res-download'
import { handleResErrorCode } from './res-error-code-vue'
import resTimeout from './res-timeout'

import { addResCache, getResCacheData } from './res-cache'

function handleInterceptReq(instance: AxiosInstance, option?: ReqOption) {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 有些第三方 api 需要做另外处理
      if (option?.handleReqConfig) option.handleReqConfig(config)

      return config
    },
    err => {
      console.error('请求错误:', err)

      reqRepeatByRes(err.config)

      return Promise.reject(err)
    }
  )
}

function handleInterceptRes(instance: AxiosInstance, option?: ResOption) {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      reqRepeatByRes(response.config)

      return response
    },
    err => {
      console.error('响应错误:', err)

      // 响应超时重试，未超过重试最大次数，不应中断程序
      if (err.message?.includes('timeout')) {
        return resTimeout(
          instance,
          err,
          option?.timeoutRetryMax,
          option?.timeoutRetryIncreaseMs
        ).catch(error => {
          if (err.config) reqRepeatByRes(err.config)

          return Promise.reject(error)
        })
      }

      if (err.config) reqRepeatByRes(err.config)

      if (!window.navigator.onLine) {
        // console.err('网络连接失败')
      }

      // 针对 http 响应状态码做相应处理
      if (err.response) handleResErrorCode(err.response.status)

      return Promise.reject(err)
    }
  )
}

async function handleReq<T>(
  instance: AxiosInstance,
  config: AxiosRequestConfig,
  factoryOption: FactoryOption = {},
  apiOption: ApiOption = {}
) {
  const { download, cache, cacheTime } = {
    download: false,
    cache: false,
    cacheTime: 5 * 60 * 1000,
    ...factoryOption,
    ...apiOption
  }

  if (cache) {
    const data = getResCacheData(config, cacheTime)

    if (data) {
      if (download) {
        resDownload(data)

        return
      }

      return data
    }
  }

  reqRepeat(config, apiOption)

  if (download) {
    const res = await instance<BlobPart>(config)

    resDownload(res)

    if (cache) addResCache(config, res)

    return
  }

  const { status, data } = await instance<ApiResult<T>>(config)

  if (status !== 200) return

  if (cache) addResCache(config, data)

  return factoryOption?.instanceRes?.handleResData?.(data) || data
}

function genMethod(
  instance: AxiosInstance,
  method: Method,
  factoryOption: FactoryOption = {}
) {
  return async <T>(
    url: string,
    params: Record<string, any> = {},
    apiOption: ApiOption = {}
  ) => {
    const option = { preUrl: '', ...factoryOption, ...apiOption }
    const config: AxiosRequestConfig = {
      url: option.preUrl + url,
      method,
      headers: option.headers || {}
    }
    const token = useAuthStore().getToken()
    const lowerMethod = method.toLowerCase()

    if (['get', 'del'].includes(lowerMethod)) {
      config.params = params
    } else if (['post', 'put'].includes(lowerMethod)) {
      config.data = params
    }

    if (option.timeout) {
      config.timeout = option.timeout
    }

    if (option.download) {
      config.responseType = 'arraybuffer'
    }

    if (option.token && token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    }

    function handle() {
      return handleReq<T>(instance, config, factoryOption, apiOption)
    }

    const result = option.fifo ? fifo()(handle, option.fifoDelay) : handle()

    return result as unknown as ApiResult<T>
  }
}

function factory(instance: AxiosInstance, option?: FactoryOption) {
  handleInterceptReq(instance, option?.instanceReq)

  handleInterceptRes(instance, option?.instanceRes)

  return {
    get: genMethod(instance, 'get', option),
    post: genMethod(instance, 'post', option),
    put: genMethod(instance, 'put', option),
    del: genMethod(instance, 'delete', option)
  }
}

export default factory
