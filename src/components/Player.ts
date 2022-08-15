export class Player {
  startedSlidingAt?: number

  get isSliding() {
    return this.startedSlidingAt !== undefined
  }

  startSliding(timestamp: number) {
    this.startedSlidingAt = timestamp
  }

  stopSliding() {
    delete this.startedSlidingAt
  }

  shotAt?: number

  isShootingNow(timestamp: number) {
    return this.shotAt && this.shotAt > timestamp - 250
  }

  shootNow(timestamp: number) {
    this.shotAt = timestamp
  }
}
