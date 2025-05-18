declare module 'pinia-plugin-persist' {
  import { PiniaPlugin } from 'pinia'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PersistOptions {
    key?: string
    storage?: Storage
    paths?: string[]
    // 其他配置选项...
  }

  const piniaPluginPersist: PiniaPlugin
  export default piniaPluginPersist
}
