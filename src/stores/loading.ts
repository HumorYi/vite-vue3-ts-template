import type { LoadingState } from '@/types/http'

export const useLoadingStore = defineStore('loading', () => {
  const state = reactive<LoadingState>({ global: false })

  const open = (key = 'global') => {
    state[key] = true
  }

  const close = (key = 'global') => {
    state[key] = false
  }

  const clear = () => {
    Object.keys(state).forEach(k => close(k))
  }

  return { state, open, close, clear }
})
