import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { Fixed } from "glazejs/src/glaze/core/components/Fixed"

import Enemy from "../../components/Enemy"
import GraphicsAnimation from "../../components/GraphicsAnimation"
import Health from "../../components/Health"
import createExplodeSimple from "../projectile/createExplodeSimple"

export default function (engine: Engine, spawner: Entity, position: Position) {
  const entity = engine.createEntity()

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(16, 16),
    new PhysicsCollision(false, null as any, []),
    new Graphics("block-shootable"),
    new GraphicsAnimation("block-shootable", "idle"),
    new Active(),
    new Fixed(),
    new Health({
      max: 1,
      receiveDamageDurationMillis: 100,
      deathAction: createExplodeSimple,
    }),
  ])

  return entity
}
