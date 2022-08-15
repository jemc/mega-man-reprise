import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Extents } from "glazejs/src/glaze/core/components/Extents"

// A Climber component is attached to anything that is capable of climbing.
export default class Climber {
  config: ClimberConfig
  constructor(config: ClimberConfig) {
    this.config = config
  }

  nearClimbable?: [Entity, Position, Extents]

  wantsUp = false
  wantsDown = false
}

export interface ClimberConfig {
  // The vertical speed at which the climber goes up or down.
  climbSpeed: number
}
