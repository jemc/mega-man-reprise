interface ChangesStatesOnPlayerProximityConfig {
  from: string
  to: string
  proximityX: number
  proximityY: number
  delay?: number
}

export default class ChangesStatesOnPlayerProximity {
  config: ChangesStatesOnPlayerProximityConfig
  timeSoFar: number

  constructor(config: ChangesStatesOnPlayerProximityConfig) {
    this.config = config
    this.timeSoFar = 0
  }
}
