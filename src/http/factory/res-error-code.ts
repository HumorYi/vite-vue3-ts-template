import router from '@/router'
import errorRoutes from '@/router/routes/error'
import { useUserStore } from '@/store/useUserStore'

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

export function handleResCode(code: number) {
  if (code === ResErrorCode.UNAUTHORIZED) {
    useUserStore().toLogin()

    return
  }

  if (errorRoutes.some(route => route.name === String(code))) {
    router.push({
      name: String(code),
      query: { redirect: router.currentRoute.value.fullPath }
    })

    return
  }

  console.error('未知响应状态码:', code)
}
