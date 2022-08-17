import { Engine } from "glaze/ecs/Engine"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Body } from "glazejs/src/glaze/physics/Body"
import { Moveable } from "glazejs/src/glaze/core/components/Moveable"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"

import GraphicsAnimation from "../../components/GraphicsAnimation"

export default function (engine: Engine, position: Position) {
  const entity = engine.createEntity()

  // TODO: Remove body or avoid velocity hack.
  const body = new Body()
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    position,
    new Extents(16, 12),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("met1"),
    new GraphicsAnimation("met1", "idle"),
    new Moveable(),
    new Active(),
  ])

  return entity
}
