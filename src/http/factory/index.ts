import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  Method
} from 'axios'

import type {
  ApiOption,
  ApiResult,
  FactoryOption,
  ReqOption,
  ResOption
} from '@/types/http'
import { fifo } from '@/utils/base'
import LoadingTimer from './loading/timer'
import { handleReqRepeat, handleReqRepeatByRes } from './req-repeat'
import { handleResCode, ResCode } from './res-code'
import { resTimeoutRetry } from './res-timeout'
import download from './download'

/**
 * 注意：
 *
 * 中断重复请求只能在请求处中断掉
 *  不 reject 调用代码就会执行，没有响应数据程序逻辑无法往下走，就会出错
 *  reject 调用代码就会中断，前面请求成功也不会执行，除非 catch 忽略报错，这样就进入为了处理而过度处理的困境
 *  为避免此弊端，
 *    一方面是阻止用户反复点击触发请求，防抖、节流或使用 蒙板 Loading（推荐）
 *    一方面是编码时在外部包一层处理异常函数，如果不是 axios.isCancel(error) 再抛出错误，可能不太适应编码习惯
 */
const loadingTimer = new LoadingTimer()

function handleInterceptReq(instance: AxiosInstance, option?: ReqOption) {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // console.log('req config', config)

      handleReqRepeat(config)

      // 有些第三方 api 需要做另外处理
      if (option?.handleReqConfig) option.handleReqConfig(config)

      return config
    },
    error => {
      console.error('请求错误:', error)

      handleReqRepeatByRes(error.config)

      loadingTimer.stop()

      return Promise.reject(error)
    }
  )
}

function handleInterceptRes(instance: AxiosInstance, option?: ResOption) {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // console.log('response', response)

      handleReqRepeatByRes(response.config)

      loadingTimer.stop()

      return response
    },
    error => {
      console.error('响应错误:', error)

      // 拦截掉重复请求的错误, 中断 promise 执行
      // if (axios.isCancel(error)) {
      //   return Promise.reject(error)
      // }

      if (error?.config) handleReqRepeatByRes(error.config)

      if (error?.message?.includes('timeout')) {
        return resTimeoutRetry(
          instance,
          error,
          option?.timeoutRetryMax,
          option?.timeoutRetryIncreaseMs
        ).catch(error => {
          loadingTimer.stop()

          return Promise.reject(error)
        })
      }

      loadingTimer.stop()

      if (!window.navigator.onLine) {
        // console.error('网络连接失败')
      }

      return Promise.reject(error)
    }
  )
}

async function handleReq<T>(
  instance: AxiosInstance,
  config: AxiosRequestConfig,
  isDownload?: boolean
) {
  try {
    if (isDownload) {
      const res = await instance<BlobPart>(config)

      download(res)
    } else {
      const { data } = await instance<ApiResult<T>>(config)

      if (data.code === ResCode.SUCCESS) return data.data
      else handleResCode(data.code)
    }

    return undefined as T
  } catch (error) {
    throw error
  }
}

function genMethod(
  instance: AxiosInstance,
  method: Method,
  factoryOption: FactoryOption
) {
  return async <T>(
    url: string,
    params?: object,
    apiOption?: ApiOption
  ): Promise<T> => {
    const token = localStorage.getItem('token') || ''
    const isDownload = apiOption?.download
    const config: AxiosRequestConfig = {
      method,
      url,
      timeout: apiOption?.timeout,
      responseType: isDownload ? 'arraybuffer' : undefined,
      headers:
        (apiOption?.token || factoryOption?.token) !== false && token
          ? { Authorization: `Bearer ${token}` }
          : undefined
    }

    if (['get', 'del'].includes(method)) {
      config.params = params
    } else if (['post', 'put'].includes(method)) {
      config.data = params
    }

    loadingTimer.start(
      apiOption?.loadingTimerOption || factoryOption?.loadingTimerOption
    )

    return apiOption?.fifo || factoryOption?.fifo
      ? fifo()(
          () => handleReq<T>(instance, config, isDownload),
          apiOption?.fifoDelay || factoryOption?.fifoDelay
        )
      : handleReq<T>(instance, config, isDownload)
  }
}

function factory(instance: AxiosInstance, option: FactoryOption) {
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
