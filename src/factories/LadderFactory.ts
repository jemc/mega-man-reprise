import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Body } from "glazejs/src/glaze/physics/Body"
import { Fixed } from "glazejs/src/glaze/core/components/Fixed"
import { Active } from "glaze/core/components/Active"

import Climbable from "../components/Climbable"

export default class LadderFactory {
  static create(engine: Engine, position: Position, extents: Extents): Entity {
    const ladder = engine.createEntity()

    // TODO: Remove body? is this unnecessary?
    const body = new Body()
    body.maxScalarVelocity = 0
    body.maxVelocity.setTo(0, 0)

    engine.addComponentsToEntity(ladder, [
      position,
      extents,
      new PhysicsCollision(true, null as any, []),
      new PhysicsBody(body),
      new Fixed(),
      new Active(),
      new Climbable(),
    ])

    return ladder
  }
}
