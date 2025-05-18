// First In, First Out
export function fifo () {
  let counterSize = 0
  let lastCounter = 0

  function handleCurrent(counter: number) {
    const isCurrent = counter === lastCounter

    if (isCurrent) {
      lastCounter++

      if (lastCounter === counterSize) {
        lastCounter = 0
        counterSize = 0
      }
    }

    return isCurrent
  }

  return async <T>(func: () => T, delay = 500) => {
    const counter = counterSize

    counterSize++

    return new Promise<T>(async (resolve, reject) => {
      try {
        const response = await func()

        if (handleCurrent(counter)) return resolve(response)

        // 只有提前返回的请求才需要轮询
        const timer = setInterval(() => {
          if (handleCurrent(counter)) {
            clearInterval(timer)

            resolve(response)
          }
        }, delay)
      } catch (error) {
        reject(error)
      }
    })
  }
}
