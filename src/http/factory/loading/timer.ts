import type { LoadingTimerOption } from '@/types/http'
import Counter from './counter'
import Loading from './loading'

export default class Timer {
  timer: string | number | NodeJS.Timeout | undefined
  startTime = 0
  delay = 0
  hide = false
  counter: Counter
  loading: Loading

  constructor(delay = 300) {
    this.counter = new Counter()
    this.loading = new Loading()

    this.delay = delay
  }

  start(timerOption?: LoadingTimerOption) {
    if (timerOption?.hide) {
      this.hide = true

      return
    }

    if (timerOption?.delay) {
      this.delay = timerOption.delay
    }

    if (this.counter.isReady()) {
      this.startTime = new Date().getTime()

      this.timer = setTimeout(() => {
        if (this.counter.isRunning()) this.loading.open(timerOption?.loading)
      }, this.delay)
    }

    this.counter.increase()
  }

  stop() {
    if (this.hide) {
      this.hide = false

      return
    }

    this.counter.decrease()

    if (this.counter.isFinished()) {
      if (this.isOpen()) this.loading.close()

      clearInterval(this.timer)
    }
  }

  isOpen() {
    return Date.now() - this.startTime > this.delay
  }
}
