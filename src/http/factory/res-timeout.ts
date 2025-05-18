import type { AxiosInstance } from 'axios'

export default async function resTimeout(
  instance: AxiosInstance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  max = 3,
  increaseMs = 1000
) {
  if (!error?.config) {
    return Promise.reject(error)
  }

  const { config } = error

  if (!config._retryCount) {
    config._retryCount = 0
  }

  if (config._retryCount >= max) {
    return Promise.reject(error)
  }

  config._retryCount += 1

  config.timeout += increaseMs

  return instance(config)
}
