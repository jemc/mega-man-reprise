import { Engine } from "glazejs/src/glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glazejs/src/glaze/core/components/Position"

interface SpawnOnCameraArrivalConfig {
  marginX?: number
  marginY?: number
  spawnAction: (engine: Engine, spawner: Entity, position: Position) => Entity
}

export default class SpawnOnCameraArrival {
  config: SpawnOnCameraArrivalConfig
  spawned?: Entity
  readyToSpawn = true

  constructor(config: SpawnOnCameraArrivalConfig) {
    this.config = config
  }
}
