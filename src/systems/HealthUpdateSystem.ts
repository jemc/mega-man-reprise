import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { Position } from "glazejs/src/glaze/core/components/Position"

import Health from "../components/Health"
import SpawnedBy from "../components/SpawnedBy"

export default class HealthUpdateSystem extends System {
  constructor() {
    super([Health, Active])
  }

  updateEntity(entity: Entity, health: Health, active: Active) {
    health.update(this.timestamp)

    // Handle death actions if the health has completely gone.
    if (health.isDead) {
      // Get the position (if there is one).
      const position: Position | undefined = this.engine.getComponentForEntity(
        entity,
        Position,
      )

      // Create the death action/animation if there is one.
      const { deathAction } = health.config
      if (deathAction && position)
        deathAction(this.engine, entity, position.clone())

      // Destroy the entity.
      const spawnedBy = this.engine.getComponentForEntity(entity, SpawnedBy)
      if (spawnedBy) spawnedBy.spawner.spawned = undefined
      this.engine.destroyEntity(entity)
    }
  }
}
