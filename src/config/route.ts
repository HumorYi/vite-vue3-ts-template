/**
 * 路由命名规则：
 * 单页：大驼峰，示例：home => Home
 * 嵌套路由：root 表示 页名，其余为 子路由，名称为 页名大驼峰 + 子路由名大驼峰
 *  示例: settings: { root: '', base: '' } => settings: { root: 'Settings', base: 'SettingsBase' }
 */

import type { JsonObject } from '@/types/json'
import { capitalize } from 'lodash-es'

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
    advance: {
      root: '',
      base: '',
      other: ''
    }
  }
}

export enum RouterPermission {
  // 动态路由 / 动态角色
  DYNAMIC = 'dynamic',
  // 固定路由，多个角色
  ROLE = 'role',
  // 固定路由，单个角色，只需登录
  AUTH = 'auth'
}

export const ROUTER_PERMISSION_TYPE = RouterPermission.ROLE

function initRouteName(obj: JsonObject, parentKey: string = '') {
  for (const key in obj) {
    const currentKey = capitalize(key)

    if (typeof obj[key] === 'string') {
      if (!obj[key]) {
        obj[key] = parentKey + (key === 'root' ? '' : currentKey)
      }

      continue
    }

    initRouteName(obj[key] as JsonObject, parentKey + currentKey)
  }
}

if (!RouteName.home) initRouteName(RouteName)
