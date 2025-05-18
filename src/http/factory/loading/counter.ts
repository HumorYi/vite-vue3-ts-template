export default class Counter {
  count: number
  private _origin: number
  constructor(count = 0) {
    this.count = count
    this._origin = count
  }

  increase() {
    this.count++
  }

  decrease() {
    this.count--
  }

  reset() {
    this.count = this._origin
  }

  isReady() {
    return this.count === this._origin
  }

  isRunning() {
    return this.count !== this._origin
  }

  isFinished() {
    return this.count === this._origin
  }
}
