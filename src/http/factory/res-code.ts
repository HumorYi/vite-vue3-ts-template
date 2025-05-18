import router from '@/router'
import { useUserStore } from '@/store/useUserStore'

export enum ResCode {
  // 请求成功
  SUCCESS = 200,
  // 未授权
  UNAUTHORIZED = 401,
  // 拒绝访问
  FORBIDDEN = 403,
  // 未找到
  NOT_FOUND = 404,
  // 内部服务器错误
  INTERNAL_SERVER_ERROR = 500
}

export function handleResCode(code: number) {
  if (code === ResCode.UNAUTHORIZED) {
    useUserStore().toLogin()

    return
  }

  if (
    [
      ResCode.FORBIDDEN,
      ResCode.NOT_FOUND,
      ResCode.INTERNAL_SERVER_ERROR
    ].includes(code)
  ) {
    router.push({
      name: code + '',
      query: { redirect: router.currentRoute.value.fullPath }
    })

    return
  }

  console.error('未知响应状态码:', code)
}
