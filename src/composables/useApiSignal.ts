// 通过给 api 传递 singal 配置，在组件卸载时中断请求
export function useApiSignal() {
  const controller = new AbortController()

  onUnmounted(() => controller.abort())

  return { signal: controller.signal }
}
