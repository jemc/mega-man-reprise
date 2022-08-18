import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"

import Health from "../components/Health"

export default class HealthUpdateSystem extends System {
  constructor() {
    super([Health])
  }

  updateEntity(entity: Entity, health: Health) {
    health.update(this.timestamp)
  }
}
