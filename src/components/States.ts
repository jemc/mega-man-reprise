interface StatesConfig {
  [name: string]: {
    minDuration?: number
    maxDuration?: number
    then?: string
  }
}

export default class States {
  config: StatesConfig
  current: string
  timeSoFar: number

  constructor(initial: string, config: StatesConfig) {
    this.config = config
    this.current = initial
    this.timeSoFar = 0
  }

  changeTo(next: string) {
    this.current = next
    this.timeSoFar = 0
  }

  get hasMinDurationElapsed() {
    const { minDuration } = this.config[this.current]!
    return this.timeSoFar >= (minDuration ?? 0)
  }
}
