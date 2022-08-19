import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"

import Health from "../components/Health"

export default class HealthUpdateSystem extends System {
  constructor() {
    super([Health, Active])
  }

  updateEntity(entity: Entity, health: Health, active: Active) {
    health.update(this.timestamp)
  }
}
