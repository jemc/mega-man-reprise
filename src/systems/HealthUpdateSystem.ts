import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"

import Health from "../components/Health"

export default class HealthUpdateSystem extends System {
  constructor() {
    super([Health, Active])
  }

  updateEntity(entity: Entity, health: Health, active: Active) {
    health.update(this.timestamp)

    // Handle death actions if the health has completely gone.
    if (health.isDead) {
      // Make the sprite invisible.
      const graphics: Graphics | undefined = this.engine.getComponentForEntity(
        entity,
        Graphics,
      )
      if (graphics) graphics.sprite.alpha = 0

      // Set the position to static (stopping all movement).
      const position: Position | undefined = this.engine.getComponentForEntity(
        entity,
        Position,
      )
      const physicsBody: PhysicsBody | undefined =
        this.engine.getComponentForEntity(entity, PhysicsBody)
      if (position && physicsBody)
        physicsBody.body.setStaticPosition(position.coords.x, position.coords.y)

      // Deactivate the entity (by removing its Active component).
      this.engine.removeComponentsFromEntityByType(entity, [Active])

      // Create the death action/animation if there is one.
      const { deathAction } = health.config
      if (deathAction && position)
        deathAction(this.engine, entity, position.clone())
    }
  }
}
