import axios from 'axios'
import factory from './factory'
import handleReqConfig from './factory/req-config'

const instance = axios.create({
  // 默认地址
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 设置超时时间
  timeout: 5000,
  // 跨域时候允许携带凭证
  withCredentials: true
})

export const { get, post, put, del } = factory(instance, {
  instanceReq: { handleReqConfig }
})
