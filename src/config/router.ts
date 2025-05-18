/**
 * 路由命名规则：
 * 单页：大驼峰，示例：home => Home
 * 嵌套路由：root 表示 页名，其余为 子路由，名称为 页名大驼峰 + 子路由名大驼峰
 *  示例: settings: { root: '', base: '' } => settings: { root: 'Settings', base: 'SettingsBase' }
 */

import type { JsonObject } from '@/types/json'
import { capitalize } from 'lodash-es'

export enum RouterPermission {
  // 动态路由 / 动态角色
  DYNAMIC = 'dynamic',
  // 固定路由，多个角色
  ROLE = 'role',
  // 固定路由，单个角色，只需登录
  AUTH = 'auth'
}

export const ROUTER_PERMISSION_TYPE = RouterPermission.ROLE

export const RouteName = {
  home: '',
  login: '',
  settings: {
    root: '',
    base: '',
    advance: {
      root: '',
      base: '',
      other: ''
    }
  },
  user: {
    root: '',
    base: '',
    advance: ''
  },
  error: {
    403: '',
    404: '',
    405: ''
  }
}

function initRouteName(obj: JsonObject, parentKey?: string) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      if (parentKey) {
        obj[key] =
          capitalize(parentKey) + (key === 'root' ? '' : capitalize(key))
      } else {
        obj[key] = capitalize(key)
      }

      continue
    }

    if (key !== 'error') initRouteName(obj[key] as JsonObject, key)
  }
}

initRouteName(RouteName)
