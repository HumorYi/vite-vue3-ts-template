import axios from 'axios'
import factory from './factory'
import handleReqConfig from './factory/req-config'
import { handleResDataCode } from './factory/res-data-code'

export default function http(baseURL: string) {
  const instance = axios.create({
    // 基础地址
    baseURL,
    // 设置超时时间
    timeout: 10 * 1000,
    // 跨域时候允许携带凭证
    withCredentials: true
  })

  return factory(instance, {
    instanceReq: { handleReqConfig },
    instanceRes: { handleResData: handleResDataCode }
  })
}
