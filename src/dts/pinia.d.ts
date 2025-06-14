import { PiniaPluginContext } from 'pinia'
export interface PersistStrategy {
  key?: string
  storage?: Storage
  paths?: string[]
}
export interface PersistOptions {
  enabled: true
  strategies?: PersistStrategy[]
}
declare type Store = PiniaPluginContext['store']
declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions
  }
}
export declare const updateStorage: (
  strategy: PersistStrategy,
  store: Store
) => void
declare const _default: ({ options, store }: PiniaPluginContext) => void
export default _default
