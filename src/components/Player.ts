interface PlayerConfig {
  // The usual height of the character's collision box.
  height: number

  // The usual width of the character's collision box.
  width: number

  // The maximum vertical speed (for jumping and falling).
  maxVerticalSpeed: number

  // The maximum horizontal speed when sliding.
  maxSlideSpeed: number

  // The maximum horizontal speed under normal circumstances.
  maxWalkSpeed: number

  // The speed at which walking animation will be shown.
  minWalkSpeed: number

  // The speed at which full walk force will be applied instead of step force,
  maxStepSpeed: number

  // The horizontal force applied when stepping (barely tapping left or right).
  stepForce: number

  // The horizontal force applied when walking.
  // This controls how quickly the player reaches the max walking speed.
  walkForce: number

  // The horizontal force applied when sliding.
  // This controls how quickly the player reaches the max sliding speed.
  slideForce: number

  // The number of milliseconds before automatically cancelling a slide.
  slideDurationMillis: number

  // The friction coefficient used to slow down the player when not moving with intent.
  stopFriction: number
}

export class Player {
  config: PlayerConfig
  constructor(config: PlayerConfig) {
    this.config = config
  }

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
