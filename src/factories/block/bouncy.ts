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
import { ContactCallback } from "glazejs/src/glaze/physics/collision/contact/Contact"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"
import States from "../../components/States"

export default function (engine: Engine, spawner: Entity, position: Position) {
  const entity = engine.createEntity()

  const onContact: ContactCallback = (a, b, contact) => {
    const force = a.aabb.position.clone()
    force.minusEquals(b.aabb.position)
    force.normalize()
    force.minusEquals(contact.normal)
    force.normalize()
    force.multEquals(-10)

    const states = engine.getComponentForEntity(a.entity, States)
    if (states) {
      states.changeTo("wobble")
    }

    b.body.addProportionalForce(force)
  }

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(16, 16),
    new PhysicsCollision(false, null as any, [onContact]),
    new Graphics("block-bouncy"),
    new GraphicsAnimation("block-bouncy", "idle"),
    new Active(),
    new Fixed(),
    new States("idle", {
      idle: {},
      wobble: { maxDuration: 500, then: "idle" },
    }),
  ])

  return entity
}
