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
import { getToken } from '@/utils/token'

import LoadingTimer from './loading/timer'
import { reqRepeat, reqRepeatByRes } from './req-repeat'
import { handleResCode } from './res-error-code'
import { handleResDataCode, ResDataCode } from './res-data-code'
import resDownload from './res-download'
import resTimeout from './res-timeout'

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

      reqRepeat(config)

      // 有些第三方 api 需要做另外处理
      if (option?.handleReqConfig) option.handleReqConfig(config)

      return config
    },
    error => {
      console.error('请求错误:', error)

      reqRepeatByRes(error.config)

      loadingTimer.stop()

      return Promise.reject(error)
    }
  )
}

function handleInterceptRes<T>(instance: AxiosInstance, option?: ResOption) {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // console.log('response', response)

      reqRepeatByRes(response.config)

      loadingTimer.stop()

      return response as AxiosResponse
    },
    error => {
      console.error(error?.message)

      // 拦截掉重复请求的错误, 中断 promise 执行
      // if (axios.isCancel(error)) {
      //   return Promise.reject(error)
      // }

      if (error?.config) reqRepeatByRes(error.config)

      // 响应超时重试
      if (error?.message?.includes('timeout')) {
        return resTimeout(
          instance,
          error,
          option?.timeoutRetryMax,
          option?.timeoutRetryIncreaseMs
        ).catch(error => {
          loadingTimer.stop()

          return Promise.reject(error)
        })
      }

      // 针对 http 响应状态码做相应处理
      const statusCode = Number(
        error?.message?.replace('Request failed with status code ', '')
      )
      if (statusCode) {
        handleResCode(statusCode)
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

      resDownload(res)
    } else {
      const { status, data } = await instance<ApiResult<T>>(config)

      if (status !== 200) return

      // 前后端约定数据状态码，前端做出对应处理，例如：提示信息、再次确认
      if (Object.values(ResDataCode).some(val => val === data.code)) {
        return handleResDataCode(data)
      }

      return data
    }
  } catch (error) {
    throw error
  }
}

function genMethod(
  instance: AxiosInstance,
  method: Method,
  factoryOption: FactoryOption
) {
  return async <T>(url: string, params?: object, apiOption?: ApiOption) => {
    const token = getToken()
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

    const reslut =
      apiOption?.fifo || factoryOption?.fifo
        ? fifo()(
            () => handleReq<T>(instance, config, isDownload),
            apiOption?.fifoDelay || factoryOption?.fifoDelay
          )
        : handleReq<T>(instance, config, isDownload)

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
