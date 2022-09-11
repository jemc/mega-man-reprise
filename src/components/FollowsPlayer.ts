interface FollowsPlayerConfig {
  moveX?: boolean
  moveY?: boolean
  lookX?: boolean
  lookHysteresis?: number
  walkX?: boolean
  walkHysteresis?: number
  climbY?: boolean
  climbHysteresis?: number
}

export default class FollowsPlayer {
  config: FollowsPlayerConfig
  constructor(config: FollowsPlayerConfig) {
    this.config = config
  }
}
