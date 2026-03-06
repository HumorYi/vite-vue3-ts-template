import type { AxiosRequestConfig } from 'axios'
import { getReqKey } from './req-repeat'

const resCache = new Map<string, { data: any; time: number }>()

export function addResCache(config: AxiosRequestConfig, data: any) {
  resCache.set(getReqKey(config), { data, time: Date.now() })
}

export function removeResCache(config: AxiosRequestConfig) {
  resCache.delete(getReqKey(config))
}

export function getResCache(config: AxiosRequestConfig) {
  return resCache.get(getReqKey(config))
}

export function hasResCache(config: AxiosRequestConfig) {
  return resCache.has(getReqKey(config))
}

export function isValidCache(config: AxiosRequestConfig, cacheTime: number) {
  const cache = getResCache(config)

  return cache ? Date.now() - cache.time < cacheTime : false
}

export function clearResCache() {
  resCache.clear()
}
