import router from '@/router'

export enum ResErrorCode {
  // 未授权
  UNAUTHORIZED = 401,
  // 拒绝访问
  FORBIDDEN = 403,
  // 未找到
  NOT_FOUND = 404,
  // 内部服务器错误
  INTERNAL_SERVER_ERROR = 500
}

export function handleResErrorCode(code: number) {
  const authStore = useAuthStore()

  if (code === ResErrorCode.UNAUTHORIZED) {
    authStore.toLogin()

    return
  }

  if (code === ResErrorCode.FORBIDDEN) {
    authStore.toForbidden()

    return
  }

  if (code === ResErrorCode.NOT_FOUND) {
    authStore.toNotFound()

    return
  }

  console.error('未知响应状态码:', code)
}
