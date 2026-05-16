// 如果需要添加新的 function useLangPageX(path = getCallerFilename())
// plugins/vite-plugin-replace-caller-filename.ts 中添加对应的规则

import { useI18n } from 'vue-i18n'
import { getCallerFilename } from '@/utils/replace-caller-filename'

type Lang = (path: string) => string

export function useLang(root: string) {
  const { t } = useI18n()

  return (path: string) => t(`${root}.${path}`)
}

export const useLangCommon = () => useLang(`common`)

export const useLangSite = () => useLang(`site`)

export const useLangMessage = () => useLang(`message`)

export const useLangPageMessage = (lang: Lang) => (path: string) =>
  lang(`message.${path}`)

export const useLangPage = (path = getCallerFilename()) =>
  useLang(`pages.${path}`)

export const useLangAuthPage = (path = getCallerFilename()) =>
  useLangPage(`(auth).${path}`)

export const useLangAuthPermissionPage = (path = getCallerFilename()) =>
  useLangAuthPage(`(permission).${path}`)

export const useLangLayout = (path = getCallerFilename()) =>
  useLang(`layouts.${path}`)

export const useLangComponent = (path = getCallerFilename()) =>
  useLang(`components.${path}`)

// 业务相关提示文案 S
export const useLangAdminPage = (path = getCallerFilename()) =>
  useLangAuthPermissionPage(`(admin).${path}`)
export const useLangFinancePage = (path = getCallerFilename()) =>
  useLangAdminPage(`(finance).${path}`)

export const useLangUserPage = () => useLangAuthPermissionPage(`user`)
// 业务相关提示文案 E
