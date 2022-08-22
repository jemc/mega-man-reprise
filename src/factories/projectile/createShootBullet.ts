import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Body } from "glazejs/src/glaze/physics/Body"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Moveable } from "glazejs/src/glaze/core/components/Moveable"
import { Extents } from "glazejs/src/glaze/core/components/Extents"
import { PhysicsCollision } from "glazejs/src/glaze/physics/components/PhysicsCollision"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"

import GraphicsAnimation from "../../components/GraphicsAnimation"
import DamagesPlayerOnContact from "../../components/DamagesPlayerOnContact"

export default function createShootBullet(
  engine: Engine,
  entity: Entity,
  position: Position,
  opts?: {
    shotSpeed?: number
    damageAmount?: number
    angleDegrees?: number
  },
) {
  const shotDir = position.direction.x
  const shotSpeed = opts?.shotSpeed ?? 300
  const damageAmount = opts?.damageAmount ?? 5
  const angleDegrees = opts?.angleDegrees ?? 0
  const angleRadians = angleDegrees * (Math.PI / 180)

  const body = new Body()
  body.globalForceFactor = 0
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(shotSpeed, shotSpeed)
  body.velocity.x = shotSpeed * Math.cos(-angleRadians) * shotDir
  body.velocity.y = shotSpeed * Math.sin(-angleRadians) * shotDir
  body.isBullet = true

  engine.addComponentsToEntity(engine.createEntity(), [
    position.clone(),
    new Extents(4, 4),
    new Graphics("shot"),
    new GraphicsAnimation("shot", "bullet"),
    new PhysicsBody(body, true),
    new PhysicsCollision(true, null as any, []),
    new DamagesPlayerOnContact(damageAmount),
    new Moveable(),
    new Active(),
  ])
}
