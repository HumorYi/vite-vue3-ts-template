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
import { getToken } from '@/utils/token'

import LoadingTimer from './loading/timer'

import { reqRepeat, reqRepeatByRes } from './req-repeat'

import { handleResErrorCode } from './res-error-code'
import { handleResDataCode, ResDataCode } from './res-data-code'
import resDownload from './res-download'
import resTimeout from './res-timeout'

import {
  addResCache,
  removeResCache,
  getResCache,
  hasResCache,
  isValidCache
} from './res-cache'

const loadingTimer = new LoadingTimer()

function handleInterceptReq(instance: AxiosInstance, option?: ReqOption) {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      reqRepeat(config)

      // 有些第三方 api 需要做另外处理
      if (option?.handleReqConfig) option.handleReqConfig(config)

      return config
    },
    err => {
      console.error('请求错误:', err)

      reqRepeatByRes(err.config)

      loadingTimer.stop()

      return Promise.reject(err)
    }
  )
}

function handleInterceptRes(instance: AxiosInstance, option?: ResOption) {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      reqRepeatByRes(response.config)

      loadingTimer.stop()

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
        ).catch(err => {
          loadingTimer.stop()

          return Promise.reject(err)
        })
      }

      reqRepeatByRes(err.config)

      loadingTimer.stop()

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
  try {
    const { download, cache, cacheTime, loadingTimerOption } = {
      download: false,
      cache: false,
      cacheTime: 5 * 60 * 1000,
      ...factoryOption,
      ...apiOption
    }

    if (cache && hasResCache(config)) {
      const cacheItem = getResCache(config)

      if (cacheItem && isValidCache(config, cacheTime)) return cacheItem.data

      removeResCache(config)
    }

    loadingTimer.start(loadingTimerOption)

    if (download) {
      const res = await instance<BlobPart>(config)

      resDownload(res)

      return
    }

    const { status, data } = await instance<ApiResult<T>>(config)

    if (status !== 200) return

    if (cache) addResCache(config, data)

    // 前后端约定数据状态码，前端做出对应处理，例如：提示信息、再次确认
    if (Object.values(ResDataCode).some(val => val === data.code)) {
      return handleResDataCode(data)
    }

    return data
  } catch (err) {
    throw err
  }
}

function genMethod(
  instance: AxiosInstance,
  method: Method,
  factoryOption: FactoryOption
) {
  return async <T>(
    url: string,
    params: Record<string, any> = {},
    apiOption: ApiOption = {}
  ) => {
    const token = getToken()
    const config: AxiosRequestConfig = {
      method,
      url,
      timeout: apiOption.timeout,
      responseType: apiOption.download ? 'arraybuffer' : undefined,
      headers:
        (apiOption.token || factoryOption.token) !== false && token
          ? { Authorization: `Bearer ${token}` }
          : undefined
    }

    if (['get', 'del'].includes(method)) {
      config.params = params
    } else if (['post', 'put'].includes(method)) {
      config.data = params
    }

    const reslut =
      apiOption.fifo || factoryOption.fifo
        ? fifo()(
            () => handleReq<T>(instance, config, factoryOption, apiOption),
            apiOption.fifoDelay || factoryOption.fifoDelay
          )
        : handleReq<T>(instance, config, factoryOption, apiOption)

    return reslut as unknown as ApiResult<T>
  }
}

function factory<T>(instance: AxiosInstance, option: FactoryOption) {
  handleInterceptReq(instance, option.instanceReq)

  handleInterceptRes(instance, option.instanceRes)

  return {
    get: genMethod(instance, 'get', option),
    post: genMethod(instance, 'post', option),
    put: genMethod(instance, 'put', option),
    del: genMethod(instance, 'delete', option)
  }
}

export default factory
