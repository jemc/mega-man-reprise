import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"

import enemyMet1 from "./enemy/met1"
import enemyTurret1 from "./enemy/turret1"
import enemyTurret2 from "./enemy/turret2"

export default class SpawnFactory {
  static create(engine: Engine, kind: string, position: Position): Entity {
    switch (kind) {
      case "enemy-met1":
        return enemyMet1(engine, position)
      case "enemy-turret1":
        return enemyTurret1(engine, position)
      case "enemy-turret2":
        return enemyTurret2(engine, position)
      default:
        throw new Error(`Unknown spawn kind: ${kind}`)
    }
  }
}
