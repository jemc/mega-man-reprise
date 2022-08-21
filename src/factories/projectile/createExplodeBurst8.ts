import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"

import GraphicsAnimation from "../../components/GraphicsAnimation"
import { Body } from "glazejs/src/glaze/physics/Body"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Moveable } from "glazejs/src/glaze/core/components/Moveable"

export default function createExplodeBurst8(
  engine: Engine,
  entity: Entity,
  position: Position,
) {
  const explosionSpeed = 84

  for (let i = 0; i < 8; i++) {
    const body = new Body()
    body.isBullet = true
    body.maxScalarVelocity = 0
    body.globalForceFactor = 0
    body.maxVelocity.setTo(explosionSpeed, explosionSpeed)
    body.velocity.x = explosionSpeed * Math.sin((i * Math.PI) / 4)
    body.velocity.y = explosionSpeed * Math.cos((i * Math.PI) / 4)

    engine.addComponentsToEntity(engine.createEntity(), [
      position.clone(),
      new Graphics("explode"),
      new GraphicsAnimation("explode", "main"),
      new PhysicsBody(body, true),
      new Moveable(),
      new Active(),
    ])
  }
}
