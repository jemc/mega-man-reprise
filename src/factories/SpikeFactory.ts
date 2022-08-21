import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Body } from "glazejs/src/glaze/physics/Body"
import { Fixed } from "glazejs/src/glaze/core/components/Fixed"
import { Active } from "glaze/core/components/Active"
import { GZE } from "glazejs/src/glaze/GZE"

import DamagesPlayerOnContact from "../components/DamagesPlayerOnContact"

export default class SpikeFactory {
  static create(engine: Engine, position: Position): Entity {
    const entity = engine.createEntity()

    // TODO: Remove body? is this unnecessary?
    const body = new Body()
    body.maxScalarVelocity = 0
    body.maxVelocity.setTo(0, 0)

    engine.addComponentsToEntity(entity, [
      position,
      new Extents(GZE.tileSize - 0.5, GZE.tileSize - 0.5),
      new PhysicsCollision(false, null as any, []),
      new PhysicsBody(body),
      new Fixed(),
      new Active(),
      new DamagesPlayerOnContact(Infinity),
    ])

    return entity
  }
}
