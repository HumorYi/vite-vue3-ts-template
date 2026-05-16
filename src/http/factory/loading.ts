const map = new Map<string, number>()

export function startLoading(key: string) {
  const val = (map.get(key) || 0) + 1

  useLoadingStore().open(key)

  map.set(key, val)
}

export function stopLoading(key: string) {
  if (!map.has(key)) return

  const val = (map.get(key) || 0) - 1

  if (val === 0) {
    useLoadingStore().close(key)

    map.delete(key)
  } else {
    map.set(key, val)
  }
}
