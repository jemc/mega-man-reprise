import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"

import States from "../components/States"
import Health from "../components/Health"

export default class StatesHealthSystem extends System {
  constructor() {
    super([States, Health, Active])
  }

  updateEntity(entity: Entity, states: States, health: Health, active: Active) {
    const { deflectsBullets } = states.config[states.current]!

    health.currentlyDeflectsBullets = deflectsBullets ?? false
  }
}
