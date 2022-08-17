interface FollowsPlayerConfig {
  moveX?: boolean
  moveY?: boolean
  lookX?: boolean
  lookHysteresis?: number
}

export default class FollowsPlayer {
  config: FollowsPlayerConfig
  constructor(config: FollowsPlayerConfig) {
    this.config = config
  }
}
