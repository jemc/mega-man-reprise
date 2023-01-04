import { Engine } from "glazejs/src/glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glazejs/src/glaze/core/components/Position"

interface StatesConfig {
  [name: string]: {
    animation?: string
    minDuration?: number
    maxDuration?: number
    waitUntilSlowerThan?: number
    then?: string
    startAction?: (engine: Engine, entity: Entity, position: Position) => void
    deflectsBullets?: boolean
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

  get currentAnimation() {
    const { animation } = this.config[this.current]!
    return animation ?? this.current
  }

  get hasMinDurationElapsed() {
    const { minDuration } = this.config[this.current]!
    return this.timeSoFar >= (minDuration ?? 0)
  }
}
